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
exports.VerificationsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const role_code_enum_1 = require("../../common/enums/role-code.enum");
const typeorm_2 = require("typeorm");
const auths_service_1 = require("../auths/auths.service");
const notifications_service_1 = require("../notifications/notifications.service");
const reflection_entity_1 = require("../reflections/entities/reflection.entity");
const reflection_enum_1 = require("../reflections/enums/reflection.enum");
const resident_contacts_service_1 = require("../resident-contacts/resident-contacts.service");
const users_service_1 = require("../users/users.service");
const verification_entity_1 = require("./entities/verification.entity");
const verification_enum_1 = require("./enums/verification.enum");
let VerificationsService = class VerificationsService {
    constructor(repo, reflectionRepo, notificationsService, usersService, residentContactsService, authsService) {
        this.repo = repo;
        this.reflectionRepo = reflectionRepo;
        this.notificationsService = notificationsService;
        this.usersService = usersService;
        this.residentContactsService = residentContactsService;
        this.authsService = authsService;
    }
    async create(dto, user_id) {
        const code = `VR-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        let isMatchedContact = null;
        if (dto.verificationType === verification_enum_1.VerificationType.RESIDENT_REGISTRATION &&
            dto.cccd) {
            const contact = await this.residentContactsService.findByCccd(dto.cccd);
            isMatchedContact = !!contact;
        }
        const saved = await this.repo.save(this.repo.create({ ...dto, user_id, code, isMatchedContact }));
        return {
            statusCode: 201,
            message: 'Gửi yêu cầu xác minh thành công',
            data: { ...saved, isMatchedContact },
        };
    }
    async findAll(page = 1, limit = 10, status) {
        const qb = this.repo
            .createQueryBuilder('v')
            .leftJoinAndSelect('v.user', 'user');
        if (status)
            qb.andWhere('v.status = :status', { status });
        qb.orderBy('v.createdAt', 'DESC')
            .skip((page - 1) * limit)
            .take(limit);
        const [data, total] = await qb.getManyAndCount();
        return {
            statusCode: 200,
            message: 'Thành công',
            data,
            meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
        };
    }
    async findMyVerifications(userId, page = 1, limit = 10) {
        const [data, total] = await this.repo.findAndCount({
            where: { user_id: userId },
            order: { createdAt: 'DESC' },
            skip: (page - 1) * limit,
            take: limit,
        });
        return {
            statusCode: 200,
            message: 'Thành công',
            data,
            meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
        };
    }
    async findOne(id) {
        const v = await this.repo.findOne({ where: { id }, relations: ['user'] });
        if (!v)
            throw new common_1.NotFoundException('Không tìm thấy yêu cầu xác minh');
        return { statusCode: 200, message: 'Thành công', data: v };
    }
    async update(id, dto, reviewerId) {
        const v = await this.repo.findOne({ where: { id } });
        if (!v)
            throw new common_1.NotFoundException('Không tìm thấy yêu cầu xác minh');
        if (dto.status &&
            [
                verification_enum_1.VerificationStatus.APPROVED,
                verification_enum_1.VerificationStatus.REJECTED,
                verification_enum_1.VerificationStatus.COMPLETED,
            ].includes(dto.status)) {
            v.reviewedAt = new Date();
            v.reviewedBy = reviewerId;
            const reviewerResponse = await this.usersService.findOne(reviewerId);
            const reviewer = reviewerResponse.data;
            if (v.verificationType === verification_enum_1.VerificationType.REFLECTION && v.referenceId) {
                const reflection = await this.reflectionRepo.findOne({
                    where: { id: v.referenceId },
                    relations: ['user'],
                });
                if (reflection) {
                    if (dto.status === verification_enum_1.VerificationStatus.APPROVED) {
                        reflection.status = reflection_enum_1.ReflectionStatus.VERIFIED;
                        reflection.managedBy = reviewerId;
                        await this.notificationsService.create({
                            userId: reflection.userId,
                            title: 'Phản ánh đang được xử lý',
                            content: `Chào ${reflection.user?.fullName || 'bạn'}, phản ánh "${reflection.title}" của bạn đã được tình nguyện viên xác minh và đang trong quá trình xử lý.`,
                            type: 'REFLECTION_UPDATE',
                            referenceId: reflection.id,
                        });
                        const residentName = reflection.user?.fullName || 'Người dân';
                        const managers = await this.usersService.findByRoleCodes([
                            role_code_enum_1.RoleCode.MANAGER,
                            role_code_enum_1.RoleCode.ADMIN,
                        ]);
                        for (const m of managers) {
                            await this.notificationsService.create({
                                userId: m.id,
                                title: 'Phản ánh mới đã được xác minh',
                                content: `Phản ánh "${reflection.title}" từ ${residentName} đã được xác minh bởi ${reviewer.fullName} (Tình nguyện viên). Nội dung: ${reflection.content}`,
                                type: 'NEW_REFLECTION',
                                referenceId: reflection.id,
                            });
                        }
                    }
                    else if (dto.status === verification_enum_1.VerificationStatus.REJECTED) {
                        reflection.status = reflection_enum_1.ReflectionStatus.REJECTED;
                        await this.notificationsService.create({
                            userId: reflection.userId,
                            title: 'Phản ánh bị từ chối',
                            content: `Phản ánh "${reflection.title}" của bạn đã bị từ chối xác minh.`,
                            type: 'REFLECTION_UPDATE',
                            referenceId: reflection.id,
                        });
                    }
                    else if (dto.status === verification_enum_1.VerificationStatus.COMPLETED) {
                        reflection.status = reflection_enum_1.ReflectionStatus.RESOLVED;
                        await this.notificationsService.create({
                            userId: reflection.userId,
                            title: 'Sự cố đã xử lý xong',
                            content: `Chào ${reflection.user?.fullName || 'bạn'}, sự cố "${reflection.title}" mà bạn phản ánh đã được xử lý hoàn tất. Cảm ơn bạn đã đóng góp! Vui lòng truy cập vào phần quản lý thiệt hại để cập nhật thiệt hại do sự cố gây ra nếu có (Lưu ý: Đây là tiền đề để giúp cơ quan chức năng khắc phục sự cố)`,
                            type: 'REFLECTION_RESOLVED',
                            referenceId: reflection.id,
                        });
                    }
                    await this.reflectionRepo.save(reflection);
                }
            }
            if (v.verificationType === verification_enum_1.VerificationType.RESIDENT_REGISTRATION) {
                const userRes = await this.usersService
                    .findOne(v.user_id)
                    .catch(() => null);
                const userData = userRes?.data;
                if (dto.status === verification_enum_1.VerificationStatus.APPROVED) {
                    if (userData) {
                        this.notificationsService
                            .create({
                            userId: v.user_id,
                            title: 'Tài khoản đã được phê duyệt',
                            content: `Chào ${userData.fullName || 'bạn'}, tài khoản đăng ký của bạn đã được Ban quản trị phê duyệt. Bạn có thể đăng nhập hệ thống ngay bây giờ.`,
                            type: 'VERIFICATION_UPDATE',
                            referenceId: v.id,
                        })
                            .catch(console.error);
                    }
                }
                else if (dto.status === verification_enum_1.VerificationStatus.REJECTED) {
                    if (userData) {
                        this.notificationsService
                            .create({
                            userId: v.user_id,
                            title: 'Yêu cầu đăng ký bị từ chối',
                            content: `Chào ${userData.fullName || 'bạn'}, yêu cầu đăng ký tài khoản của bạn đã bị từ chối${dto.reviewNote ? `: ${dto.reviewNote}` : '.'}`,
                            type: 'VERIFICATION_UPDATE',
                            referenceId: v.id,
                        })
                            .catch(console.error);
                    }
                }
            }
        }
        Object.assign(v, dto);
        return {
            statusCode: 200,
            message: 'Cập nhật thành công',
            data: await this.repo.save(v),
        };
    }
    async remove(id) {
        const v = await this.repo.findOne({ where: { id } });
        if (!v)
            throw new common_1.NotFoundException('Không tìm thấy yêu cầu xác minh');
        await this.repo.softDelete(id);
        return { statusCode: 200, message: 'Xóa thành công' };
    }
};
exports.VerificationsService = VerificationsService;
exports.VerificationsService = VerificationsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(verification_entity_1.Verification)),
    __param(1, (0, typeorm_1.InjectRepository)(reflection_entity_1.Reflection)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        notifications_service_1.NotificationsService,
        users_service_1.UsersService,
        resident_contacts_service_1.ResidentContactsService,
        auths_service_1.AuthsService])
], VerificationsService);
//# sourceMappingURL=verifications.service.js.map