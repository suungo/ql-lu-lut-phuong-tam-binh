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
exports.HumanResourcesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const human_resource_entity_1 = require("./entities/human-resource.entity");
const auths_service_1 = require("../auths/auths.service");
const role_code_enum_1 = require("../../common/enums/role-code.enum");
const notifications_service_1 = require("../notifications/notifications.service");
const user_entity_1 = require("../users/entities/user.entity");
const role_entity_1 = require("../roles/entities/role.entity");
let HumanResourcesService = class HumanResourcesService {
    constructor(repo, authsService, notificationsService) {
        this.repo = repo;
        this.authsService = authsService;
        this.notificationsService = notificationsService;
    }
    async create(dto, currentUser) {
        const existingCode = await this.repo.findOne({
            where: [{ employeeCode: dto.employeeCode }],
        });
        if (existingCode)
            throw new common_1.BadRequestException('Mã nhân viên đã tồn tại');
        const existingPhoneNumber = await this.repo.findOne({
            where: [{ phoneNumber: dto.phoneNumber }],
        });
        if (existingPhoneNumber)
            throw new common_1.BadRequestException('Số điện thoại đã tồn tại');
        const existingEmail = await this.repo.findOne({
            where: [
                {
                    email: dto.email,
                },
            ],
        });
        if (existingEmail)
            throw new common_1.BadRequestException('Email đã tồn tại');
        const hr = this.repo.create({ ...dto, createdBy: currentUser.id });
        const saved = await this.repo.save(hr);
        if (saved.email) {
            try {
                let roleCode = role_code_enum_1.RoleCode.STAFF;
                switch (saved.position) {
                    case 'OFFICER':
                        roleCode = role_code_enum_1.RoleCode.OFFICER;
                        break;
                    case 'LEADER':
                        roleCode = role_code_enum_1.RoleCode.OFFICER;
                        break;
                    case 'STAFF':
                        roleCode = role_code_enum_1.RoleCode.STAFF;
                        break;
                    case 'POSTOFFICER':
                        roleCode = role_code_enum_1.RoleCode.INSPECTOR;
                        break;
                    case 'ELECTRICITYSTAFF':
                        roleCode = role_code_enum_1.RoleCode.PATROL;
                        break;
                    case 'PATROL':
                        roleCode = role_code_enum_1.RoleCode.PATROL;
                        break;
                    default:
                        roleCode = role_code_enum_1.RoleCode.STAFF;
                }
                const user = await this.authsService.createAccount({
                    fullName: saved.fullName,
                    phoneNumber: saved.phoneNumber,
                    email: saved.email,
                    roleCode: roleCode,
                });
                saved.userId = user.id;
                await this.repo.save(saved);
            }
            catch (error) {
                console.error('❌ Tự động tạo tài khoản cho nhân sự thất bại:', error.message);
            }
        }
        if (currentUser && currentUser.id !== 1) {
            try {
                await this.notificationsService.create({
                    userId: currentUser.id,
                    title: 'Nhân sự đã được xác thực thành công',
                    content: `Nhân sự "${saved.fullName}" (${saved.employeeCode}) bạn đăng ký đã được xác thực thành công bởi Hệ thống xác thực nhân sự.`,
                    type: 'HR_VERIFICATION',
                    referenceId: saved.id,
                });
                console.log(`🔔 Đã gửi thông báo xác thực thành công tới quản lý ${currentUser.id}`);
            }
            catch (err) {
                console.error('❌ Gửi thông báo tới quản lý thất bại:', err.message);
            }
        }
        return { statusCode: 201, message: 'Thêm nhân sự thành công', data: saved };
    }
    async findAll(page = 1, limit = 10, currentUser, keyword, status, roleCode) {
        const qb = this.repo.createQueryBuilder('hr');
        if (roleCode) {
            qb.innerJoin(user_entity_1.User, 'u', 'u.id = hr.userId')
                .innerJoin(role_entity_1.Role, 'role', 'role.id = u.roleId')
                .andWhere('role.roleCode = :roleCode', { roleCode });
        }
        if (currentUser?.roleCode === role_code_enum_1.RoleCode.MANAGER) {
            qb.andWhere('hr.createdBy IN (:...createdByIds)', {
                createdByIds: [currentUser.id, 1],
            });
        }
        if (status) {
            qb.andWhere('hr.status = :status', { status });
        }
        if (keyword && keyword.trim() !== '') {
            qb.andWhere('(hr.fullName LIKE :kw OR hr.employeeCode LIKE :kw)', {
                kw: `%${keyword.trim()}%`,
            });
        }
        qb.orderBy('hr.createdAt', 'DESC')
            .skip((page - 1) * limit)
            .take(limit);
        const [data, total] = await qb.getManyAndCount();
        return {
            statusCode: 200,
            message: 'Thành công',
            data,
            meta: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async findOne(id) {
        const hr = await this.repo.findOne({ where: { id } });
        if (!hr)
            throw new common_1.NotFoundException('Không tìm thấy nhân sự');
        return { statusCode: 200, message: 'Thành công', data: hr };
    }
    async update(id, dto) {
        const hr = await this.repo.findOne({ where: { id } });
        if (!hr)
            throw new common_1.NotFoundException('Không tìm thấy nhân sự');
        Object.assign(hr, dto);
        const saved = await this.repo.save(hr);
        return { statusCode: 200, message: 'Cập nhật thành công', data: saved };
    }
    async remove(id) {
        const hr = await this.repo.findOne({ where: { id } });
        if (!hr)
            throw new common_1.NotFoundException('Không tìm thấy nhân sự');
        await this.repo.softDelete(id);
        return { statusCode: 200, message: 'Xóa nhân sự thành công' };
    }
};
exports.HumanResourcesService = HumanResourcesService;
exports.HumanResourcesService = HumanResourcesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(human_resource_entity_1.HumanResource)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        auths_service_1.AuthsService,
        notifications_service_1.NotificationsService])
], HumanResourcesService);
//# sourceMappingURL=human-resources.service.js.map