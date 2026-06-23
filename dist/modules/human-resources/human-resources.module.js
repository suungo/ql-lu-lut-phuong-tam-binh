"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HumanResourcesModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const human_resource_entity_1 = require("./entities/human-resource.entity");
const human_resources_service_1 = require("./human-resources.service");
const human_resources_controller_1 = require("./human-resources.controller");
const auths_module_1 = require("../auths/auths.module");
const notifications_module_1 = require("../notifications/notifications.module");
let HumanResourcesModule = class HumanResourcesModule {
};
exports.HumanResourcesModule = HumanResourcesModule;
exports.HumanResourcesModule = HumanResourcesModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([human_resource_entity_1.HumanResource]),
            auths_module_1.AuthsModule,
            notifications_module_1.NotificationsModule,
        ],
        controllers: [human_resources_controller_1.HumanResourcesController],
        providers: [human_resources_service_1.HumanResourcesService],
        exports: [human_resources_service_1.HumanResourcesService],
    })
], HumanResourcesModule);
//# sourceMappingURL=human-resources.module.js.map