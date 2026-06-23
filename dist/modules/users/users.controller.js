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
exports.UsersController = void 0;
const common_1 = require("@nestjs/common");
const create_user_dto_1 = require("./dto/create-user.dto");
const users_service_1 = require("./users.service");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const role_code_enum_1 = require("../../common/enums/role-code.enum");
let UsersController = class UsersController {
    constructor(service) {
        this.service = service;
    }
    create(dto) {
        return this.service.create(dto);
    }
    findAll(page = 1, limit = 10, keyword, roleCode) {
        return this.service.findAll(+page, +limit, keyword, roleCode);
    }
    getWorkQuality(page = 1, limit = 10, keyword) {
        return this.service.getStaffWorkQuality(+page, +limit, keyword);
    }
    findByRole(roleCode) {
        return this.service.findByRoleCode(roleCode);
    }
    getMyReputationHistory(user) {
        return this.service.getReputationHistory(user.id);
    }
    getProfile(user) {
        return this.service.findOne(user.id);
    }
    findOne(id) {
        return this.service.findOne(id);
    }
    updateProfile(user, dto) {
        return this.service.updateProfile(user.id, dto);
    }
    updateReputation(id, reputationPoints) {
        return this.service.updateReputation(id, reputationPoints);
    }
    remove(id) {
        return this.service.remove(id);
    }
    findDeleted(page = 1, limit = 10, keyword) {
        return this.service.findDeleted(+page, +limit, keyword);
    }
    restore(id) {
        return this.service.restoreDeleted(id);
    }
    suspend(id) {
        return this.service.suspendUser(id);
    }
    unsuspend(id) {
        return this.service.activateUser(id);
    }
};
exports.UsersController = UsersController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(role_code_enum_1.RoleCode.ADMIN, role_code_enum_1.RoleCode.MANAGER),
    (0, swagger_1.ApiOperation)({ summary: 'Tạo người dùng mới (Admin/Manager)' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_user_dto_1.CreateUserDto]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(role_code_enum_1.RoleCode.ADMIN, role_code_enum_1.RoleCode.MANAGER),
    (0, swagger_1.ApiOperation)({ summary: 'Danh sách người dùng' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'keyword', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'roleCode', enum: role_code_enum_1.RoleCode, required: false }),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('keyword')),
    __param(3, (0, common_1.Query)('roleCode')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, String, String]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('work-quality'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(role_code_enum_1.RoleCode.ADMIN, role_code_enum_1.RoleCode.MANAGER),
    (0, swagger_1.ApiOperation)({
        summary: 'Chất lượng công việc của nhân sự (trừ quản lý/người dân)',
    }),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('keyword')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, String]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "getWorkQuality", null);
__decorate([
    (0, common_1.Get)('role/:roleCode'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(role_code_enum_1.RoleCode.ADMIN, role_code_enum_1.RoleCode.MANAGER, role_code_enum_1.RoleCode.INSPECTOR),
    (0, swagger_1.ApiOperation)({ summary: 'Danh sách người dùng theo Role' }),
    __param(0, (0, common_1.Param)('roleCode')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "findByRole", null);
__decorate([
    (0, common_1.Get)('reputation-history'),
    (0, swagger_1.ApiOperation)({ summary: 'Lịch sử điểm uy tín của tôi' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "getMyReputationHistory", null);
__decorate([
    (0, common_1.Get)('me'),
    (0, swagger_1.ApiOperation)({ summary: 'Thông tin hồ sơ của tôi' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "getProfile", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(role_code_enum_1.RoleCode.ADMIN, role_code_enum_1.RoleCode.MANAGER),
    (0, swagger_1.ApiOperation)({ summary: 'Chi tiết người dùng theo ID' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)('me'),
    (0, swagger_1.ApiOperation)({ summary: 'Cập nhật hồ sơ cá nhân' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "updateProfile", null);
__decorate([
    (0, common_1.Patch)(':id/reputation'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(role_code_enum_1.RoleCode.ADMIN, role_code_enum_1.RoleCode.MANAGER),
    (0, swagger_1.ApiOperation)({ summary: 'Cập nhật điểm uy tín (Admin/Manager)' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)('reputationPoints', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "updateReputation", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(role_code_enum_1.RoleCode.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Xóa người dùng (Admin)' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "remove", null);
__decorate([
    (0, common_1.Get)('deleted-accounts'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(role_code_enum_1.RoleCode.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Danh sách người dùng đã bị xóa mềm' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'keyword', required: false }),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('keyword')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, String]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "findDeleted", null);
__decorate([
    (0, common_1.Patch)(':id/restore'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(role_code_enum_1.RoleCode.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Khôi phục người dùng bị xóa mềm' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "restore", null);
__decorate([
    (0, common_1.Patch)(':id/suspend'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(role_code_enum_1.RoleCode.ADMIN, role_code_enum_1.RoleCode.MANAGER),
    (0, swagger_1.ApiOperation)({ summary: 'Tạm ngừng hoạt động người dùng' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "suspend", null);
__decorate([
    (0, common_1.Patch)(':id/unsuspend'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(role_code_enum_1.RoleCode.ADMIN, role_code_enum_1.RoleCode.MANAGER),
    (0, swagger_1.ApiOperation)({ summary: 'Kích hoạt lại người dùng tạm ngừng' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "unsuspend", null);
exports.UsersController = UsersController = __decorate([
    (0, swagger_1.ApiTags)('Người dùng (Users)'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [users_service_1.UsersService])
], UsersController);
//# sourceMappingURL=users.controller.js.map