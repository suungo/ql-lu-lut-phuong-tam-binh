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
exports.FloodDamagesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const role_code_enum_1 = require("../../common/enums/role-code.enum");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const create_flood_damage_dto_1 = require("./dto/create-flood-damage.dto");
const filter_flood_damage_dto_1 = require("./dto/filter-flood-damage.dto");
const update_flood_damage_dto_1 = require("./dto/update-flood-damage.dto");
const damage_status_enum_1 = require("./enums/damage-status.enum");
const floodDamages_service_1 = require("./floodDamages.service");
let FloodDamagesController = class FloodDamagesController {
    constructor(floodDamagesService) {
        this.floodDamagesService = floodDamagesService;
    }
    async create(dto, req) {
        const userId = req.user?.sub;
        const damage = await this.floodDamagesService.create(dto, userId);
        return { statusCode: 201, data: damage };
    }
    findAll(dto, req) {
        return this.floodDamagesService.findAll(dto, req.user);
    }
    async findOne(id) {
        const damage = await this.floodDamagesService.findOne(id);
        return { statusCode: 200, data: damage };
    }
    update(id, dto) {
        return this.floodDamagesService.update(id, dto);
    }
    remove(id) {
        return this.floodDamagesService.remove(id);
    }
    getStatsByReflection(reflectionId) {
        return this.floodDamagesService.getStatsByReflection(reflectionId);
    }
    updateStatus(id, status, req) {
        const reviewerId = req.user?.sub;
        return this.floodDamagesService.updateStatus(id, status, reviewerId);
    }
};
exports.FloodDamagesController = FloodDamagesController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Tạo thiệt hại mới' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_flood_damage_dto_1.CreateFloodDamageDto, Object]),
    __metadata("design:returntype", Promise)
], FloodDamagesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Lấy danh sách thiệt hại (có filter, pagination)' }),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [filter_flood_damage_dto_1.FilterFloodDamageDto, Object]),
    __metadata("design:returntype", void 0)
], FloodDamagesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Lấy chi tiết thiệt hại theo ID' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], FloodDamagesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Cập nhật thiệt hại' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_flood_damage_dto_1.UpdateFloodDamageDto]),
    __metadata("design:returntype", void 0)
], FloodDamagesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Xóa thiệt hại' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], FloodDamagesController.prototype, "remove", null);
__decorate([
    (0, common_1.Get)('stats/by-reflection/:reflectionId'),
    (0, swagger_1.ApiOperation)({ summary: 'Thống kê thiệt hại theo phản ánh' }),
    __param(0, (0, common_1.Param)('reflectionId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], FloodDamagesController.prototype, "getStatsByReflection", null);
__decorate([
    (0, common_1.Put)('status/:id'),
    (0, roles_decorator_1.Roles)(role_code_enum_1.RoleCode.ADMIN, role_code_enum_1.RoleCode.MANAGER, role_code_enum_1.RoleCode.OFFICER),
    (0, swagger_1.ApiOperation)({ summary: 'Cập nhật trạng thái thiệt hại' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)('status')),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String, Object]),
    __metadata("design:returntype", void 0)
], FloodDamagesController.prototype, "updateStatus", null);
exports.FloodDamagesController = FloodDamagesController = __decorate([
    (0, swagger_1.ApiTags)('Flood Damages'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, common_1.Controller)('flood-damages'),
    __metadata("design:paramtypes", [floodDamages_service_1.FloodDamagesService])
], FloodDamagesController);
//# sourceMappingURL=floodDamages.controller.js.map