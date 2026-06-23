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
exports.ResidentContactsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const role_code_enum_1 = require("../../common/enums/role-code.enum");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const resident_contact_dto_1 = require("./dto/resident-contact.dto");
const resident_contacts_service_1 = require("./resident-contacts.service");
let ResidentContactsController = class ResidentContactsController {
    constructor(service) {
        this.service = service;
    }
    bulkCreate(dto) {
        return this.service.bulkCreate(dto);
    }
    create(dto) {
        return this.service.create(dto);
    }
    findAll(page = 1, limit = 10, keyword) {
        return this.service.findAll(+page, +limit, keyword);
    }
    async checkCccd(cccd) {
        const contact = await this.service.findByCccd(cccd);
        return {
            statusCode: 200,
            message: contact ? 'Tìm thấy' : 'Không tìm thấy',
            data: contact,
            isMatched: !!contact,
        };
    }
    update(id, dto) {
        return this.service.update(id, dto);
    }
    remove(id) {
        return this.service.remove(id);
    }
};
exports.ResidentContactsController = ResidentContactsController;
__decorate([
    (0, common_1.Post)('bulk'),
    (0, roles_decorator_1.Roles)(role_code_enum_1.RoleCode.ADMIN, role_code_enum_1.RoleCode.MANAGER, role_code_enum_1.RoleCode.STAFF),
    (0, swagger_1.ApiOperation)({ summary: 'Nhập hàng loạt thông tin liên hệ từ Excel' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [resident_contact_dto_1.BulkCreateResidentContactDto]),
    __metadata("design:returntype", void 0)
], ResidentContactsController.prototype, "bulkCreate", null);
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)(role_code_enum_1.RoleCode.ADMIN, role_code_enum_1.RoleCode.MANAGER, role_code_enum_1.RoleCode.STAFF),
    (0, swagger_1.ApiOperation)({ summary: 'Thêm một thông tin liên hệ' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [resident_contact_dto_1.CreateResidentContactDto]),
    __metadata("design:returntype", void 0)
], ResidentContactsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)(role_code_enum_1.RoleCode.ADMIN, role_code_enum_1.RoleCode.MANAGER, role_code_enum_1.RoleCode.STAFF),
    (0, swagger_1.ApiOperation)({ summary: 'Danh sách thông tin liên hệ' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'keyword', required: false }),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('keyword')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, String]),
    __metadata("design:returntype", void 0)
], ResidentContactsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('check/:cccd'),
    (0, roles_decorator_1.Roles)(role_code_enum_1.RoleCode.ADMIN, role_code_enum_1.RoleCode.MANAGER, role_code_enum_1.RoleCode.STAFF),
    (0, swagger_1.ApiOperation)({ summary: 'Kiểm tra CCCD có trong danh sách liên hệ không' }),
    __param(0, (0, common_1.Param)('cccd')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ResidentContactsController.prototype, "checkCccd", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, roles_decorator_1.Roles)(role_code_enum_1.RoleCode.ADMIN, role_code_enum_1.RoleCode.MANAGER),
    (0, swagger_1.ApiOperation)({ summary: 'Cập nhật thông tin liên hệ' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, resident_contact_dto_1.UpdateResidentContactDto]),
    __metadata("design:returntype", void 0)
], ResidentContactsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)(role_code_enum_1.RoleCode.ADMIN, role_code_enum_1.RoleCode.MANAGER),
    (0, swagger_1.ApiOperation)({ summary: 'Xóa thông tin liên hệ' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], ResidentContactsController.prototype, "remove", null);
exports.ResidentContactsController = ResidentContactsController = __decorate([
    (0, swagger_1.ApiTags)('Thông tin liên hệ (Resident Contacts)'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [resident_contacts_service_1.ResidentContactsService])
], ResidentContactsController);
//# sourceMappingURL=resident-contacts.controller.js.map