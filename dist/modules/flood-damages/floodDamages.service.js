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
Object.defineProperty(exports, "__esModule", { value: true });
exports.FloodDamagesService = void 0;
const common_1 = require("@nestjs/common");
const role_code_enum_1 = require("../../common/enums/role-code.enum");
const notifications_service_1 = require("../notifications/notifications.service");
const users_service_1 = require("../users/users.service");
const damage_status_enum_1 = require("./enums/damage-status.enum");
const flood_damage_repository_1 = require("./repositories/flood-damage.repository");
const resident_entity_1 = require("../residents/entities/resident.entity");
let FloodDamagesService = class FloodDamagesService {
    constructor(floodDamageRepository, notificationsService, usersService) {
        this.floodDamageRepository = floodDamageRepository;
        this.notificationsService = notificationsService;
        this.usersService = usersService;
    }
    async create(dto, userId) {
        let householdId = dto.householdId;
        if (!householdId) {
            try {
                const residentRepo = this.floodDamageRepository.manager.getRepository(resident_entity_1.Resident);
                const resident = await residentRepo.findOne({ where: { userId } });
                if (resident) {
                    householdId = resident.id;
                }
            }
            catch (err) {
                console.error('Lỗi khi truy vấn thông tin hộ dân để liên kết thiệt hại:', err);
            }
        }
        const floodDamage = this.floodDamageRepository.create({
            ...dto,
            householdId,
            createdBy: userId,
            injuredCount: dto.injuredCount || 0,
            deathCount: dto.deathCount || 0,
        });
        const saved = await this.floodDamageRepository.save(floodDamage);
        try {
            const creatorResponse = await this.usersService.findOne(userId);
            const creator = creatorResponse.data;
            const managers = await this.usersService.findByRoleCode(role_code_enum_1.RoleCode.MANAGER);
            const admins = await this.usersService.findByRoleCode(role_code_enum_1.RoleCode.ADMIN);
            const allManagers = [...admins, ...managers];
            const title = 'Người dân cập nhật thiệt hại mới';
            const content = `${creator?.fullName || 'Người dân'} vừa cập nhật thiệt hại mới. Loại: ${dto.damageCategory}, Giá trị: ${dto.estimatedValue || 0} VND. Vui lòng kiểm tra và xác nhận.`;
            for (const manager of allManagers) {
                await this.notificationsService.create({
                    userId: manager.id,
                    title,
                    content,
                    type: 'FLOOD_DAMAGE_NEW',
                    referenceId: saved.id,
                });
            }
        }
        catch (error) {
            console.error('❌ Gửi thông báo thiệt hại thất bại:', error.message);
        }
        return saved;
    }
    async findAll(dto, currentUser) {
        const { search, category, status, reflectionId, householdId, page = 1, limit = 10, } = dto;
        const query = this.floodDamageRepository
            .createQueryBuilder('fd')
            .leftJoinAndSelect('fd.reflection', 'reflection')
            .leftJoinAndSelect('fd.household', 'household')
            .leftJoinAndSelect('fd.creator', 'creator');
        if (currentUser && currentUser.roleCode === role_code_enum_1.RoleCode.RESIDENT) {
            query.andWhere('(fd.createdBy = :currentUserId OR reflection.userId = :currentUserId OR household.userId = :currentUserId)', { currentUserId: currentUser.id });
        }
        else if (householdId) {
            query.andWhere('fd.householdId = :householdId', { householdId });
        }
        if (category) {
            query.andWhere('fd.damageCategory = :category', { category });
        }
        if (status) {
            query.andWhere('fd.status = :status', { status });
        }
        if (reflectionId) {
            query.andWhere('fd.reflectionId = :reflectionId', { reflectionId });
        }
        if (search) {
            query.andWhere('fd.description ILIKE :search', { search: `%${search}%` });
        }
        const skip = (page - 1) * limit;
        query.skip(skip).take(limit);
        query.orderBy('fd.createdAt', 'DESC');
        const [data, total] = await query.getManyAndCount();
        return {
            statusCode: 200,
            data,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async findOne(id) {
        const damage = await this.floodDamageRepository.findWithRelations(id);
        if (!damage) {
            throw new common_1.NotFoundException(`Không tìm thấy thiệt hại với ID ${id}`);
        }
        return damage;
    }
    async update(id, dto) {
        const damage = await this.findOne(id);
        Object.assign(damage, dto);
        const updatedDamage = await this.floodDamageRepository.save(damage);
        return {
            statusCode: 200,
            message: 'Cập nhật thiệt hại thành công',
            data: updatedDamage,
        };
    }
    async remove(id) {
        const damage = await this.findOne(id);
        await this.floodDamageRepository.remove(damage);
        const response = {
            statusCode: 200,
            message: 'Xóa thiệt hại thành công',
        };
        return response;
    }
    async getStatsByReflection(reflectionId) {
        const damages = await this.floodDamageRepository.findByReflectionId(reflectionId);
        const totalValue = damages.reduce((sum, d) => sum + Number(d.estimatedValue), 0);
        const totalInjured = damages.reduce((sum, d) => sum + d.injuredCount, 0);
        const totalDeaths = damages.reduce((sum, d) => sum + d.deathCount, 0);
        return {
            statusCode: 200,
            data: {
                totalDamages: damages.length,
                totalValue,
                totalInjured,
                totalDeaths,
                damages,
            },
        };
    }
    async updateStatus(id, status, reviewerId) {
        const damage = await this.findOne(id);
        const oldStatus = damage.status;
        damage.status = status;
        if (reviewerId) {
            damage.reviewedBy = reviewerId;
            damage.reviewedAt = new Date();
        }
        const updatedDamage = await this.floodDamageRepository.save(damage);
        if (oldStatus !== status &&
            [damage_status_enum_1.DamageStatus.APPROVED, damage_status_enum_1.DamageStatus.REJECTED].includes(status)) {
            try {
                const reviewerResponse = reviewerId
                    ? await this.usersService.findOne(reviewerId)
                    : null;
                const reviewer = reviewerResponse?.data;
                const residentResponse = await this.usersService.findOne(damage.createdBy);
                const resident = residentResponse?.data;
                if (resident) {
                    const title = status === damage_status_enum_1.DamageStatus.APPROVED
                        ? 'Thiệt hại đã được xác nhận'
                        : 'Thiệt hại bị từ chối';
                    const content = status === damage_status_enum_1.DamageStatus.APPROVED
                        ? `Thiệt hại của bạn đã được ${reviewer?.fullName || 'quản lý'} xác nhận. Giá trị: ${damage.estimatedValue || 0} VND.`
                        : `Thiệt hại của bạn đã bị ${reviewer?.fullName || 'quản lý'} từ chối. Vui lòng liên hệ để biết thêm chi tiết.`;
                    await this.notificationsService.create({
                        userId: resident.id,
                        title,
                        content,
                        type: 'FLOOD_DAMAGE_UPDATE',
                        referenceId: damage.id,
                    });
                }
            }
            catch (error) {
                console.error('❌ Gửi thông báo cập nhật thiệt hại thất bại:', error.message);
            }
        }
        return {
            statusCode: 200,
            message: 'Cập nhật trạng thái thiệt hại thành công',
            data: updatedDamage,
        };
    }
};
exports.FloodDamagesService = FloodDamagesService;
exports.FloodDamagesService = FloodDamagesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [flood_damage_repository_1.FloodDamageRepository,
        notifications_service_1.NotificationsService,
        users_service_1.UsersService])
], FloodDamagesService);
//# sourceMappingURL=floodDamages.service.js.map