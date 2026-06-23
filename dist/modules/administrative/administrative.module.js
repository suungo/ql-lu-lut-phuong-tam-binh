"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdministrativeModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const province_entity_1 = require("./entities/province.entity");
const ward_entity_1 = require("./entities/ward.entity");
const administrative_service_1 = require("./administrative.service");
const administrative_controller_1 = require("./administrative.controller");
let AdministrativeModule = class AdministrativeModule {
};
exports.AdministrativeModule = AdministrativeModule;
exports.AdministrativeModule = AdministrativeModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([province_entity_1.Province, ward_entity_1.Ward])],
        controllers: [administrative_controller_1.AdministrativeController],
        providers: [administrative_service_1.AdministrativeService],
        exports: [administrative_service_1.AdministrativeService],
    })
], AdministrativeModule);
//# sourceMappingURL=administrative.module.js.map