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
exports.ResidentContactsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const resident_contact_entity_1 = require("./entities/resident-contact.entity");
let ResidentContactsService = class ResidentContactsService {
    constructor(repo) {
        this.repo = repo;
    }
    async bulkCreate(dto) {
        const results = { success: 0, skipped: 0, errors: [] };
        const list = Array.isArray(dto)
            ? dto
            : dto && Array.isArray(dto.contacts)
                ? dto.contacts
                : [];
        for (const contact of list) {
            if (!contact.cccd) {
                results.skipped++;
                continue;
            }
            const existing = await this.repo.findOne({
                where: { cccd: contact.cccd },
            });
            if (existing) {
                Object.assign(existing, contact);
                await this.repo.save(existing);
                results.success++;
                continue;
            }
            try {
                await this.repo.save(this.repo.create(contact));
                results.success++;
            }
            catch (e) {
                results.errors.push(`CCCD ${contact.cccd}: ${e.message}`);
            }
        }
        return {
            statusCode: 201,
            message: `Nhập ${results.success} liên hệ thành công${results.skipped ? `, bỏ qua ${results.skipped}` : ''}`,
            data: results,
        };
    }
    async create(dto) {
        const existing = await this.repo.findOne({ where: { cccd: dto.cccd } });
        if (existing) {
            throw new common_1.BadRequestException('Số CCCD đã tồn tại trong danh sách liên hệ');
        }
        const saved = await this.repo.save(this.repo.create(dto));
        return { statusCode: 201, message: 'Thêm thành công', data: saved };
    }
    async findAll(page = 1, limit = 10, keyword) {
        const where = keyword
            ? [
                { cccd: (0, typeorm_2.Like)(`%${keyword}%`) },
                { phoneNumber: (0, typeorm_2.Like)(`%${keyword}%`) },
                { email: (0, typeorm_2.Like)(`%${keyword}%`) },
            ]
            : {};
        const [data, total] = await this.repo.findAndCount({
            where,
            skip: (page - 1) * limit,
            take: limit,
            order: { createdAt: 'DESC' },
        });
        return {
            statusCode: 200,
            message: 'Thành công',
            data,
            meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
        };
    }
    async findByCccd(cccd) {
        if (!cccd)
            return null;
        return this.repo.findOne({ where: { cccd } });
    }
    async update(id, dto) {
        const r = await this.repo.findOne({ where: { id } });
        if (!r)
            throw new common_1.NotFoundException('Không tìm thấy thông tin liên hệ');
        Object.assign(r, dto);
        return {
            statusCode: 200,
            message: 'Cập nhật thành công',
            data: await this.repo.save(r),
        };
    }
    async remove(id) {
        const r = await this.repo.findOne({ where: { id } });
        if (!r)
            throw new common_1.NotFoundException('Không tìm thấy thông tin liên hệ');
        await this.repo.softDelete(id);
        return { statusCode: 200, message: 'Xóa thành công' };
    }
};
exports.ResidentContactsService = ResidentContactsService;
exports.ResidentContactsService = ResidentContactsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(resident_contact_entity_1.ResidentContact)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], ResidentContactsService);
//# sourceMappingURL=resident-contacts.service.js.map