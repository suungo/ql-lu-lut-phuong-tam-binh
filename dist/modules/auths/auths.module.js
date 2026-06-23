"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthsModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const jwt_1 = require("@nestjs/jwt");
const passport_1 = require("@nestjs/passport");
const typeorm_1 = require("@nestjs/typeorm");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const role_entity_1 = require("../roles/entities/role.entity");
const device_entity_1 = require("../users/entities/device.entity");
const user_entity_1 = require("../users/entities/user.entity");
const mail_module_1 = require("../mail/mail.module");
const verification_entity_1 = require("../verifications/entities/verification.entity");
const auths_controller_1 = require("./auths.controller");
const auths_service_1 = require("./auths.service");
const jwt_strategy_1 = require("./strategies/jwt.strategy");
let AuthsModule = class AuthsModule {
};
exports.AuthsModule = AuthsModule;
exports.AuthsModule = AuthsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([user_entity_1.User, role_entity_1.Role, verification_entity_1.Verification, device_entity_1.Device]),
            passport_1.PassportModule.register({ defaultStrategy: 'jwt' }),
            jwt_1.JwtModule.registerAsync({
                imports: [config_1.ConfigModule],
                inject: [config_1.ConfigService],
                useFactory: (configService) => ({
                    secret: configService.get('JWT_SECRET'),
                    signOptions: { expiresIn: '1d' },
                }),
            }),
            mail_module_1.MailModule,
        ],
        controllers: [auths_controller_1.AuthsController],
        providers: [auths_service_1.AuthsService, jwt_strategy_1.JwtStrategy, jwt_auth_guard_1.JwtAuthGuard],
        exports: [jwt_1.JwtModule, auths_service_1.AuthsService, jwt_auth_guard_1.JwtAuthGuard, passport_1.PassportModule],
    })
], AuthsModule);
//# sourceMappingURL=auths.module.js.map