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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("./entities/user.entity");
const role_code_enum_1 = require("../../common/enums/role-code.enum");
const reputation_history_entity_1 = require("./entities/reputation-history.entity");
const role_entity_1 = require("../roles/entities/role.entity");
const human_resource_entity_1 = require("../human-resources/entities/human-resource.entity");
const resident_entity_1 = require("../residents/entities/resident.entity");
const bcrypt = require("bcrypt");
let UsersService = class UsersService {
    constructor(repo) {
        this.repo = repo;
    }
    async create(dto) {
        const existing = await this.repo.findOne({
            where: [
                { phoneNumber: dto.phoneNumber },
                ...(dto.email ? [{ email: dto.email }] : []),
            ],
            withDeleted: true,
        });
        if (existing) {
            if (existing.deletedAt) {
                throw new common_1.BadRequestException('Số điện thoại hoặc Email đã tồn tại trong hệ thống (đã bị xóa tạm thời)');
            }
            throw new common_1.BadRequestException('Số điện thoại hoặc Email đã được sử dụng');
        }
        const role = await this.repo.manager.getRepository(role_entity_1.Role).findOne({
            where: { roleCode: dto.roleCode },
        });
        if (!role) {
            throw new common_1.NotFoundException('Vai trò không tồn tại');
        }
        const hashedPassword = dto.password
            ? await bcrypt.hash(dto.password, 10)
            : null;
        const user = this.repo.create({
            fullName: dto.fullName,
            phoneNumber: dto.phoneNumber,
            email: dto.email,
            password: hashedPassword,
            roleId: role.id,
        });
        const saved = await this.repo.save(user);
        const { password: _p, ...result } = saved;
        return {
            statusCode: 201,
            message: 'Tạo người dùng thành công',
            data: result,
        };
    }
    async onModuleInit() {
        await this.checkAndResetReputationForNewYear().catch((err) => {
            console.error('Lỗi khi kiểm tra reset điểm uy tín đầu năm lúc khởi động:', err?.message);
        });
        setInterval(async () => {
            try {
                await this.checkAndResetReputationForNewYear();
            }
            catch (err) {
                console.error('Lỗi khi kiểm tra định kỳ reset điểm uy tín đầu năm:', err?.message);
            }
        }, 60 * 60 * 1000);
    }
    async checkAndResetReputationForNewYear() {
        const currentYear = new Date().getFullYear();
        const historyRepo = this.repo.manager.getRepository(reputation_history_entity_1.ReputationHistory);
        const hasReset = await historyRepo.findOne({
            where: {
                reason: `Hệ thống tự động reset điểm uy tín về 10 khi qua năm mới ${currentYear}`,
            },
        });
        if (hasReset) {
            return;
        }
        console.log(`[NewYearReset] Bắt đầu tự động reset điểm uy tín về 10 cho toàn bộ người dùng trong năm mới ${currentYear}...`);
        const users = await this.repo.find();
        if (users.length === 0)
            return;
        const usersToSave = [];
        const historiesToSave = [];
        for (const user of users) {
            const oldPoints = user.reputationPoints ?? 10;
            const wasBlocked = !!user.reputationBlockedUntil;
            if (oldPoints !== 10 || wasBlocked) {
                user.reputationPoints = 10;
                user.reputationBlockedUntil = null;
                usersToSave.push(user);
            }
            const history = historyRepo.create({
                userId: user.id,
                amount: 10 - oldPoints,
                reason: `Hệ thống tự động reset điểm uy tín về 10 khi qua năm mới ${currentYear}`,
            });
            historiesToSave.push(history);
        }
        if (usersToSave.length > 0) {
            await this.repo.save(usersToSave);
        }
        if (historiesToSave.length > 0) {
            await historyRepo.save(historiesToSave);
        }
        console.log(`[NewYearReset] Hoàn thành tự động reset điểm uy tín cho năm mới ${currentYear}.`);
    }
    async findAll(page = 1, limit = 10, keyword, roleCode) {
        const baseWhere = {};
        if (roleCode) {
            baseWhere.role = { roleCode };
        }
        let where = baseWhere;
        if (keyword) {
            where = [
                { ...baseWhere, fullName: (0, typeorm_2.Like)(`%${keyword}%`) },
                { ...baseWhere, phoneNumber: (0, typeorm_2.Like)(`%${keyword}%`) },
            ];
        }
        const [data, total] = await this.repo.findAndCount({
            where,
            skip: (page - 1) * limit,
            take: limit,
            select: [
                'id',
                'fullName',
                'email',
                'phoneNumber',
                'gender',
                'status',
                'avatar',
                'reputationPoints',
                'reputationBlockedUntil',
                'createdAt',
            ],
            relations: ['role'],
            order: { createdAt: 'DESC' },
        });
        const userIds = data.map((u) => u.id);
        const phoneNumbers = data.map((u) => u.phoneNumber).filter(Boolean);
        const emails = data.map((u) => u.email).filter(Boolean);
        if (userIds.length > 0) {
            const residentRepo = this.repo.manager.getRepository(resident_entity_1.Resident);
            const residents = await residentRepo.find({
                where: [
                    { userId: (0, typeorm_2.In)(userIds) },
                    ...(phoneNumbers.length > 0
                        ? [{ phoneNumber: (0, typeorm_2.In)(phoneNumbers) }]
                        : []),
                    ...(emails.length > 0 ? [{ email: (0, typeorm_2.In)(emails) }] : []),
                ],
            });
            const residentsToSave = [];
            for (const user of data) {
                let resident = residents.find((r) => r.userId === user.id);
                if (!resident && user.phoneNumber) {
                    resident = residents.find((r) => r.phoneNumber === user.phoneNumber);
                }
                if (!resident && user.email) {
                    resident = residents.find((r) => r.email === user.email);
                }
                if (resident) {
                    if (!resident.userId) {
                        resident.userId = user.id;
                        residentsToSave.push(resident);
                    }
                    user.resident = resident;
                }
                else if (user.role?.roleCode === role_code_enum_1.RoleCode.RESIDENT) {
                    const newResident = residentRepo.create({
                        residentCode: `CH-${user.phoneNumber || user.id}`,
                        fullName: user.fullName || 'Chưa cập nhật',
                        phoneNumber: user.phoneNumber,
                        email: user.email,
                        address: user.address || 'Chưa cập nhật',
                        userId: user.id,
                    });
                    try {
                        const savedResident = await residentRepo.save(newResident);
                        user.resident = savedResident;
                    }
                    catch (err) {
                        console.error('Lỗi khi tự động tạo Resident trong findAll:', err?.message);
                        user.resident = null;
                    }
                }
                else {
                    user.resident = null;
                }
            }
            if (residentsToSave.length > 0) {
                await residentRepo.save(residentsToSave).catch((err) => {
                    console.error('Lỗi khi tự động lưu/liên kết Resident:', err?.message);
                });
            }
        }
        return {
            statusCode: 200,
            message: 'Thành công',
            data,
            meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
        };
    }
    async getStaffWorkQuality(page = 1, limit = 10, keyword) {
        const qb = this.repo
            .createQueryBuilder('u')
            .leftJoinAndSelect('u.role', 'role')
            .where('role.roleCode NOT IN (:...excludedRoles)', {
            excludedRoles: [role_code_enum_1.RoleCode.ADMIN, role_code_enum_1.RoleCode.MANAGER, role_code_enum_1.RoleCode.RESIDENT],
        });
        if (keyword) {
            qb.andWhere('(u.fullName LIKE :kw OR u.phoneNumber LIKE :kw)', {
                kw: `%${keyword}%`,
            });
        }
        const [users, total] = await qb
            .orderBy('u.createdAt', 'DESC')
            .skip((page - 1) * limit)
            .take(limit)
            .getManyAndCount();
        const data = await Promise.all(users.map(async (user) => {
            if (user.role?.roleCode === role_code_enum_1.RoleCode.OFFICER) {
                const reflections = await this.repo.manager
                    .getRepository(require('../reflections/entities/reflection.entity').Reflection)
                    .find({
                    where: { officerId: user.id },
                    select: ['createdAt', 'verifiedAt'],
                });
                const verifiedReflections = reflections.filter((r) => r.verifiedAt);
                const ratingCount = verifiedReflections.length;
                let totalRating = 0;
                verifiedReflections.forEach((r) => {
                    const diffMin = (new Date(r.verifiedAt).getTime() -
                        new Date(r.createdAt).getTime()) /
                        (60 * 1000);
                    let rating = 1;
                    if (diffMin <= 15)
                        rating = 5;
                    else if (diffMin <= 30)
                        rating = 4;
                    else if (diffMin <= 60)
                        rating = 3;
                    else if (diffMin <= 120)
                        rating = 2;
                    totalRating += rating;
                });
                const averageRating = ratingCount > 0
                    ? parseFloat((totalRating / ratingCount).toFixed(1))
                    : 0;
                return {
                    ...user,
                    averageRating,
                    ratingCount,
                };
            }
            else {
                const roleCode = user.role?.roleCode;
                let whereClause = '';
                if (roleCode === role_code_enum_1.RoleCode.PATROL) {
                    whereClause = 'r.patrolId = :uid';
                }
                else if (roleCode === role_code_enum_1.RoleCode.INSPECTOR) {
                    whereClause = 'r.inspectorId = :uid';
                }
                else {
                    whereClause =
                        '(r.patrolId = :uid OR r.officerId = :uid OR r.inspectorId = :uid)';
                }
                const ratingData = await this.repo.manager
                    .getRepository(require('../reflections/entities/reflection.entity').Reflection)
                    .createQueryBuilder('r')
                    .select('AVG(r.rating)', 'avgRating')
                    .addSelect('COUNT(r.rating)', 'ratingCount')
                    .where(whereClause, { uid: user.id })
                    .andWhere('r.rating IS NOT NULL')
                    .getRawOne();
                return {
                    ...user,
                    averageRating: ratingData?.avgRating
                        ? parseFloat(parseFloat(ratingData.avgRating).toFixed(1))
                        : 0,
                    ratingCount: ratingData?.ratingCount
                        ? parseInt(ratingData.ratingCount)
                        : 0,
                };
            }
        }));
        return {
            statusCode: 200,
            message: 'Thành công',
            data,
            meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
        };
    }
    async findOne(id) {
        const user = await this.repo.findOne({
            where: { id },
            select: [
                'id',
                'fullName',
                'email',
                'phoneNumber',
                'gender',
                'dateBirth',
                'address',
                'avatar',
                'status',
                'reputationPoints',
                'reputationBlockedUntil',
                'createdAt',
            ],
            relations: ['role'],
        });
        if (!user)
            throw new common_1.NotFoundException('Không tìm thấy người dùng');
        const hr = await this.repo.manager.findOne(human_resource_entity_1.HumanResource, {
            where: { userId: id },
        });
        user.humanResource = hr;
        let resident = await this.repo.manager.findOne(resident_entity_1.Resident, {
            where: { userId: id },
        });
        if (!resident && user.role?.roleCode === role_code_enum_1.RoleCode.RESIDENT) {
            resident = this.repo.manager.getRepository(resident_entity_1.Resident).create({
                residentCode: `CH-${user.phoneNumber || user.id}`,
                fullName: user.fullName || 'Chưa cập nhật',
                phoneNumber: user.phoneNumber,
                email: user.email,
                address: user.address || 'Chưa cập nhật',
                userId: user.id,
            });
            await this.repo.manager
                .getRepository(resident_entity_1.Resident)
                .save(resident)
                .catch((err) => {
                console.error('Lỗi tự động tạo Resident trong findOne:', err);
            });
        }
        user.resident = resident;
        if (user.reputationPoints === 0 &&
            user.reputationBlockedUntil &&
            new Date() > new Date(user.reputationBlockedUntil)) {
            user.reputationPoints = 10;
            user.reputationBlockedUntil = null;
            await this.repo.save(user);
            const historyRepo = this.repo.manager.getRepository(reputation_history_entity_1.ReputationHistory);
            const history = historyRepo.create({
                userId: user.id,
                amount: 10,
                reason: 'Hệ thống tự động mở khóa và khôi phục điểm uy tín về 10 sau 15 ngày tạm khóa',
            });
            await historyRepo
                .save(history)
                .catch((err) => console.error('Lỗi lưu lịch sử tự động mở khóa:', err));
        }
        if (user.reputationPoints > 10) {
            user.reputationPoints = 10;
            await this.repo.save(user);
        }
        return { statusCode: 200, message: 'Thành công', data: user };
    }
    async updateProfile(id, dto) {
        const user = await this.repo.findOne({ where: { id } });
        if (!user)
            throw new common_1.NotFoundException('Không tìm thấy người dùng');
        const { password: _, ...safeDto } = dto;
        Object.assign(user, safeDto);
        const saved = await this.repo.save(user);
        const { password: _p, ...result } = saved;
        const hr = await this.repo.manager.findOne(human_resource_entity_1.HumanResource, {
            where: { userId: id },
        });
        result.humanResource = hr;
        let resident = await this.repo.manager.findOne(resident_entity_1.Resident, {
            where: { userId: id },
        });
        if (!resident) {
            const userWithRole = await this.repo.findOne({
                where: { id },
                relations: ['role'],
            });
            if (userWithRole?.role?.roleCode === role_code_enum_1.RoleCode.RESIDENT) {
                resident = this.repo.manager.getRepository(resident_entity_1.Resident).create({
                    residentCode: `CH-${userWithRole.phoneNumber || userWithRole.id}`,
                    fullName: userWithRole.fullName || 'Chưa cập nhật',
                    phoneNumber: userWithRole.phoneNumber,
                    email: userWithRole.email,
                    address: userWithRole.address || 'Chưa cập nhật',
                    userId: userWithRole.id,
                });
                await this.repo.manager
                    .getRepository(resident_entity_1.Resident)
                    .save(resident)
                    .catch((err) => {
                    console.error('Lỗi tự động tạo Resident trong updateProfile:', err);
                });
            }
        }
        result.resident = resident;
        return { statusCode: 200, message: 'Cập nhật thành công', data: result };
    }
    async findByRoleCode(roleCode) {
        return await this.repo.find({
            where: { role: { roleCode } },
            relations: ['role'],
        });
    }
    async remove(id) {
        const user = await this.repo.findOne({ where: { id } });
        if (!user)
            throw new common_1.NotFoundException('Không tìm thấy người dùng');
        await this.repo.softDelete(id);
        return { statusCode: 200, message: 'Xóa người dùng thành công' };
    }
    async updateReputation(id, points) {
        const user = await this.repo.findOne({ where: { id } });
        if (!user)
            throw new common_1.NotFoundException('Không tìm thấy người dùng');
        let cappedPoints = points;
        if (cappedPoints > 10)
            cappedPoints = 10;
        if (cappedPoints < 0)
            cappedPoints = 0;
        user.reputationPoints = cappedPoints;
        if (cappedPoints === 0) {
            if (!user.reputationBlockedUntil) {
                const blockedUntil = new Date();
                blockedUntil.setDate(blockedUntil.getDate() + 15);
                user.reputationBlockedUntil = blockedUntil;
            }
        }
        else {
            user.reputationBlockedUntil = null;
        }
        await this.repo.save(user);
        return {
            statusCode: 200,
            message: 'Cập nhật điểm uy tín thành công',
            data: { reputationPoints: cappedPoints },
        };
    }
    async findNearestByRole(roleCode, lat, lng) {
        const users = await this.repo.find({
            where: { role: { roleCode } },
            relations: ['role'],
        });
        return users;
    }
    async findByRoleCodes(roleCodes) {
        const users = [];
        for (const roleCode of roleCodes) {
            const found = await this.findByRoleCode(roleCode);
            users.push(...found);
        }
        return users;
    }
    async adjustReputation(userId, amount, reason, reflectionId) {
        const user = await this.repo.findOne({ where: { id: userId } });
        if (!user)
            return;
        const historyRepo = this.repo.manager.getRepository(reputation_history_entity_1.ReputationHistory);
        if (reflectionId) {
            const existing = await historyRepo.findOne({
                where: {
                    userId,
                    reflectionId,
                    amount,
                },
            });
            if (existing) {
                console.log(`[adjustReputation] Lịch sử uy tín cho phản ánh #${reflectionId} với lượng thay đổi ${amount} đã tồn tại. Bỏ qua.`);
                return;
            }
        }
        const currentPoints = user.reputationPoints ?? 10;
        let newPoints = currentPoints + amount;
        if (newPoints > 10)
            newPoints = 10;
        if (newPoints < 0)
            newPoints = 0;
        user.reputationPoints = newPoints;
        if (newPoints === 0) {
            if (!user.reputationBlockedUntil) {
                const blockedUntil = new Date();
                blockedUntil.setDate(blockedUntil.getDate() + 15);
                user.reputationBlockedUntil = blockedUntil;
            }
        }
        else {
            user.reputationBlockedUntil = null;
        }
        await this.repo.save(user);
        const history = historyRepo.create({
            userId,
            amount,
            reason,
            reflectionId,
        });
        await historyRepo.save(history);
    }
    async getReputationHistory(userId) {
        try {
            const history = await this.repo.manager
                .getRepository(reputation_history_entity_1.ReputationHistory)
                .find({
                where: { userId },
                order: { createdAt: 'DESC' },
            });
            return { statusCode: 200, message: 'Thành công', data: history };
        }
        catch (err) {
            console.error('[getReputationHistory] Lỗi truy vấn lịch sử uy tín:', err?.message);
            return { statusCode: 200, message: 'Thành công', data: [] };
        }
    }
    async countAllUsers() {
        return await this.repo.count();
    }
    async findDeleted(page = 1, limit = 10, keyword) {
        const qb = this.repo
            .createQueryBuilder('u')
            .leftJoinAndSelect('u.role', 'role')
            .withDeleted()
            .where('u.deletedAt IS NOT NULL')
            .andWhere('role.roleCode != :adminRole', { adminRole: role_code_enum_1.RoleCode.ADMIN });
        if (keyword) {
            qb.andWhere('(u.fullName LIKE :kw OR u.phoneNumber LIKE :kw)', {
                kw: `%${keyword}%`,
            });
        }
        const [data, total] = await qb
            .orderBy('u.deletedAt', 'DESC')
            .skip((page - 1) * limit)
            .take(limit)
            .getManyAndCount();
        return {
            statusCode: 200,
            message: 'Thành công',
            data,
            meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
        };
    }
    async restoreDeleted(id) {
        const user = await this.repo.findOne({
            where: { id },
            withDeleted: true,
        });
        if (!user)
            throw new common_1.NotFoundException('Không tìm thấy người dùng');
        if (!user.deletedAt)
            throw new common_1.BadRequestException('Người dùng không ở trạng thái bị xóa');
        await this.repo.restore(id);
        return { statusCode: 200, message: 'Khôi phục tài khoản thành công' };
    }
    async suspendUser(id) {
        const user = await this.repo.findOne({ where: { id } });
        if (!user)
            throw new common_1.NotFoundException('Không tìm thấy người dùng');
        user.status = require('./enums/user-status.enum').UserStatus.INACTIVE;
        await this.repo.save(user);
        return {
            statusCode: 200,
            message: 'Tạm ngừng hoạt động tài khoản thành công',
        };
    }
    async activateUser(id) {
        const user = await this.repo.findOne({ where: { id } });
        if (!user)
            throw new common_1.NotFoundException('Không tìm thấy người dùng');
        user.status = require('./enums/user-status.enum').UserStatus.ACTIVE;
        await this.repo.save(user);
        return { statusCode: 200, message: 'Kích hoạt tài khoản thành công' };
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], UsersService);
//# sourceMappingURL=users.service.js.map