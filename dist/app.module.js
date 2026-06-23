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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const core_1 = require("@nestjs/core");
const throttler_1 = require("@nestjs/throttler");
const typeorm_1 = require("@nestjs/typeorm");
const database_config_1 = require("./database/database.config");
const routes_1 = require("./routes");
const auths_module_1 = require("./modules/auths/auths.module");
const chats_module_1 = require("./modules/chats/chats.module");
const cloudinary_module_1 = require("./modules/cloudinary/cloudinary.module");
const dispatch_reports_module_1 = require("./modules/dispatch-reports/dispatch-reports.module");
const floodDamages_module_1 = require("./modules/flood-damages/floodDamages.module");
const human_resources_module_1 = require("./modules/human-resources/human-resources.module");
const notifications_module_1 = require("./modules/notifications/notifications.module");
const reflections_module_1 = require("./modules/reflections/reflections.module");
const residents_module_1 = require("./modules/residents/residents.module");
const roles_module_1 = require("./modules/roles/roles.module");
const upload_module_1 = require("./modules/upload/upload.module");
const users_module_1 = require("./modules/users/users.module");
const administrative_module_1 = require("./modules/administrative/administrative.module");
const statistics_module_1 = require("./modules/statistics/statistics.module");
const resident_contacts_module_1 = require("./modules/resident-contacts/resident-contacts.module");
const role_entity_1 = require("./modules/roles/entities/role.entity");
const role_seeder_1 = require("./seeds/role.seeder");
const seeder_runner_1 = require("./seeds/seeder-runner");
let AppModule = class AppModule {
    constructor(seederRunner) {
        this.seederRunner = seederRunner;
    }
    async onApplicationBootstrap() {
        await this.seederRunner.runAllSeeders();
    }
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: '.env',
            }),
            throttler_1.ThrottlerModule.forRoot({
                throttlers: [{ ttl: (0, throttler_1.seconds)(60), limit: 120 }],
            }),
            typeorm_1.TypeOrmModule.forRootAsync({
                inject: [config_1.ConfigService],
                useFactory: (configService) => (0, database_config_1.getDatabaseConfig)(configService),
            }),
            typeorm_1.TypeOrmModule.forFeature([role_entity_1.Role]),
            core_1.RouterModule.register(routes_1.routes),
            auths_module_1.AuthsModule,
            users_module_1.UsersModule,
            roles_module_1.RolesModule,
            human_resources_module_1.HumanResourcesModule,
            residents_module_1.ResidentsModule,
            reflections_module_1.ReflectionsModule,
            chats_module_1.ChatsModule,
            notifications_module_1.NotificationsModule,
            cloudinary_module_1.CloudinaryModule,
            upload_module_1.UploadModule,
            floodDamages_module_1.FloodDamagesModule,
            administrative_module_1.AdministrativeModule,
            dispatch_reports_module_1.DispatchReportsModule,
            statistics_module_1.StatisticsModule,
            resident_contacts_module_1.ResidentContactsModule,
        ],
        providers: [
            role_seeder_1.RoleSeederService,
            seeder_runner_1.SeederRunner,
            { provide: core_1.APP_GUARD, useClass: throttler_1.ThrottlerGuard },
        ],
    }),
    __metadata("design:paramtypes", [seeder_runner_1.SeederRunner])
], AppModule);
//# sourceMappingURL=app.module.js.map