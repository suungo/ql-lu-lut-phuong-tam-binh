"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdministrativeService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const province_entity_1 = require("./entities/province.entity");
const ward_entity_1 = require("./entities/ward.entity");
let AdministrativeService = class AdministrativeService {
    constructor(provinceRepo, wardRepo) {
        this.provinceRepo = provinceRepo;
        this.wardRepo = wardRepo;
    }
    async getProvinces() {
        const count = await this.provinceRepo.count();
        if (count > 0) {
            return this.provinceRepo.find({ order: { name: 'ASC' } });
        }
        console.log('🔄 Đang nạp danh sách Tỉnh/Thành từ API ngoài...');
        try {
            const res = await fetch('https://provinces.open-api.vn/api/p/');
            if (!res.ok)
                throw new Error(`HTTP error! status: ${res.status}`);
            const data = (await res.json());
            const provincesData = data.map((p) => this.provinceRepo.create({ code: p.code, name: p.name }));
            await this.provinceRepo.save(provincesData);
            console.log('✅ Đã lưu danh sách Tỉnh/Thành vào database!');
            return provincesData;
        }
        catch (error) {
            console.error('Lỗi khi lấy danh sách Tỉnh/Thành từ API ngoài:', error.message);
            return [];
        }
    }
    async getWards(provinceCode) {
        const count = await this.wardRepo.count({ where: { provinceCode } });
        if (count > 0) {
            return this.wardRepo.find({
                where: { provinceCode },
                order: { name: 'ASC' },
            });
        }
        console.log(`🔄 Đang nạp danh sách Phường/Xã cho tỉnh ${provinceCode} từ API ngoài...`);
        try {
            const res = await fetch(`https://provinces.open-api.vn/api/p/${provinceCode}?depth=3`);
            if (!res.ok)
                throw new Error(`HTTP error! status: ${res.status}`);
            const data = (await res.json());
            const allWards = [];
            if (data && data.districts) {
                for (const d of data.districts) {
                    if (d.wards) {
                        for (const w of d.wards) {
                            allWards.push(this.wardRepo.create({
                                code: w.code,
                                name: `${w.name} - ${d.name}`,
                                provinceCode,
                            }));
                        }
                    }
                }
            }
            if (allWards.length > 0) {
                await this.wardRepo.save(allWards);
                console.log(`✅ Đã lưu ${allWards.length} Phường/Xã vào database!`);
            }
            return allWards;
        }
        catch (error) {
            console.error(`Lỗi khi lấy danh sách Phường/Xã cho tỉnh ${provinceCode}:`, error.message);
            return [];
        }
    }
    async seedWards() {
        console.log('🔄 Đang bắt đầu đồng bộ danh sách Phường/Xã cho 34 tỉnh của bạn...');
        try {
            const myProvinces = await this.provinceRepo.find();
            if (myProvinces.length === 0) {
                return { message: 'Bảng provinces của bạn đang trống!' };
            }
            const res = await fetch('https://provinces.open-api.vn/api/?depth=3');
            if (!res.ok)
                throw new Error(`HTTP error! status: ${res.status}`);
            const officialData = (await res.json());
            let totalImported = 0;
            const allWardsToSave = [];
            const normalizeName = (name) => {
                return name
                    .toLowerCase()
                    .replace(/tinh|thanh pho|thanh pho/g, '')
                    .replace(/đ/g, 'd')
                    .replace(/dawsk/g, '')
                    .replace(/lak/g, 'lak')
                    .trim()
                    .normalize('NFD')
                    .replace(/[\u0300-\u036f]/g, '');
            };
            for (const myP of myProvinces) {
                const myPNameNormalized = normalizeName(myP.name);
                const officialP = officialData.find((op) => {
                    const opNameNormalized = normalizeName(op.name);
                    return (opNameNormalized.includes(myPNameNormalized) ||
                        myPNameNormalized.includes(opNameNormalized));
                });
                if (officialP && officialP.districts) {
                    console.log(`➡️ Tìm thấy tỉnh khớp: ${myP.name} (Database ID: ${myP.code}) <=> ${officialP.name} (Official Code: ${officialP.code})`);
                    for (const d of officialP.districts) {
                        if (d.wards) {
                            for (const w of d.wards) {
                                const newWard = this.wardRepo.create({
                                    code: w.code,
                                    name: `${w.name} - ${d.name}`,
                                    provinceCode: myP.code,
                                });
                                allWardsToSave.push(newWard);
                            }
                        }
                    }
                }
                else {
                    console.log(`❌ Không tìm thấy tỉnh khớp cho: ${myP.name} (Normalized: ${myPNameNormalized})`);
                }
            }
            if (allWardsToSave.length > 0) {
                await this.wardRepo.clear();
                const chunkSize = 500;
                for (let i = 0; i < allWardsToSave.length; i += chunkSize) {
                    const chunk = allWardsToSave.slice(i, i + chunkSize);
                    await this.wardRepo.save(chunk);
                }
                totalImported = allWardsToSave.length;
                console.log(`✅ Đã đồng bộ thành công ${totalImported} Phường/Xã!`);
            }
            return {
                message: `Đồng bộ thành công! Đã nạp ${totalImported} xã/phường cho các tỉnh của bạn.`,
                success: true,
            };
        }
        catch (error) {
            console.error('Lỗi khi đồng bộ xã/phường:', error.message);
            return { message: `Lỗi: ${error.message}`, success: false };
        }
    }
};
exports.AdministrativeService = AdministrativeService;
exports.AdministrativeService = AdministrativeService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(province_entity_1.Province)),
    __param(1, (0, typeorm_1.InjectRepository)(ward_entity_1.Ward)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], AdministrativeService);
//# sourceMappingURL=administrative.service.js.map