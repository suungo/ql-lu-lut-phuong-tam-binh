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
exports.ReflectionsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const reflection_entity_1 = require("./entities/reflection.entity");
const reflection_enum_1 = require("./enums/reflection.enum");
const role_code_enum_1 = require("../../common/enums/role-code.enum");
const damage_category_enum_1 = require("../flood-damages/enums/damage-category.enum");
const floodDamages_service_1 = require("../flood-damages/floodDamages.service");
const notifications_service_1 = require("../notifications/notifications.service");
const residents_service_1 = require("../residents/residents.service");
const users_service_1 = require("../users/users.service");
const ollama_service_1 = require("../ollama/ollama.service");
const dispatch_report_entity_1 = require("../dispatch-reports/entities/dispatch-report.entity");
const dispatch_report_enum_1 = require("../dispatch-reports/enums/dispatch-report.enum");
const user_entity_1 = require("../users/entities/user.entity");
const human_resource_entity_1 = require("../human-resources/entities/human-resource.entity");
let ReflectionsService = class ReflectionsService {
    constructor(repo, dispatchReportRepo, floodDamagesService, notificationsService, residentsService, usersService, ollamaService) {
        this.repo = repo;
        this.dispatchReportRepo = dispatchReportRepo;
        this.floodDamagesService = floodDamagesService;
        this.notificationsService = notificationsService;
        this.residentsService = residentsService;
        this.usersService = usersService;
        this.ollamaService = ollamaService;
    }
    async create(dto, currentUser) {
        const userId = currentUser.id;
        const roleCode = currentUser.roleCode;
        if (roleCode === role_code_enum_1.RoleCode.RESIDENT) {
            const lastReflections = await this.repo.find({
                where: { userId },
                order: { createdAt: 'DESC' },
                take: 5,
            });
            if (lastReflections.length === 5) {
                const oldestOfFive = lastReflections[4];
                const newestOfFive = lastReflections[0];
                const diffMs = newestOfFive.createdAt.getTime() - oldestOfFive.createdAt.getTime();
                const fiveMinutesInMs = 5 * 60 * 1000;
                if (diffMs <= fiveMinutesInMs) {
                    const blockedUntil = new Date(newestOfFive.createdAt.getTime() + 15 * 60 * 1000);
                    const now = new Date();
                    if (now < blockedUntil) {
                        const remainingMinutes = Math.ceil((blockedUntil.getTime() - now.getTime()) / (60 * 1000));
                        throw new common_1.ForbiddenException(`Bạn đã gửi quá nhiều phản ánh trong thời gian ngắn (5 tin trong 5 phút). Vui lòng thử lại sau ${remainingMinutes} phút.`);
                    }
                }
            }
            const userResult = await this.usersService.findOne(userId);
            if (userResult?.data?.reputationPoints === 0) {
                throw new common_1.ForbiddenException('Tài khoản của bạn tạm thời bị khóa chức năng gửi phản ánh do điểm uy tín bằng 0.');
            }
        }
        let reflection;
        if (dto.originalReflectionId &&
            (roleCode === role_code_enum_1.RoleCode.MANAGER || roleCode === role_code_enum_1.RoleCode.ADMIN)) {
            const originalReflection = await this.repo.findOne({
                where: { id: dto.originalReflectionId },
            });
            if (!originalReflection) {
                throw new common_1.NotFoundException('Không tìm thấy phản ánh gốc');
            }
            originalReflection.isPublishedOnMap = true;
            originalReflection.publishedAt = new Date();
            originalReflection.managedBy = userId;
            originalReflection.status = reflection_enum_1.ReflectionStatus.RESOLVED;
            if (!originalReflection.response) {
                originalReflection.response =
                    'Phản ánh đã được xử lý và công khai lên bản đồ bởi Quản lý phường.';
                originalReflection.respondedAt = new Date();
            }
            reflection = originalReflection;
        }
        else {
            reflection = this.repo.create({
                ...dto,
                userId,
                createdBy: userId,
                status: reflection_enum_1.ReflectionStatus.PENDING,
            });
            if (roleCode === role_code_enum_1.RoleCode.MANAGER || roleCode === role_code_enum_1.RoleCode.ADMIN) {
                reflection.status = reflection_enum_1.ReflectionStatus.RESOLVED;
                reflection.response = dto.isPublishedOnMap
                    ? 'Phản ánh đã được xử lý và công khai lên bản đồ bởi Quản lý phường.'
                    : 'Phản ánh được khởi tạo bởi Quản lý phường.';
                reflection.respondedAt = new Date();
                if (dto.isPublishedOnMap) {
                    reflection.isPublishedOnMap = true;
                    reflection.publishedAt = new Date();
                }
            }
        }
        const saved = await this.repo.save(reflection);
        if (roleCode === role_code_enum_1.RoleCode.RESIDENT) {
            this.processResidentReflectionAsync(saved.id, dto, currentUser).catch((err) => console.error('Lỗi khi chạy AI ngầm:', err));
        }
        else {
            this.sendCreationNotifications(saved, roleCode, currentUser).catch((err) => console.error('Lỗi gửi thông báo:', err));
        }
        return {
            statusCode: 200,
            message: 'Gửi phản ánh thành công',
            data: saved,
        };
    }
    async processResidentReflectionAsync(reflectionId, dto, currentUser) {
        try {
            const reflection = await this.repo.findOne({
                where: { id: reflectionId },
            });
            if (!reflection)
                return;
            let nearbyReportsContext = '';
            if (dto.lat && dto.lng) {
                const nearbyReports = await this.findNearbyActiveReflections(dto.lat, dto.lng);
                const otherNearbyReports = nearbyReports.filter((r) => r.id !== reflectionId);
                if (otherNearbyReports.length > 0) {
                    nearbyReportsContext = otherNearbyReports
                        .map((r) => `- ID: ${r.id}, Tiêu đề: "${r.title}", Nội dung: "${r.content}", Địa chỉ: "${r.address || 'vị trí gần đó'}"`)
                        .join('\n');
                }
            }
            const aiResult = await this.ollamaService.analyzeReflection(dto.title, dto.content, dto.description, nearbyReportsContext || undefined);
            if (aiResult.isSpam || aiResult.isSensitive || !aiResult.isValid) {
                reflection.status = reflection_enum_1.ReflectionStatus.REJECTED;
                reflection.rejectReason = `[Kiểm duyệt AI]: ${aiResult.reason || 'Nội dung phản ánh được xác định là không phù hợp hoặc spam.'}`;
                reflection.response = reflection.rejectReason;
                reflection.respondedAt = new Date();
                await this.repo.save(reflection);
                if (reflection.userId) {
                    await this.usersService
                        .adjustReputation(reflection.userId, -1, 'Bị hệ thống AI từ chối do nội dung không phù hợp hoặc spam', reflection.id)
                        .catch((err) => console.error('Lỗi trừ điểm uy tín AI:', err));
                }
            }
            await this.sendCreationNotifications(reflection, role_code_enum_1.RoleCode.RESIDENT, currentUser);
        }
        catch (err) {
            console.error('Lỗi khi xử lý AI ngầm:', err);
            const reflection = await this.repo.findOne({
                where: { id: reflectionId },
            });
            if (reflection) {
                await this.sendCreationNotifications(reflection, role_code_enum_1.RoleCode.RESIDENT, currentUser);
            }
        }
    }
    async sendCreationNotifications(reflection, roleCode, currentUser) {
        switch (roleCode) {
            case role_code_enum_1.RoleCode.RESIDENT: {
                if (reflection.status === reflection_enum_1.ReflectionStatus.REJECTED) {
                    if (reflection.userId) {
                        await this.notificationsService.create({
                            userId: reflection.userId,
                            title: 'Phản ánh bị từ chối tự động',
                            content: reflection.rejectReason ||
                                'Nội dung phản ánh không phù hợp hoặc là spam.',
                            type: 'REFLECTION_REJECTED',
                            referenceId: reflection.id,
                        });
                    }
                    break;
                }
                if (reflection.userId) {
                    await this.notificationsService.create({
                        userId: reflection.userId,
                        title: 'Gửi phản ánh thành công',
                        content: `Phản ánh "${reflection.title}" đã được ghi nhận và đang chờ Cán bộ tăng cường đến xác minh thực địa.`,
                        type: 'NEW_REFLECTION',
                        referenceId: reflection.id,
                    });
                }
                if (reflection.lat && reflection.lng) {
                    const nearbyOfficers = await this.usersService.findNearestByRole(role_code_enum_1.RoleCode.OFFICER, reflection.lat, reflection.lng);
                    for (const officer of nearbyOfficers.slice(0, 3)) {
                        await this.notificationsService.create({
                            userId: officer.id,
                            title: 'Phản ánh mới cần xác minh',
                            content: `Người dân báo cáo sự cố tại: ${reflection.address || 'vị trí không xác định'}. Vui lòng đến xác minh thực địa.`,
                            type: 'NEW_REFLECTION',
                            referenceId: reflection.id,
                        });
                    }
                }
                break;
            }
            case role_code_enum_1.RoleCode.OFFICER: {
                const managers = await this.usersService.findByRoleCodes([
                    role_code_enum_1.RoleCode.MANAGER,
                    role_code_enum_1.RoleCode.ADMIN,
                ]);
                for (const m of managers) {
                    await this.notificationsService.create({
                        userId: m.id,
                        title: 'Phản ánh mới từ Cán bộ tăng cường',
                        content: `Cán bộ tăng cường vừa gửi phản ánh: "${reflection.title}". Vui lòng tiếp nhận và xử lý.`,
                        type: 'NEW_REFLECTION',
                        referenceId: reflection.id,
                    });
                }
                break;
            }
            case role_code_enum_1.RoleCode.PATROL: {
                const managers = await this.usersService.findByRoleCodes([
                    role_code_enum_1.RoleCode.MANAGER,
                    role_code_enum_1.RoleCode.ADMIN,
                ]);
                for (const m of managers) {
                    await this.notificationsService.create({
                        userId: m.id,
                        title: 'Phản ánh mới từ Cán bộ tuần tra',
                        content: `Cán bộ tuần tra vừa gửi phản ánh: "${reflection.title}". Vui lòng tiếp nhận và phân công.`,
                        type: 'NEW_REFLECTION',
                        referenceId: reflection.id,
                    });
                }
                break;
            }
            case role_code_enum_1.RoleCode.INSPECTOR: {
                const managers = await this.usersService.findByRoleCodes([
                    role_code_enum_1.RoleCode.MANAGER,
                    role_code_enum_1.RoleCode.ADMIN,
                ]);
                for (const m of managers) {
                    await this.notificationsService.create({
                        userId: m.id,
                        title: 'Phản ánh mới từ Hậu kiểm',
                        content: `Hậu kiểm vừa gửi phản ánh: "${reflection.title}". Vui lòng tiếp nhận.`,
                        type: 'NEW_REFLECTION',
                        referenceId: reflection.id,
                    });
                }
                break;
            }
            case role_code_enum_1.RoleCode.MANAGER:
            case role_code_enum_1.RoleCode.ADMIN: {
                const allStaff = await this.usersService.findByRoleCodes([
                    role_code_enum_1.RoleCode.OFFICER,
                    role_code_enum_1.RoleCode.INSPECTOR,
                    role_code_enum_1.RoleCode.PATROL,
                ]);
                for (const u of allStaff) {
                    await this.notificationsService.create({
                        userId: u.id,
                        title: 'Dữ liệu phản ánh mới',
                        content: `Quản lý phường đã thêm phản ánh mới lên bản đồ: "${reflection.title}".`,
                        type: 'NEW_REFLECTION',
                        referenceId: reflection.id,
                    });
                }
                break;
            }
        }
    }
    async verifyByOfficer(id, dto, officer) {
        const r = await this.repo.findOne({ where: { id } });
        if (!r)
            throw new common_1.NotFoundException('Không tìm thấy phản ánh');
        if (r.status !== reflection_enum_1.ReflectionStatus.PENDING) {
            throw new common_1.BadRequestException('Phản ánh này không ở trạng thái chờ xác minh');
        }
        r.officerId = officer.id;
        r.verifiedAt = new Date();
        if (!dto.confirmed) {
            if (!dto.rejectReason || !dto.rejectReason.trim()) {
                throw new common_1.BadRequestException('Vui lòng nhập lý do từ chối phản ánh');
            }
            r.status = reflection_enum_1.ReflectionStatus.REJECTED;
            r.rejectReason = dto.rejectReason;
            r.response = dto.rejectReason;
            r.respondedAt = new Date();
            await this.repo.save(r);
            if (r.userId) {
                await this.usersService
                    .adjustReputation(r.userId, -2, `Bị cán bộ từ chối: ${r.rejectReason || 'Nội dung không chính xác'}`, r.id)
                    .catch((err) => console.error('Lỗi trừ điểm uy tín cán bộ:', err));
            }
            if (r.userId) {
                await this.notificationsService.create({
                    userId: r.userId,
                    title: 'Phản ánh không được xác nhận',
                    content: `Phản ánh "${r.title}" của bạn đã bị từ chối: ${r.rejectReason}`,
                    type: 'REFLECTION_REJECTED',
                    referenceId: r.id,
                });
            }
            return { statusCode: 200, message: 'Đã từ chối phản ánh', data: r };
        }
        r.status = reflection_enum_1.ReflectionStatus.VERIFIED;
        if (dto.note)
            r.response = dto.note;
        await this.repo.save(r);
        if (r.userId) {
            await this.notificationsService.create({
                userId: r.userId,
                title: 'Phản ánh đã được xác minh',
                content: `Cán bộ tăng cường đã xác minh sự cố "${r.title}" tại hiện trường. Phản ánh đang được chuyển cho quản lý phường.`,
                type: 'REFLECTION_ACCEPTED',
                referenceId: r.id,
            });
        }
        const managers = await this.usersService.findByRoleCodes([
            role_code_enum_1.RoleCode.MANAGER,
            role_code_enum_1.RoleCode.ADMIN,
        ]);
        for (const m of managers) {
            await this.notificationsService.create({
                userId: m.id,
                title: 'Phản ánh đã được cán bộ xác minh',
                content: `Cán bộ tăng cường đã xác minh phản ánh: "${r.title}". Vui lòng tạo yêu cầu xử lý cho Hậu kiểm.`,
                type: 'REFLECTION_VERIFIED',
                referenceId: r.id,
            });
        }
        return { statusCode: 200, message: 'Đã xác minh phản ánh', data: r };
    }
    async acceptByPatrol(id, patrol) {
        const r = await this.repo.findOne({ where: { id } });
        if (!r)
            throw new common_1.NotFoundException('Không tìm thấy phản ánh');
        if (r.patrolId !== patrol.id)
            throw new common_1.BadRequestException('Phản ánh không được giao cho bạn');
        if (r.patrolAcceptedAt)
            throw new common_1.BadRequestException('Bạn đã nhận việc rồi');
        r.patrolAcceptedAt = new Date();
        await this.repo.save(r);
        const dispatchReport = await this.dispatchReportRepo.findOne({
            where: {
                reflectionId: id,
                assignedTo: patrol.id,
                status: dispatch_report_enum_1.DispatchReportStatus.PENDING,
            },
        });
        if (dispatchReport) {
            dispatchReport.status = dispatch_report_enum_1.DispatchReportStatus.IN_PROGRESS;
            dispatchReport.acceptedAt = new Date();
            await this.dispatchReportRepo.save(dispatchReport);
            await this.notificationsService.create({
                userId: dispatchReport.assignedBy,
                title: 'Cán bộ tuần tra đã đến hiện trường',
                content: `Cán bộ tuần tra đã xác nhận đến nơi và bắt đầu xử lý phản ánh "${r.title}".`,
                type: 'DISPATCH_ACCEPTED',
                referenceId: r.id,
            });
            const managers = await this.usersService.findByRoleCodes([
                role_code_enum_1.RoleCode.MANAGER,
                role_code_enum_1.RoleCode.ADMIN,
            ]);
            for (const m of managers) {
                if (m.id !== dispatchReport.assignedBy) {
                    await this.notificationsService.create({
                        userId: m.id,
                        title: 'Cán bộ tuần tra đã đến hiện trường',
                        content: `Cán bộ tuần tra đã xác nhận đến nơi và bắt đầu xử lý phản ánh "${r.title}". Trạng thái yêu cầu chuyển sang Đang xử lý.`,
                        type: 'DISPATCH_ACCEPTED',
                        referenceId: r.id,
                    });
                }
            }
        }
        return { statusCode: 200, message: 'Đã nhận việc thành công', data: r };
    }
    async updatePatrolLocation(id, dto, patrol) {
        const r = await this.repo.findOne({ where: { id } });
        if (!r)
            throw new common_1.NotFoundException('Không tìm thấy phản ánh');
        if (r.patrolId !== patrol.id) {
            throw new common_1.BadRequestException('Bạn không được phân công xử lý phản ánh này');
        }
        r.patrolLat = dto.lat;
        r.patrolLng = dto.lng;
        await this.repo.save(r);
        this.notificationsService.sendPatrolLocationUpdate(id, dto.lat, dto.lng);
        return {
            statusCode: 200,
            message: 'Đã cập nhật vị trí',
            data: { patrolLat: r.patrolLat, patrolLng: r.patrolLng },
        };
    }
    async submitPatrolReport(id, dto, patrol) {
        const r = await this.repo.findOne({ where: { id } });
        if (!r)
            throw new common_1.NotFoundException('Không tìm thấy phản ánh');
        if (r.patrolId !== patrol.id) {
            throw new common_1.BadRequestException('Bạn không được phân công xử lý phản ánh này');
        }
        r.patrolReport = dto.resolved
            ? dto.patrolReport
            : `[Chưa hoàn thành] ${dto.incompleteReason || ''}\n\n${dto.patrolReport}`;
        r.needReinforcement = false;
        r.status = dto.resolved
            ? reflection_enum_1.ReflectionStatus.COMPLETED
            : reflection_enum_1.ReflectionStatus.IN_PROGRESS;
        await this.repo.save(r);
        const dispatchReport = await this.dispatchReportRepo.findOne({
            where: [
                {
                    reflectionId: id,
                    assignedTo: patrol.id,
                    status: dispatch_report_enum_1.DispatchReportStatus.IN_PROGRESS,
                },
                {
                    reflectionId: id,
                    assignedTo: patrol.id,
                    status: dispatch_report_enum_1.DispatchReportStatus.ACCEPTED,
                },
                {
                    reflectionId: id,
                    assignedTo: patrol.id,
                    status: dispatch_report_enum_1.DispatchReportStatus.PENDING,
                },
            ],
        });
        if (dispatchReport) {
            if (dispatchReport.status === dispatch_report_enum_1.DispatchReportStatus.PENDING) {
                dispatchReport.acceptedAt = new Date();
            }
            dispatchReport.status = dto.resolved
                ? dispatch_report_enum_1.DispatchReportStatus.COMPLETED
                : dispatch_report_enum_1.DispatchReportStatus.IN_PROGRESS;
            dispatchReport.reportContent = r.patrolReport;
            dispatchReport.reflectionStatusUpdate = dto.resolved
                ? 'COMPLETED'
                : 'IN_PROGRESS';
            if (dto.resolved) {
                dispatchReport.completedAt = new Date();
            }
            await this.dispatchReportRepo.save(dispatchReport);
        }
        const managersToNotify = [];
        if (r.managedBy) {
            managersToNotify.push(r.managedBy);
        }
        else {
            const allManagers = await this.usersService.findByRoleCodes([
                role_code_enum_1.RoleCode.MANAGER,
                role_code_enum_1.RoleCode.ADMIN,
            ]);
            managersToNotify.push(...allManagers.map((m) => m.id));
        }
        if (dto.resolved) {
            for (const mId of managersToNotify) {
                await this.notificationsService.create({
                    userId: mId,
                    title: 'Tuần tra báo cáo hoàn thành sự cố',
                    content: `Cán bộ tuần tra đã xử lý xong sự cố "${r.title}". Vui lòng xác nhận hoàn thành.`,
                    type: 'PATROL_COMPLETED',
                    referenceId: r.id,
                });
            }
        }
        else {
            for (const mId of managersToNotify) {
                await this.notificationsService.create({
                    userId: mId,
                    title: 'Cập nhật trạng thái xử lý sự cố',
                    content: `Cán bộ tuần tra gửi cập nhật sự cố "${r.title}": ${dto.incompleteReason || 'Chưa hoàn thành'}.`,
                    type: 'PATROL_UPDATE',
                    referenceId: r.id,
                });
            }
        }
        return { statusCode: 200, message: 'Đã nộp báo cáo', data: r };
    }
    async managerConfirm(id, dto, manager) {
        const r = await this.repo.findOne({ where: { id } });
        if (!r)
            throw new common_1.NotFoundException('Không tìm thấy phản ánh');
        if (r.status !== reflection_enum_1.ReflectionStatus.COMPLETED) {
            throw new common_1.BadRequestException('Phản ánh chưa được tuần tra báo cáo hoàn thành');
        }
        r.status = reflection_enum_1.ReflectionStatus.RESOLVED;
        r.respondedAt = new Date();
        r.managedBy = manager.id;
        if (dto.note)
            r.response = `[Quản lý xác nhận]: ${dto.note}`;
        if (dto.rating !== undefined) {
            if (dto.rating < 1 || dto.rating > 5) {
                throw new common_1.BadRequestException('Điểm đánh giá phải từ 1 đến 5 sao');
            }
            r.rating = dto.rating;
        }
        await this.repo.save(r);
        if (r.userId) {
            await this.usersService
                .adjustReputation(r.userId, 1, 'Hoàn thành xử lý sự cố báo cáo', r.id)
                .catch((err) => console.error('Lỗi cộng điểm uy tín hoàn thành:', err));
        }
        if (r.userId) {
            await this.notificationsService.create({
                userId: r.userId,
                title: 'Sự cố của bạn đã được xử lý',
                content: `Sự cố "${r.title}" tại ${r.address || 'khu vực bạn báo cáo'} đã được khắc phục hoàn toàn. Cảm ơn bạn đã thông báo!`,
                type: 'REFLECTION_RESOLVED',
                referenceId: r.id,
            });
        }
        if (r.officerId) {
            await this.notificationsService.create({
                userId: r.officerId,
                title: 'Sự cố đã được xử lý hoàn thành',
                content: `Sự cố "${r.title}" mà bạn đã xác minh đã được khắc phục. Thông tin sẽ được hiển thị trên bản đồ.`,
                type: 'REFLECTION_RESOLVED',
                referenceId: r.id,
            });
        }
        await this.notifyNearbyResidents(r);
        return {
            statusCode: 200,
            message: 'Đã xác nhận hoàn thành và cập nhật sự cố',
            data: r,
        };
    }
    async createFloodDamageFromReflection(r, creatorId) {
        try {
            const damageCategory = this.mapCategoryToDamageCategory(r.category);
            await this.floodDamagesService.create({
                damageCategory,
                description: `Thiệt hại từ sự cố: ${r.title}${r.description ? `\n${r.description}` : ''}`,
                estimatedValue: 0,
                injuredCount: 0,
                deathCount: 0,
                reflectionId: r.id,
                householdId: undefined,
            }, creatorId);
        }
        catch (err) {
            console.error('Lỗi tạo FloodDamage từ phản ánh:', err);
        }
    }
    async notifyNearbyResidents(r) {
        if (!r.lat || !r.lng)
            return;
        const nearbyResidents = await this.residentsService.findNearby(r.lat, r.lng, 500);
        for (const res of nearbyResidents) {
            if (res.userId) {
                await this.notificationsService.create({
                    userId: res.userId,
                    title: 'Sự cố gần bạn đã được khắc phục',
                    content: `Sự cố tại ${r.address || 'khu vực gần bạn'} đã được xử lý hoàn toàn.`,
                    type: 'NEARBY_REFLECTION',
                    referenceId: r.id,
                });
            }
        }
    }
    async findAll(page = 1, limit = 10, currentUser, keyword, status, isMap, assignedUserId) {
        const qb = this.repo
            .createQueryBuilder('r')
            .leftJoinAndSelect('r.user', 'user')
            .leftJoinAndSelect('user.role', 'role')
            .addSelect(`CASE r.priority 
        WHEN 'HIGH' THEN 1 
        WHEN 'MEDIUM' THEN 2 
        WHEN 'LOW' THEN 3 
        ELSE 4 
      END`, 'priority_order');
        if (isMap) {
            qb.andWhere('r.isPublishedOnMap = :published', { published: true });
        }
        else {
            const roleCode = currentUser?.roleCode;
            if (assignedUserId) {
                qb.andWhere('(r.officerId = :assignedUserId OR r.inspectorId = :assignedUserId OR r.patrolId = :assignedUserId)', { assignedUserId });
            }
            else {
                if (roleCode === role_code_enum_1.RoleCode.ADMIN || roleCode === role_code_enum_1.RoleCode.MANAGER) {
                    qb.andWhere('r.status != :pendingStatus', {
                        pendingStatus: reflection_enum_1.ReflectionStatus.PENDING,
                    });
                }
                else if (roleCode === role_code_enum_1.RoleCode.OFFICER) {
                    qb.andWhere('(r.status = :pendingStatus OR r.officerId = :uid OR r.userId = :uid)', {
                        pendingStatus: reflection_enum_1.ReflectionStatus.PENDING,
                        uid: currentUser?.id,
                    });
                }
                else if (roleCode === role_code_enum_1.RoleCode.INSPECTOR) {
                    qb.andWhere('r.inspectorId = :uid', { uid: currentUser?.id });
                }
                else if (roleCode === role_code_enum_1.RoleCode.PATROL) {
                    qb.andWhere('r.patrolId = :uid', { uid: currentUser?.id });
                }
                else {
                    qb.andWhere('r.userId = :uid', { uid: currentUser?.id });
                }
            }
            if (status)
                qb.andWhere('r.status = :status', { status });
        }
        if (keyword)
            qb.andWhere('(r.title LIKE :kw OR r.content LIKE :kw)', {
                kw: `%${keyword}%`,
            });
        qb.orderBy('priority_order', 'ASC')
            .addOrderBy('r.createdAt', 'DESC')
            .skip((page - 1) * limit)
            .take(limit);
        const [data, total] = await qb.getManyAndCount();
        if (currentUser?.roleCode === role_code_enum_1.RoleCode.RESIDENT) {
            data.forEach((item) => {
                if (item.userId !== currentUser.id) {
                    if (item.user && item.user.fullName) {
                        item.user.fullName = this.maskName(item.user.fullName);
                    }
                    if (item.user) {
                        item.user.phoneNumber = '***';
                        item.user.email = '***';
                        item.user.address = '***';
                    }
                    if (item.address) {
                        item.address = this.maskAddress(item.address);
                    }
                }
            });
        }
        return {
            statusCode: 200,
            message: 'Thành công',
            data,
            meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
        };
    }
    async findMyReflections(userId, page = 1, limit = 10) {
        const [data, total] = await this.repo.findAndCount({
            where: { userId },
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
    async findOne(id, currentUser) {
        const r = await this.repo.findOne({ where: { id }, relations: ['user'] });
        if (!r)
            throw new common_1.NotFoundException('Không tìm thấy phản ánh');
        if (currentUser?.roleCode === role_code_enum_1.RoleCode.RESIDENT &&
            r.userId !== currentUser.id) {
            if (r.user && r.user.fullName) {
                r.user.fullName = this.maskName(r.user.fullName);
            }
            if (r.user) {
                r.user.phoneNumber = '***';
                r.user.email = '***';
                r.user.address = '***';
            }
            if (r.address) {
                r.address = this.maskAddress(r.address);
            }
        }
        if (r.officerId) {
            try {
                const officerUser = await this.repo.manager.findOne(user_entity_1.User, {
                    where: { id: r.officerId },
                });
                const officerHr = await this.repo.manager.findOne(human_resource_entity_1.HumanResource, {
                    where: { userId: r.officerId },
                });
                r['officer'] = {
                    id: r.officerId,
                    fullName: officerUser?.fullName || '',
                    employeeCode: officerHr?.employeeCode || '',
                };
            }
            catch (err) {
                console.error('Lỗi khi truy vấn thông tin cán bộ từ chối:', err);
            }
        }
        return { statusCode: 200, message: 'Thành công', data: r };
    }
    async update(id, dto, userId) {
        const r = await this.repo.findOne({ where: { id } });
        if (!r)
            throw new common_1.NotFoundException('Không tìm thấy phản ánh');
        Object.assign(r, dto);
        return {
            statusCode: 200,
            message: 'Cập nhật thành công',
            data: await this.repo.save(r),
        };
    }
    async remove(id, currentUser) {
        const r = await this.repo.findOne({ where: { id } });
        if (!r)
            throw new common_1.NotFoundException('Không tìm thấy phản ánh');
        const isAdmin = currentUser?.roleCode === role_code_enum_1.RoleCode.ADMIN;
        if (r.status === reflection_enum_1.ReflectionStatus.RESOLVED && !isAdmin) {
            throw new common_1.BadRequestException('Không thể xóa phản ánh đã hoàn thành');
        }
        await this.repo.softDelete(id);
        return { statusCode: 200, message: 'Xóa thành công' };
    }
    async updateStatus(id, status, currentUser) {
        const r = await this.repo.findOne({ where: { id } });
        if (!r)
            throw new common_1.NotFoundException('Không tìm thấy phản ánh');
        r.status = status;
        const updated = await this.repo.save(r);
        return { statusCode: 200, message: 'Cập nhật thành công', data: updated };
    }
    mapCategoryToDamageCategory(reflectionCategory) {
        const categoryMap = {
            FLOOD: damage_category_enum_1.DamageCategory.PROPERTY,
            LANDSLIDE: damage_category_enum_1.DamageCategory.PROPERTY,
            STRUCTURAL_DAMAGE: damage_category_enum_1.DamageCategory.PROPERTY,
            INFRASTRUCTURE: damage_category_enum_1.DamageCategory.PROPERTY,
            ROAD_DAMAGE: damage_category_enum_1.DamageCategory.PROPERTY,
            BRIDGE_DAMAGE: damage_category_enum_1.DamageCategory.PROPERTY,
            ECONOMIC: damage_category_enum_1.DamageCategory.ECONOMIC,
            HEALTH: damage_category_enum_1.DamageCategory.HEALTH,
            FATALITY: damage_category_enum_1.DamageCategory.FATALITY,
            OTHER: damage_category_enum_1.DamageCategory.OTHER,
        };
        return categoryMap[reflectionCategory] || damage_category_enum_1.DamageCategory.OTHER;
    }
    async findNearbyActiveReflections(lat, lng, minutes = 120, maxDistanceMeters = 150) {
        if (!lat || !lng)
            return [];
        const latDelta = maxDistanceMeters / 111111;
        const lngDelta = maxDistanceMeters / (111111 * Math.cos((lat * Math.PI) / 180));
        const sinceDate = new Date(Date.now() - minutes * 60 * 1000);
        return this.repo
            .createQueryBuilder('r')
            .where('r.createdAt >= :sinceDate', { sinceDate })
            .andWhere('r.status IN (:...statuses)', {
            statuses: [
                reflection_enum_1.ReflectionStatus.PENDING,
                reflection_enum_1.ReflectionStatus.VERIFIED,
                reflection_enum_1.ReflectionStatus.ASSIGNED,
                reflection_enum_1.ReflectionStatus.IN_PROGRESS,
            ],
        })
            .andWhere('r.lat BETWEEN :minLat AND :maxLat', {
            minLat: lat - latDelta,
            maxLat: lat + latDelta,
        })
            .andWhere('r.lng BETWEEN :minLng AND :maxLng', {
            minLng: lng - lngDelta,
            maxLng: lng + lngDelta,
        })
            .getMany();
    }
    async getAssignedStats(userId) {
        const reflections = await this.repo.find({
            where: [
                { officerId: userId },
                { inspectorId: userId },
                { patrolId: userId },
            ],
            select: ['id', 'status'],
        });
        const stats = {
            total: reflections.length,
            completed: reflections.filter((r) => r.status === reflection_enum_1.ReflectionStatus.RESOLVED ||
                r.status === reflection_enum_1.ReflectionStatus.COMPLETED).length,
            inProgress: reflections.filter((r) => r.status === reflection_enum_1.ReflectionStatus.IN_PROGRESS ||
                r.status === reflection_enum_1.ReflectionStatus.ASSIGNED).length,
            pending: reflections.filter((r) => r.status === reflection_enum_1.ReflectionStatus.PENDING ||
                r.status === reflection_enum_1.ReflectionStatus.VERIFIED).length,
            rejected: reflections.filter((r) => r.status === reflection_enum_1.ReflectionStatus.REJECTED).length,
        };
        return {
            statusCode: 200,
            message: 'Lấy thống kê nhiệm vụ thành công',
            data: stats,
        };
    }
    async rateReflection(id, rating, userId, comment) {
        const r = await this.repo.findOne({ where: { id } });
        if (!r)
            throw new common_1.NotFoundException('Không tìm thấy phản ánh');
        if (r.userId !== userId) {
            throw new common_1.ForbiddenException('Bạn không phải người tạo phản ánh này để thực hiện đánh giá');
        }
        if (r.status !== reflection_enum_1.ReflectionStatus.RESOLVED) {
            throw new common_1.BadRequestException('Chỉ có thể đánh giá phản ánh đã hoàn thành');
        }
        if (rating < 1 || rating > 5) {
            throw new common_1.BadRequestException('Số sao đánh giá phải từ 1 đến 5');
        }
        r.rating = rating;
        if (comment) {
            r.response = r.response
                ? `${r.response}\n[Đánh giá của cư dân - ${rating} sao]: ${comment}`
                : `[Đánh giá của cư dân - ${rating} sao]: ${comment}`;
        }
        await this.repo.save(r);
        return {
            statusCode: 200,
            message: 'Đánh giá thành công',
            data: r,
        };
    }
    maskName(fullName) {
        if (!fullName)
            return '';
        const parts = fullName.trim().split(/\s+/);
        if (parts.length === 0)
            return '';
        return `${parts[0]} ***`;
    }
    maskAddress(address) {
        if (!address)
            return '';
        const parts = address.split(',').map((p) => p.trim());
        if (parts.length > 2) {
            return `***, ${parts.slice(parts.length - 2).join(', ')}`;
        }
        return '***';
    }
};
exports.ReflectionsService = ReflectionsService;
exports.ReflectionsService = ReflectionsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(reflection_entity_1.Reflection)),
    __param(1, (0, typeorm_1.InjectRepository)(dispatch_report_entity_1.DispatchReport)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        floodDamages_service_1.FloodDamagesService,
        notifications_service_1.NotificationsService,
        residents_service_1.ResidentsService,
        users_service_1.UsersService,
        ollama_service_1.OllamaService])
], ReflectionsService);
//# sourceMappingURL=reflections.service.js.map