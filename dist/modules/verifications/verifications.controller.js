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
exports.VerificationsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const role_code_enum_1 = require("../../common/enums/role-code.enum");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const verification_dto_1 = require("./dto/verification.dto");
const verification_enum_1 = require("./enums/verification.enum");
const verifications_service_1 = require("./verifications.service");
const user_entity_1 = require("../users/entities/user.entity");
let VerificationsController = class VerificationsController {
    constructor(service) {
        this.service = service;
    }
    create(dto, user) {
        return this.service.create(dto, user.id);
    }
    findAll(page = 1, limit = 10, status, user) {
        if (user?.role?.roleCode === role_code_enum_1.RoleCode.STAFF) {
            if (!status || status === verification_enum_1.VerificationStatus.PENDING) {
                status = verification_enum_1.VerificationStatus.APPROVED;
            }
        }
        return this.service.findAll(+page, +limit, status);
    }
    findMy(user, page = 1, limit = 10) {
        return this.service.findMyVerifications(user.id, +page, +limit);
    }
    findOne(id) {
        return this.service.findOne(id);
    }
    update(id, dto, user) {
        return this.service.update(id, dto, user.id);
    }
    remove(id) {
        return this.service.remove(id);
    }
};
exports.VerificationsController = VerificationsController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Gửi yêu cầu xác minh' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [verification_dto_1.CreateVerificationDto, user_entity_1.User]),
    __metadata("design:returntype", void 0)
], VerificationsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(role_code_enum_1.RoleCode.ADMIN, role_code_enum_1.RoleCode.STAFF, role_code_enum_1.RoleCode.MANAGER),
    (0, swagger_1.ApiOperation)({ summary: 'Danh sách yêu cầu xác minh' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'status', enum: verification_enum_1.VerificationStatus, required: false }),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('status')),
    __param(3, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, String, user_entity_1.User]),
    __metadata("design:returntype", void 0)
], VerificationsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('my'),
    (0, swagger_1.ApiOperation)({ summary: 'Yêu cầu xác minh của tôi' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User, Object, Object]),
    __metadata("design:returntype", void 0)
], VerificationsController.prototype, "findMy", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Chi tiết yêu cầu xác minh' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], VerificationsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(role_code_enum_1.RoleCode.ADMIN, role_code_enum_1.RoleCode.MANAGER),
    (0, swagger_1.ApiOperation)({ summary: 'Duyệt / Từ chối / Hoàn thành yêu cầu xác minh' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, verification_dto_1.UpdateVerificationDto, Object]),
    __metadata("design:returntype", void 0)
], VerificationsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(role_code_enum_1.RoleCode.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Xóa yêu cầu xác minh' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], VerificationsController.prototype, "remove", null);
exports.VerificationsController = VerificationsController = __decorate([
    (0, swagger_1.ApiTags)('Xác minh (Verifications)'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [verifications_service_1.VerificationsService])
], VerificationsController);
//# sourceMappingURL=verifications.controller.js.map