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
exports.AuthsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const auths_service_1 = require("./auths.service");
const changePassword_dto_1 = require("./dto/changePassword.dto");
const login_dto_1 = require("./dto/login.dto");
const refresh_token_dto_1 = require("./dto/refresh-token.dto");
const register_dto_1 = require("./dto/register.dto");
const resetPassword_dto_1 = require("./dto/resetPassword.dto");
const subscribe_push_dto_1 = require("./dto/subscribe-push.dto");
let AuthsController = class AuthsController {
    constructor(authsService) {
        this.authsService = authsService;
    }
    register(dto) {
        return this.authsService.register(dto);
    }
    login(dto) {
        return this.authsService.login(dto);
    }
    refreshToken(dto) {
        return this.authsService.refreshToken(dto);
    }
    getMe(user) {
        return this.authsService.sendOtpResetPassword(user.id);
    }
    sendOtpResetPassword(phoneNumber) {
        return this.authsService.sendOtpResetPassword(phoneNumber);
    }
    resetPassword(dto) {
        return this.authsService.resetPasswordWithOtp(dto);
    }
    async changePassword(req, dto) {
        const userId = req.user?.sub || req.user?.id;
        console.log('🔄 User từ JWT:', req.user);
        if (!userId) {
            throw new common_1.UnauthorizedException('Không tìm thấy thông tin người dùng từ token');
        }
        return this.authsService.changePassword(userId, dto);
    }
    async subscribePush(req, dto) {
        const userId = req.user?.sub || req.user?.id;
        if (!userId) {
            throw new common_1.UnauthorizedException('Không tìm thấy thông tin người dùng từ token');
        }
        return this.authsService.subscribePush(userId, dto);
    }
    async logout(req, deviceId) {
        const userId = req.user?.sub || req.user?.id;
        if (!userId) {
            throw new common_1.UnauthorizedException('Không tìm thấy thông tin người dùng từ token');
        }
        return this.authsService.logout(userId, deviceId);
    }
    async getUserDevices(req) {
        const userId = req.user?.sub || req.user?.id;
        if (!userId) {
            throw new common_1.UnauthorizedException('Không tìm thấy thông tin người dùng từ token');
        }
        return this.authsService.getUserActiveDevices(userId);
    }
};
exports.AuthsController = AuthsController;
__decorate([
    (0, common_1.Post)('register'),
    (0, swagger_1.ApiOperation)({ summary: 'Đăng ký tài khoản' }),
    (0, swagger_1.ApiBody)({ type: register_dto_1.RegisterDto }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [register_dto_1.RegisterDto]),
    __metadata("design:returntype", void 0)
], AuthsController.prototype, "register", null);
__decorate([
    (0, common_1.Post)('login'),
    (0, swagger_1.ApiOperation)({ summary: 'Đăng nhập' }),
    (0, swagger_1.ApiBody)({ type: login_dto_1.LoginDto }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [login_dto_1.LoginDto]),
    __metadata("design:returntype", void 0)
], AuthsController.prototype, "login", null);
__decorate([
    (0, common_1.Post)('refresh-token'),
    (0, swagger_1.ApiOperation)({ summary: 'Làm mới access token' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [refresh_token_dto_1.RefreshTokenDto]),
    __metadata("design:returntype", void 0)
], AuthsController.prototype, "refreshToken", null);
__decorate([
    (0, common_1.Get)('me'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Lấy thông tin người dùng hiện tại' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AuthsController.prototype, "getMe", null);
__decorate([
    (0, common_1.Post)('send-otp-reset-password'),
    (0, swagger_1.ApiOperation)({ summary: 'Gửi OTP về email để reset mật khẩu' }),
    (0, swagger_1.ApiBody)({
        schema: {
            example: {
                phoneNumber: '0123456789',
            },
        },
    }),
    __param(0, (0, common_1.Body)('phoneNumber')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AuthsController.prototype, "sendOtpResetPassword", null);
__decorate([
    (0, common_1.Post)('reset-password'),
    (0, swagger_1.ApiOperation)({ summary: 'Xác thực OTP và reset mật khẩu' }),
    (0, swagger_1.ApiBody)({ type: resetPassword_dto_1.ResetPasswordDto }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [resetPassword_dto_1.ResetPasswordDto]),
    __metadata("design:returntype", void 0)
], AuthsController.prototype, "resetPassword", null);
__decorate([
    (0, common_1.Post)('change-password'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, changePassword_dto_1.ChangePasswordDto]),
    __metadata("design:returntype", Promise)
], AuthsController.prototype, "changePassword", null);
__decorate([
    (0, common_1.Post)('subscribe-push'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Đăng ký nhận thông báo đẩy (Push Notifications)' }),
    (0, swagger_1.ApiBody)({ type: subscribe_push_dto_1.SubscribePushDto }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, subscribe_push_dto_1.SubscribePushDto]),
    __metadata("design:returntype", Promise)
], AuthsController.prototype, "subscribePush", null);
__decorate([
    (0, common_1.Post)('logout'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Đăng xuất và xóa thiết bị' }),
    (0, swagger_1.ApiBody)({
        schema: {
            example: {
                deviceId: '550e8400-e29b-41d4-a716-446655440000',
            },
        },
    }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)('deviceId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], AuthsController.prototype, "logout", null);
__decorate([
    (0, common_1.Get)('devices'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Lấy danh sách thiết bị đang active' }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthsController.prototype, "getUserDevices", null);
exports.AuthsController = AuthsController = __decorate([
    (0, swagger_1.ApiTags)('Xác thực (Auth)'),
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [auths_service_1.AuthsService])
], AuthsController);
//# sourceMappingURL=auths.controller.js.map