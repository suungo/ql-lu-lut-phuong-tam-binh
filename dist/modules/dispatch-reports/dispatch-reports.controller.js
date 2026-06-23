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
exports.DispatchReportsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const role_code_enum_1 = require("../../common/enums/role-code.enum");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const dispatch_reports_service_1 = require("./dispatch-reports.service");
const dispatch_report_dto_1 = require("./dto/dispatch-report.dto");
const dispatch_report_enum_1 = require("./enums/dispatch-report.enum");
let DispatchReportsController = class DispatchReportsController {
    constructor(service) {
        this.service = service;
    }
    createToInspector(dto, user) {
        return this.service.createDispatchToInspector(dto, user.id);
    }
    createToPatrol(dto, user) {
        return this.service.createDispatchToPatrol(dto, user.id);
    }
    accept(id, user) {
        return this.service.acceptDispatch(id, user.id);
    }
    nudge(id, user) {
        return this.service.nudgeDispatch(id, user.id);
    }
    update(id, dto, user) {
        return this.service.updateReport(id, dto, user.id);
    }
    findAll(page = 1, limit = 10, status, type, reflectionId, search, user) {
        const filters = {};
        if (status)
            filters.status = status;
        if (type)
            filters.type = type;
        if (reflectionId)
            filters.reflectionId = +reflectionId;
        if (search)
            filters.search = search;
        const roleCode = user?.roleCode;
        if (roleCode === role_code_enum_1.RoleCode.INSPECTOR) {
        }
        else if (roleCode === role_code_enum_1.RoleCode.PATROL) {
            filters.assignedTo = user.id;
        }
        return this.service.findAll(+page, +limit, filters);
    }
    findMy(user, page = 1, limit = 10) {
        return this.service.findAll(+page, +limit, { assignedTo: user.id });
    }
    findByReflection(reflectionId) {
        return this.service.findByReflection(reflectionId);
    }
    findOne(id) {
        return this.service.findOne(id);
    }
    remove(id) {
        return this.service.remove(id);
    }
};
exports.DispatchReportsController = DispatchReportsController;
__decorate([
    (0, common_1.Post)('to-inspector'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(role_code_enum_1.RoleCode.MANAGER, role_code_enum_1.RoleCode.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: '[MANAGER] Tạo điều chuyển cho Hậu kiểm' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dispatch_report_dto_1.CreateDispatchReportDto, Object]),
    __metadata("design:returntype", void 0)
], DispatchReportsController.prototype, "createToInspector", null);
__decorate([
    (0, common_1.Post)('to-patrol'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(role_code_enum_1.RoleCode.MANAGER, role_code_enum_1.RoleCode.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: '[MANAGER] Tạo yêu cầu Tuần tra' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dispatch_report_dto_1.CreateDispatchReportDto, Object]),
    __metadata("design:returntype", void 0)
], DispatchReportsController.prototype, "createToPatrol", null);
__decorate([
    (0, common_1.Patch)(':id/accept'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(role_code_enum_1.RoleCode.INSPECTOR, role_code_enum_1.RoleCode.PATROL),
    (0, swagger_1.ApiOperation)({ summary: 'Xác nhận nhận yêu cầu Tuần tra' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], DispatchReportsController.prototype, "accept", null);
__decorate([
    (0, common_1.Post)(':id/nudge'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(role_code_enum_1.RoleCode.INSPECTOR, role_code_enum_1.RoleCode.MANAGER, role_code_enum_1.RoleCode.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Thúc giục cán bộ xử lý' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], DispatchReportsController.prototype, "nudge", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Cập nhật biên bản báo cáo' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, dispatch_report_dto_1.UpdateDispatchReportDto, Object]),
    __metadata("design:returntype", void 0)
], DispatchReportsController.prototype, "update", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Danh sách yêu cầu Tuần tra' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'status', enum: dispatch_report_enum_1.DispatchReportStatus, required: false }),
    (0, swagger_1.ApiQuery)({ name: 'type', enum: dispatch_report_enum_1.DispatchReportType, required: false }),
    (0, swagger_1.ApiQuery)({ name: 'reflectionId', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'search', required: false }),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('status')),
    __param(3, (0, common_1.Query)('type')),
    __param(4, (0, common_1.Query)('reflectionId')),
    __param(5, (0, common_1.Query)('search')),
    __param(6, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, String, String, Number, String, Object]),
    __metadata("design:returntype", void 0)
], DispatchReportsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('my'),
    (0, swagger_1.ApiOperation)({ summary: 'Danh sách yêu cầu Tuần tra của tôi' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", void 0)
], DispatchReportsController.prototype, "findMy", null);
__decorate([
    (0, common_1.Get)('reflection/:reflectionId'),
    (0, swagger_1.ApiOperation)({ summary: 'Biên bản theo phản ánh' }),
    __param(0, (0, common_1.Param)('reflectionId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], DispatchReportsController.prototype, "findByReflection", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Chi tiết yêu cầu Tuần tra' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], DispatchReportsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(role_code_enum_1.RoleCode.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Xóa yêu cầu Tuần tra' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], DispatchReportsController.prototype, "remove", null);
exports.DispatchReportsController = DispatchReportsController = __decorate([
    (0, swagger_1.ApiTags)('Quản lý yêu cầu Tuần tra (Patrol Requests)'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [dispatch_reports_service_1.DispatchReportsService])
], DispatchReportsController);
//# sourceMappingURL=dispatch-reports.controller.js.map