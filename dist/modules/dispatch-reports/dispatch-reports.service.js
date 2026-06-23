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
exports.DispatchReportsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const notifications_service_1 = require("../notifications/notifications.service");
const reflection_entity_1 = require("../reflections/entities/reflection.entity");
const reflection_enum_1 = require("../reflections/enums/reflection.enum");
const dispatch_report_entity_1 = require("./entities/dispatch-report.entity");
const dispatch_report_enum_1 = require("./enums/dispatch-report.enum");
let DispatchReportsService = class DispatchReportsService {
    constructor(repo, reflectionRepo, notificationsService) {
        this.repo = repo;
        this.reflectionRepo = reflectionRepo;
        this.notificationsService = notificationsService;
    }
    async createDispatchToInspector(dto, managerId) {
        const reflection = await this.reflectionRepo.findOne({
            where: { id: dto.reflectionId },
        });
        if (!reflection)
            throw new common_1.NotFoundException('Không tìm thấy phản ánh');
        if (![reflection_enum_1.ReflectionStatus.VERIFIED, reflection_enum_1.ReflectionStatus.ASSIGNED].includes(reflection.status)) {
            throw new common_1.BadRequestException('Phản ánh chưa được xác minh hoặc không phù hợp để điều chuyển');
        }
        const existingPending = await this.repo.findOne({
            where: {
                reflectionId: dto.reflectionId,
                type: dispatch_report_enum_1.DispatchReportType.MANAGER_TO_INSPECTOR,
                status: dispatch_report_enum_1.DispatchReportStatus.PENDING,
            },
        });
        if (existingPending) {
            const now = new Date();
            if (now < existingPending.expiredAt) {
                throw new common_1.BadRequestException('Đang trong thời gian chờ xác nhận (5 phút). Không thể tạo điều chuyển mới.');
            }
            existingPending.status = dispatch_report_enum_1.DispatchReportStatus.EXPIRED;
            await this.repo.save(existingPending);
        }
        const now = new Date();
        const expiredAt = new Date(now.getTime() + 5 * 60 * 1000);
        const code = `DR-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        const report = this.repo.create({
            code,
            type: dispatch_report_enum_1.DispatchReportType.MANAGER_TO_INSPECTOR,
            status: dispatch_report_enum_1.DispatchReportStatus.PENDING,
            reflectionId: dto.reflectionId,
            assignedBy: managerId,
            assignedTo: dto.assignedTo,
            assignedAt: now,
            expiredAt,
            title: dto.title || `Điều chuyển phản ánh: ${reflection.title}`,
            description: dto.description,
            note: dto.note,
            expectedTime: dto.expectedTime,
            createdBy: managerId,
        });
        const saved = await this.repo.save(report);
        reflection.status = reflection_enum_1.ReflectionStatus.ASSIGNED;
        reflection.inspectorId = dto.assignedTo;
        reflection.managedBy = managerId;
        reflection.assignedAt = now;
        reflection.inspectorAcceptedAt = null;
        await this.reflectionRepo.save(reflection);
        await this.notificationsService.create({
            userId: dto.assignedTo,
            title: 'Điều chuyển phản ánh mới',
            content: `Quản lý đã điều chuyển phản ánh "${reflection.title}" cho bạn. Vui lòng xác nhận trong vòng 5 phút.`,
            type: 'DISPATCH_NEW',
            referenceId: reflection.id,
        });
        return {
            statusCode: 201,
            message: 'Tạo điều chuyển thành công',
            data: saved,
        };
    }
    async createDispatchToPatrol(dto, inspectorId) {
        const reflection = await this.reflectionRepo.findOne({
            where: { id: dto.reflectionId },
        });
        if (!reflection)
            throw new common_1.NotFoundException('Không tìm thấy phản ánh');
        if (![
            reflection_enum_1.ReflectionStatus.VERIFIED,
            reflection_enum_1.ReflectionStatus.ASSIGNED,
            reflection_enum_1.ReflectionStatus.IN_PROGRESS,
        ].includes(reflection.status)) {
            throw new common_1.BadRequestException('Phản ánh chưa được xác minh hoặc không phù hợp để điều Tuần tra');
        }
        const existingPending = await this.repo.findOne({
            where: {
                reflectionId: dto.reflectionId,
                type: dispatch_report_enum_1.DispatchReportType.INSPECTOR_TO_PATROL,
                status: dispatch_report_enum_1.DispatchReportStatus.PENDING,
            },
        });
        if (existingPending) {
            const now = new Date();
            if (existingPending.expiredAt && now < existingPending.expiredAt) {
                throw new common_1.BadRequestException('Đang trong thời gian chờ xác nhận (5 phút). Không thể tạo yêu cầu tuần tra mới.');
            }
            existingPending.status = dispatch_report_enum_1.DispatchReportStatus.EXPIRED;
            await this.repo.save(existingPending);
        }
        const isCustom = !!dto.customHandler;
        const now = new Date();
        const code = `DR-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        const report = this.repo.create({
            code,
            type: dispatch_report_enum_1.DispatchReportType.INSPECTOR_TO_PATROL,
            status: isCustom
                ? dispatch_report_enum_1.DispatchReportStatus.COMPLETED
                : dispatch_report_enum_1.DispatchReportStatus.PENDING,
            reflectionId: dto.reflectionId,
            assignedBy: inspectorId,
            assignedTo: isCustom ? null : dto.assignedTo || null,
            customHandler: isCustom ? dto.customHandler : null,
            assignedAt: now,
            completedAt: isCustom ? now : null,
            expiredAt: null,
            title: dto.title || `Yêu cầu tuần tra: ${reflection.title}`,
            description: dto.description,
            note: dto.note,
            expectedTime: dto.expectedTime,
            createdBy: inspectorId,
        });
        const saved = await this.repo.save(report);
        reflection.status = isCustom
            ? reflection_enum_1.ReflectionStatus.RESOLVED
            : reflection_enum_1.ReflectionStatus.IN_PROGRESS;
        reflection.patrolId = isCustom ? null : dto.assignedTo || null;
        reflection.dispatchedAt = now;
        reflection.patrolAcceptedAt = isCustom ? now : null;
        await this.reflectionRepo.save(reflection);
        if (!isCustom && dto.assignedTo) {
            await this.notificationsService.create({
                userId: dto.assignedTo,
                title: 'Nhiệm vụ tuần tra mới',
                content: `Quản lý đã yêu cầu bạn xử lý sự cố "${reflection.title}" tại ${reflection.address || 'vị trí không xác định'}. Vui lòng xác nhận nhận việc.`,
                type: 'DISPATCH_NEW',
                referenceId: reflection.id,
            });
        }
        return {
            statusCode: 201,
            message: isCustom
                ? 'Ghi nhận xử lý hoàn thành thành công'
                : 'Tạo yêu cầu Tuần tra thành công',
            data: saved,
        };
    }
    async acceptDispatch(id, userId) {
        const report = await this.repo.findOne({
            where: { id },
            relations: ['reflection'],
        });
        if (!report)
            throw new common_1.NotFoundException('Không tìm thấy biên bản');
        if (report.assignedTo !== userId)
            throw new common_1.BadRequestException('Bạn không phải người được chỉ định');
        if (report.status !== dispatch_report_enum_1.DispatchReportStatus.PENDING)
            throw new common_1.BadRequestException('Biên bản không ở trạng thái chờ xác nhận');
        const now = new Date();
        if (now > report.expiredAt) {
            report.status = dispatch_report_enum_1.DispatchReportStatus.EXPIRED;
            await this.repo.save(report);
            throw new common_1.BadRequestException('Đã quá thời hạn xác nhận (5 phút). Yêu cầu tuần tra đã bị hủy.');
        }
        report.status = dispatch_report_enum_1.DispatchReportStatus.ACCEPTED;
        report.acceptedAt = now;
        await this.repo.save(report);
        const reflection = report.reflection;
        if (report.type === dispatch_report_enum_1.DispatchReportType.MANAGER_TO_INSPECTOR) {
            reflection.inspectorAcceptedAt = now;
        }
        else {
            reflection.patrolAcceptedAt = now;
        }
        await this.reflectionRepo.save(reflection);
        await this.notificationsService.create({
            userId: report.assignedBy,
            title: 'Yêu cầu tuần tra đã được xác nhận',
            content: `Cán bộ đã xác nhận yêu cầu tuần tra phản ánh "${reflection.title}".`,
            type: 'DISPATCH_ACCEPTED',
            referenceId: reflection.id,
        });
        return {
            statusCode: 200,
            message: 'Đã xác nhận nhận việc',
            data: report,
        };
    }
    async updateReport(id, dto, userId) {
        const report = await this.repo.findOne({
            where: { id },
            relations: ['reflection'],
        });
        if (!report)
            throw new common_1.NotFoundException('Không tìm thấy biên bản');
        if (report.assignedTo !== userId && report.assignedBy !== userId) {
            throw new common_1.BadRequestException('Bạn không có quyền cập nhật biên bản này');
        }
        if (dto.reportContent !== undefined)
            report.reportContent = dto.reportContent;
        if (dto.reflectionStatusUpdate !== undefined)
            report.reflectionStatusUpdate = dto.reflectionStatusUpdate;
        if (dto.rejectReason !== undefined)
            report.rejectReason = dto.rejectReason;
        if (dto.attachments !== undefined)
            report.attachments = dto.attachments;
        if (dto.title !== undefined)
            report.title = dto.title;
        if (dto.description !== undefined)
            report.description = dto.description;
        if (dto.expectedTime !== undefined)
            report.expectedTime = dto.expectedTime;
        if (dto.status) {
            report.status = dto.status;
            if (dto.status === dispatch_report_enum_1.DispatchReportStatus.COMPLETED) {
                report.completedAt = new Date();
            }
        }
        report.updatedBy = userId;
        const saved = await this.repo.save(report);
        if (dto.status === dispatch_report_enum_1.DispatchReportStatus.COMPLETED) {
            await this.notificationsService.create({
                userId: report.assignedBy,
                title: 'Biên bản báo cáo hoàn thành',
                content: `Cán bộ đã hoàn thành báo cáo cho phản ánh "${report.reflection?.title}".`,
                type: 'DISPATCH_COMPLETED',
                referenceId: report.reflectionId,
            });
        }
        return {
            statusCode: 200,
            message: 'Cập nhật biên bản thành công',
            data: saved,
        };
    }
    async findAll(page = 1, limit = 10, filters) {
        const qb = this.repo
            .createQueryBuilder('dr')
            .leftJoinAndSelect('dr.reflection', 'reflection')
            .leftJoinAndSelect('dr.assigner', 'assigner')
            .leftJoinAndSelect('dr.assignee', 'assignee')
            .leftJoinAndSelect('reflection.user', 'reflectionUser')
            .addSelect(`CASE reflection.priority 
        WHEN 'HIGH' THEN 1 
        WHEN 'MEDIUM' THEN 2 
        WHEN 'LOW' THEN 3 
        ELSE 4 
      END`, 'priority_order');
        if (filters?.status) {
            qb.andWhere('dr.status = :status', { status: filters.status });
        }
        if (filters?.type) {
            qb.andWhere('dr.type = :type', { type: filters.type });
        }
        if (filters?.reflectionId) {
            qb.andWhere('dr.reflectionId = :reflectionId', {
                reflectionId: filters.reflectionId,
            });
        }
        if (filters?.assignedTo) {
            qb.andWhere('dr.assignedTo = :assignedTo', {
                assignedTo: filters.assignedTo,
            });
        }
        if (filters?.assignedBy) {
            qb.andWhere('dr.assignedBy = :assignedBy', {
                assignedBy: filters.assignedBy,
            });
        }
        if (filters?.search) {
            qb.andWhere('(LOWER(dr.code) LIKE LOWER(:search) OR LOWER(dr.title) LIKE LOWER(:search) OR LOWER(dr.description) LIKE LOWER(:search) OR LOWER(reflection.title) LIKE LOWER(:search))', { search: `%${filters.search}%` });
        }
        await this.repo
            .createQueryBuilder()
            .update(dispatch_report_entity_1.DispatchReport)
            .set({ status: dispatch_report_enum_1.DispatchReportStatus.EXPIRED })
            .where('status = :status', { status: dispatch_report_enum_1.DispatchReportStatus.PENDING })
            .andWhere('expired_at IS NOT NULL AND expired_at < :now', {
            now: new Date(),
        })
            .execute();
        qb.orderBy('priority_order', 'ASC')
            .addOrderBy('dr.createdAt', 'DESC')
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
    async findOne(id) {
        const report = await this.repo.findOne({
            where: { id },
            relations: ['reflection', 'assigner', 'assignee', 'reflection.user'],
        });
        if (!report)
            throw new common_1.NotFoundException('Không tìm thấy biên bản');
        return { statusCode: 200, message: 'Thành công', data: report };
    }
    async findByReflection(reflectionId) {
        const reports = await this.repo.find({
            where: { reflectionId },
            relations: ['assigner', 'assignee'],
            order: { createdAt: 'DESC' },
        });
        return { statusCode: 200, message: 'Thành công', data: reports };
    }
    async remove(id) {
        const report = await this.repo.findOne({ where: { id } });
        if (!report)
            throw new common_1.NotFoundException('Không tìm thấy biên bản');
        await this.repo.softDelete(id);
        return { statusCode: 200, message: 'Xóa thành công' };
    }
    async nudgeDispatch(id, senderId) {
        const report = await this.repo.findOne({
            where: { id },
            relations: ['reflection'],
        });
        if (!report)
            throw new common_1.NotFoundException('Không tìm thấy biên bản');
        if (!report.assignedTo) {
            throw new common_1.BadRequestException('Yêu cầu tuần tra chưa được bàn giao cho cán bộ nào');
        }
        await this.notificationsService.create({
            userId: report.assignedTo,
            title: 'Yêu cầu cập nhật tiến độ!',
            content: `Yêu cầu xử lý sự cố "${report.reflection?.title || 'yêu cầu tuần tra'}" cần được thực hiện khẩn trương. Vui lòng cập nhật trạng thái báo cáo.`,
            type: 'DISPATCH_NUDGE',
            referenceId: report.reflectionId,
        });
        return {
            statusCode: 200,
            message: 'Đã gửi yêu cầu thúc giục cán bộ xử lý',
            data: report,
        };
    }
};
exports.DispatchReportsService = DispatchReportsService;
exports.DispatchReportsService = DispatchReportsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(dispatch_report_entity_1.DispatchReport)),
    __param(1, (0, typeorm_1.InjectRepository)(reflection_entity_1.Reflection)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        notifications_service_1.NotificationsService])
], DispatchReportsService);
//# sourceMappingURL=dispatch-reports.service.js.map