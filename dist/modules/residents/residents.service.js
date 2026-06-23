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
exports.ResidentsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const role_code_enum_1 = require("../../common/enums/role-code.enum");
const typeorm_2 = require("typeorm");
const auths_service_1 = require("../auths/auths.service");
const resident_entity_1 = require("./entities/resident.entity");
let ResidentsService = class ResidentsService {
    constructor(repo, authsService) {
        this.repo = repo;
        this.authsService = authsService;
    }
    async create(dto, currentUser) {
        let existingResident = null;
        if (dto.phoneNumber) {
            existingResident = await this.repo.findOne({
                where: { phoneNumber: dto.phoneNumber },
            });
        }
        if (!existingResident && dto.email) {
            existingResident = await this.repo.findOne({
                where: { email: dto.email },
            });
        }
        if (existingResident) {
            const existingUser = dto.phoneNumber
                ? await this.authsService.findUserByPhoneNumber(dto.phoneNumber)
                : null;
            if (existingResident.userId) {
                const targetUserId = dto.userId || (existingUser ? existingUser.id : null);
                if (targetUserId && existingResident.userId === targetUserId) {
                    if (dto.fullName)
                        existingResident.fullName = dto.fullName;
                    if (dto.address)
                        existingResident.address = dto.address;
                    if (dto.latitude)
                        existingResident.latitude = dto.latitude;
                    if (dto.longitude)
                        existingResident.longitude = dto.longitude;
                    if (dto.numberOfMembers)
                        existingResident.numberOfMembers = dto.numberOfMembers;
                    if (dto.hasElderly)
                        existingResident.hasElderly = dto.hasElderly;
                    if (dto.hasChildren)
                        existingResident.hasChildren = dto.hasChildren;
                    if (dto.hasPregnantWomen)
                        existingResident.hasPregnantWomen = dto.hasPregnantWomen;
                    if (dto.hasChronicDisease)
                        existingResident.hasChronicDisease = dto.hasChronicDisease;
                    if (dto.houseType)
                        existingResident.houseType = dto.houseType;
                    if (dto.hasBusiness)
                        existingResident.hasBusiness = dto.hasBusiness;
                    const saved = await this.repo.save(existingResident);
                    return {
                        statusCode: 201,
                        message: 'Liên kết tài khoản với hộ dân thành công (đã liên kết trước đó)',
                        data: saved,
                    };
                }
                throw new common_1.BadRequestException('Số điện thoại hoặc Email đã tồn tại và đã được liên kết với tài khoản khác');
            }
            if (dto.createAccount !== false) {
                try {
                    const targetUserId = dto.userId || (existingUser ? existingUser.id : null);
                    let linkedUserId = targetUserId;
                    if (!linkedUserId) {
                        const user = await this.authsService.createAccount({
                            fullName: dto.fullName || existingResident.fullName,
                            phoneNumber: dto.phoneNumber || existingResident.phoneNumber,
                            email: dto.email || existingResident.email,
                            roleCode: role_code_enum_1.RoleCode.RESIDENT,
                            address: dto.address || existingResident.address,
                        });
                        linkedUserId = user.id;
                    }
                    existingResident.userId = linkedUserId;
                    if (dto.latitude)
                        existingResident.latitude = dto.latitude;
                    if (dto.longitude)
                        existingResident.longitude = dto.longitude;
                    if (dto.numberOfMembers)
                        existingResident.numberOfMembers = dto.numberOfMembers;
                    if (dto.address)
                        existingResident.address = dto.address;
                    if (dto.hasElderly)
                        existingResident.hasElderly = dto.hasElderly;
                    if (dto.hasChildren)
                        existingResident.hasChildren = dto.hasChildren;
                    if (dto.hasPregnantWomen)
                        existingResident.hasPregnantWomen = dto.hasPregnantWomen;
                    if (dto.hasChronicDisease)
                        existingResident.hasChronicDisease = dto.hasChronicDisease;
                    if (dto.houseType)
                        existingResident.houseType = dto.houseType;
                    if (dto.hasBusiness)
                        existingResident.hasBusiness = dto.hasBusiness;
                    const saved = await this.repo.save(existingResident);
                    return {
                        statusCode: 201,
                        message: 'Liên kết tài khoản với hộ dân thành công',
                        data: saved,
                    };
                }
                catch (error) {
                    console.error('❌ Liên kết tài khoản cho hộ dân thất bại:', error.message);
                    throw new common_1.BadRequestException('Tạo tài khoản liên kết thất bại: ' + error.message);
                }
            }
            else {
                throw new common_1.BadRequestException('Hộ dân với số điện thoại hoặc email này đã tồn tại');
            }
        }
        const existingCode = await this.repo.findOne({
            where: { residentCode: dto.residentCode },
        });
        if (existingCode)
            throw new common_1.BadRequestException('Mã hộ dân đã tồn tại');
        const hr = this.repo.create({ ...dto, createdBy: currentUser.id });
        const saved = await this.repo.save(hr);
        if (dto.userId) {
            saved.userId = dto.userId;
            await this.repo.save(saved);
        }
        else if (dto.createAccount !== false) {
            try {
                const existingUser = dto.phoneNumber
                    ? await this.authsService.findUserByPhoneNumber(dto.phoneNumber)
                    : null;
                if (existingUser) {
                    saved.userId = existingUser.id;
                    await this.repo.save(saved);
                }
                else {
                    const user = await this.authsService.createAccount({
                        fullName: dto.fullName,
                        phoneNumber: dto.phoneNumber,
                        email: dto.email || '',
                        roleCode: role_code_enum_1.RoleCode.RESIDENT,
                        address: dto.address,
                    });
                    saved.userId = user.id;
                    await this.repo.save(saved);
                }
            }
            catch (error) {
                console.error('❌ Tự động tạo/liên kết tài khoản cho hộ dân thất bại:', error.message);
            }
        }
        else {
            try {
                const existingUser = dto.phoneNumber
                    ? await this.authsService.findUserByPhoneNumber(dto.phoneNumber)
                    : null;
                if (existingUser) {
                    saved.userId = existingUser.id;
                    await this.repo.save(saved);
                }
            }
            catch (error) {
                console.error('❌ Tự động liên kết tài khoản cũ thất bại:', error.message);
            }
        }
        return { statusCode: 201, message: 'Thêm hộ dân thành công', data: saved };
    }
    async findAll(page = 1, limit = 10, currentUser, keyword, houseType, hasElderly, hasChildren, hasPregnantWomen, hasChronicDisease, hasBusiness) {
        const baseWhere = {};
        if (currentUser?.roleCode === role_code_enum_1.RoleCode.MANAGER) {
            baseWhere.createdBy = (0, typeorm_2.In)([currentUser.id, 1]);
        }
        if (houseType) {
            baseWhere.houseType = houseType;
        }
        if (hasElderly) {
            baseWhere.hasElderly = hasElderly;
        }
        if (hasChildren) {
            baseWhere.hasChildren = hasChildren;
        }
        if (hasPregnantWomen) {
            baseWhere.hasPregnantWomen = hasPregnantWomen;
        }
        if (hasChronicDisease) {
            baseWhere.hasChronicDisease = hasChronicDisease;
        }
        if (hasBusiness) {
            baseWhere.hasBusiness = hasBusiness;
        }
        let where = baseWhere;
        if (keyword) {
            where = [
                { ...baseWhere, fullName: (0, typeorm_2.Like)(`%${keyword}%`) },
                { ...baseWhere, residentCode: (0, typeorm_2.Like)(`%${keyword}%`) },
                { ...baseWhere, phoneNumber: (0, typeorm_2.Like)(`%${keyword}%`) },
            ];
        }
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
    async findOne(id) {
        const r = (await this.repo.findOne({
            where: { id },
            relations: ['floodDamages'],
        }));
        if (!r)
            throw new common_1.NotFoundException('Không tìm thấy người dân');
        if (r.userId) {
            try {
                r.user = await this.authsService.findUserById(r.userId);
                const reflectionRepo = this.repo.manager.getRepository(require('../reflections/entities/reflection.entity').Reflection);
                r.reflections = await reflectionRepo.find({
                    where: { userId: r.userId },
                    order: { createdAt: 'DESC' },
                });
                const floodDamageRepo = this.repo.manager.getRepository(require('../flood-damages/entities/flood-damage.entity').FloodDamage);
                const extraDamages = await floodDamageRepo
                    .createQueryBuilder('fd')
                    .leftJoinAndSelect('fd.reflection', 'reflection')
                    .leftJoinAndSelect('fd.household', 'household')
                    .leftJoinAndSelect('fd.creator', 'creator')
                    .where('fd.householdId = :householdId OR reflection.userId = :userId OR fd.createdBy = :userId', { householdId: r.id, userId: r.userId })
                    .orderBy('fd.createdAt', 'DESC')
                    .getMany();
                r.floodDamages = extraDamages;
            }
            catch (err) {
                console.error('Lỗi khi lấy dữ liệu liên kết tài khoản:', err);
            }
        }
        else {
            r.reflections = [];
        }
        return { statusCode: 200, message: 'Thành công', data: r };
    }
    async update(id, dto) {
        const r = await this.repo.findOne({ where: { id } });
        if (!r)
            throw new common_1.NotFoundException('Không tìm thấy người dân');
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
            throw new common_1.NotFoundException('Không tìm thấy người dân');
        await this.repo.softDelete(id);
        return { statusCode: 200, message: 'Xóa thành công' };
    }
    async findMyResident(userId) {
        const r = await this.repo.findOne({
            where: { userId },
            relations: ['floodDamages'],
        });
        if (!r)
            throw new common_1.NotFoundException('Không tìm thấy thông tin người dân cho tài khoản này');
        return { statusCode: 200, message: 'Thành công', data: r };
    }
    async findNearby(lat, lng, radiusInMeters) {
        return await this.repo
            .createQueryBuilder('resident')
            .where(`6371000 * acos(cos(radians(:lat)) * cos(radians(resident.latitude)) * cos(radians(resident.longitude) - radians(:lng)) + sin(radians(:lat)) * sin(radians(resident.latitude))) <= :radius`, { lat, lng, radius: radiusInMeters })
            .getMany();
    }
};
exports.ResidentsService = ResidentsService;
exports.ResidentsService = ResidentsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(resident_entity_1.Resident)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        auths_service_1.AuthsService])
], ResidentsService);
//# sourceMappingURL=residents.service.js.map