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
exports.ResidentsController = void 0;
const common_1 = require("@nestjs/common");
const public_decorator_1 = require("../../common/decorators/public.decorator");
const swagger_1 = require("@nestjs/swagger");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const role_code_enum_1 = require("../../common/enums/role-code.enum");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const resident_dto_1 = require("./dto/resident.dto");
const resident_enum_1 = require("./enums/resident.enum");
const residents_service_1 = require("./residents.service");
let ResidentsController = class ResidentsController {
    constructor(service) {
        this.service = service;
    }
    create(dto, user) {
        return this.service.create(dto, user);
    }
    async createFromWebhook(dto) {
        return this.service.create(dto, { id: 1 });
    }
    findAll(user, page = 1, limit = 10, keyword, houseType, hasElderly, hasChildren, hasPregnantWomen, hasChronicDisease, hasBusiness) {
        return this.service.findAll(+page, +limit, user, keyword, houseType, hasElderly, hasChildren, hasPregnantWomen, hasChronicDisease, hasBusiness);
    }
    findMyResident(user) {
        return this.service.findMyResident(user.id);
    }
    findOne(id) {
        return this.service.findOne(id);
    }
    update(id, dto) {
        return this.service.update(id, dto);
    }
    remove(id) {
        return this.service.remove(id);
    }
};
exports.ResidentsController = ResidentsController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)(role_code_enum_1.RoleCode.ADMIN, role_code_enum_1.RoleCode.MANAGER, role_code_enum_1.RoleCode.STAFF),
    (0, swagger_1.ApiOperation)({ summary: 'Thêm người dân mới' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [resident_dto_1.CreateResidentDto, Object]),
    __metadata("design:returntype", void 0)
], ResidentsController.prototype, "create", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('webhook/create-from-verification'),
    (0, swagger_1.ApiOperation)({ summary: 'Webhook nhận dữ liệu từ hệ thống xác thực' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [resident_dto_1.CreateResidentDto]),
    __metadata("design:returntype", Promise)
], ResidentsController.prototype, "createFromWebhook", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Danh sách người dân' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'keyword', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'houseType', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'hasElderly', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'hasChildren', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'hasPregnantWomen', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'hasChronicDisease', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'hasBusiness', required: false }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __param(3, (0, common_1.Query)('keyword')),
    __param(4, (0, common_1.Query)('houseType')),
    __param(5, (0, common_1.Query)('hasElderly')),
    __param(6, (0, common_1.Query)('hasChildren')),
    __param(7, (0, common_1.Query)('hasPregnantWomen')),
    __param(8, (0, common_1.Query)('hasChronicDisease')),
    __param(9, (0, common_1.Query)('hasBusiness')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object, String, String, String, String, String, String, String]),
    __metadata("design:returntype", void 0)
], ResidentsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('me'),
    (0, swagger_1.ApiOperation)({ summary: 'Thông tin người dân của tôi' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ResidentsController.prototype, "findMyResident", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Chi tiết người dân' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], ResidentsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, roles_decorator_1.Roles)(role_code_enum_1.RoleCode.ADMIN, role_code_enum_1.RoleCode.MANAGER),
    (0, swagger_1.ApiOperation)({ summary: 'Cập nhật người dân' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, resident_dto_1.UpdateResidentDto]),
    __metadata("design:returntype", void 0)
], ResidentsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)(role_code_enum_1.RoleCode.ADMIN, role_code_enum_1.RoleCode.MANAGER),
    (0, swagger_1.ApiOperation)({ summary: 'Xóa người dân' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], ResidentsController.prototype, "remove", null);
exports.ResidentsController = ResidentsController = __decorate([
    (0, swagger_1.ApiTags)('Người dân (Residents)'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [residents_service_1.ResidentsService])
], ResidentsController);
//# sourceMappingURL=residents.controller.js.map