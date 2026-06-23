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
exports.ChatsController = void 0;
const common_1 = require("@nestjs/common");
const chats_service_1 = require("./chats.service");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const class_validator_1 = require("class-validator");
const swagger_2 = require("@nestjs/swagger");
class SendMessageDto {
}
__decorate([
    (0, swagger_2.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], SendMessageDto.prototype, "content", void 0);
let ChatsController = class ChatsController {
    constructor(service) {
        this.service = service;
    }
    getOrCreate(userId, user) {
        return this.service.getOrCreateConversation(user.id, userId);
    }
    getMyConversations(user) {
        return this.service.getMyConversations(user.id);
    }
    getMessages(conversationId, page = 1, limit = 20) {
        return this.service.getMessages(conversationId, +page, +limit);
    }
    sendMessage(conversationId, dto, user) {
        return this.service.sendMessage(conversationId, user.id, dto.content);
    }
};
exports.ChatsController = ChatsController;
__decorate([
    (0, common_1.Post)('conversation/:userId'),
    (0, swagger_1.ApiOperation)({ summary: 'Tạo hoặc lấy cuộc trò chuyện với user khác' }),
    __param(0, (0, common_1.Param)('userId', common_1.ParseIntPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], ChatsController.prototype, "getOrCreate", null);
__decorate([
    (0, common_1.Get)('conversations'),
    (0, swagger_1.ApiOperation)({ summary: 'Danh sách cuộc trò chuyện của tôi' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ChatsController.prototype, "getMyConversations", null);
__decorate([
    (0, common_1.Get)(':conversationId/messages'),
    (0, swagger_1.ApiOperation)({ summary: 'Tin nhắn trong cuộc trò chuyện' }),
    __param(0, (0, common_1.Param)('conversationId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object, Object]),
    __metadata("design:returntype", void 0)
], ChatsController.prototype, "getMessages", null);
__decorate([
    (0, common_1.Post)(':conversationId/messages'),
    (0, swagger_1.ApiOperation)({ summary: 'Gửi tin nhắn (REST fallback)' }),
    (0, swagger_1.ApiBody)({ type: SendMessageDto }),
    __param(0, (0, common_1.Param)('conversationId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, SendMessageDto, Object]),
    __metadata("design:returntype", void 0)
], ChatsController.prototype, "sendMessage", null);
exports.ChatsController = ChatsController = __decorate([
    (0, swagger_1.ApiTags)('Chat (Chats)'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [chats_service_1.ChatsService])
], ChatsController);
//# sourceMappingURL=chats.controller.js.map