"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FloodDamagesModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const notifications_module_1 = require("../notifications/notifications.module");
const users_module_1 = require("../users/users.module");
const flood_damage_entity_1 = require("./entities/flood-damage.entity");
const floodDamages_controller_1 = require("./floodDamages.controller");
const floodDamages_service_1 = require("./floodDamages.service");
const flood_damage_repository_1 = require("./repositories/flood-damage.repository");
let FloodDamagesModule = class FloodDamagesModule {
};
exports.FloodDamagesModule = FloodDamagesModule;
exports.FloodDamagesModule = FloodDamagesModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([flood_damage_entity_1.FloodDamage]),
            notifications_module_1.NotificationsModule,
            users_module_1.UsersModule,
        ],
        controllers: [floodDamages_controller_1.FloodDamagesController],
        providers: [floodDamages_service_1.FloodDamagesService, flood_damage_repository_1.FloodDamageRepository],
        exports: [floodDamages_service_1.FloodDamagesService],
    })
], FloodDamagesModule);
//# sourceMappingURL=floodDamages.module.js.map