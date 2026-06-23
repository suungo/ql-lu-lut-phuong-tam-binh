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
exports.AdministrativeController = void 0;
const common_1 = require("@nestjs/common");
const administrative_service_1 = require("./administrative.service");
const public_decorator_1 = require("../../common/decorators/public.decorator");
const swagger_1 = require("@nestjs/swagger");
let AdministrativeController = class AdministrativeController {
    constructor(service) {
        this.service = service;
    }
    getProvinces() {
        return this.service.getProvinces();
    }
    seedWards() {
        return this.service.seedWards();
    }
    getWards(provinceCode) {
        return this.service.getWards(+provinceCode);
    }
};
exports.AdministrativeController = AdministrativeController;
__decorate([
    (0, common_1.Get)('provinces'),
    (0, swagger_1.ApiOperation)({ summary: 'Danh sách Tỉnh/Thành phố' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdministrativeController.prototype, "getProvinces", null);
__decorate([
    (0, common_1.Get)('seed-wards'),
    (0, swagger_1.ApiOperation)({ summary: 'Tự động đồng bộ xã/phường cho 34 tỉnh của bạn' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdministrativeController.prototype, "seedWards", null);
__decorate([
    (0, common_1.Get)('wards'),
    (0, swagger_1.ApiOperation)({ summary: 'Danh sách Phường/Xã theo Tỉnh/Thành' }),
    (0, swagger_1.ApiQuery)({ name: 'provinceCode', type: Number }),
    __param(0, (0, common_1.Query)('provinceCode')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AdministrativeController.prototype, "getWards", null);
exports.AdministrativeController = AdministrativeController = __decorate([
    (0, swagger_1.ApiTags)('Địa chính (Administrative)'),
    (0, public_decorator_1.Public)(),
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [administrative_service_1.AdministrativeService])
], AdministrativeController);
//# sourceMappingURL=administrative.controller.js.map