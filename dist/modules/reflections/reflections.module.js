"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReflectionsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const comments_service_1 = require("./comments.service");
const comment_entity_1 = require("./entities/comment.entity");
const like_entity_1 = require("./entities/like.entity");
const reflection_entity_1 = require("./entities/reflection.entity");
const likes_service_1 = require("./likes.service");
const reflections_controller_1 = require("./reflections.controller");
const reflections_service_1 = require("./reflections.service");
const floodDamages_module_1 = require("../flood-damages/floodDamages.module");
const notifications_module_1 = require("../notifications/notifications.module");
const residents_module_1 = require("../residents/residents.module");
const users_module_1 = require("../users/users.module");
const ollama_module_1 = require("../ollama/ollama.module");
const dispatch_report_entity_1 = require("../dispatch-reports/entities/dispatch-report.entity");
let ReflectionsModule = class ReflectionsModule {
};
exports.ReflectionsModule = ReflectionsModule;
exports.ReflectionsModule = ReflectionsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([reflection_entity_1.Reflection, like_entity_1.Like, comment_entity_1.Comment, dispatch_report_entity_1.DispatchReport]),
            floodDamages_module_1.FloodDamagesModule,
            notifications_module_1.NotificationsModule,
            residents_module_1.ResidentsModule,
            users_module_1.UsersModule,
            ollama_module_1.OllamaModule,
        ],
        controllers: [reflections_controller_1.ReflectionsController],
        providers: [reflections_service_1.ReflectionsService, likes_service_1.LikesService, comments_service_1.CommentsService],
        exports: [reflections_service_1.ReflectionsService, likes_service_1.LikesService, comments_service_1.CommentsService],
    })
], ReflectionsModule);
//# sourceMappingURL=reflections.module.js.map