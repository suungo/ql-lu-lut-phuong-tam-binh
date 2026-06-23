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
exports.ChatsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const conversation_entity_1 = require("./entities/conversation.entity");
const message_entity_1 = require("./entities/message.entity");
let ChatsService = class ChatsService {
    constructor(convRepo, msgRepo) {
        this.convRepo = convRepo;
        this.msgRepo = msgRepo;
    }
    async getOrCreateConversation(user1Id, user2Id) {
        const existing = await this.convRepo
            .createQueryBuilder('c')
            .innerJoin('conversation_participants', 'cp1', 'cp1.conversation_id = c.id AND cp1.user_id = :u1', { u1: user1Id })
            .innerJoin('conversation_participants', 'cp2', 'cp2.conversation_id = c.id AND cp2.user_id = :u2', { u2: user2Id })
            .where('c.isGroup = false')
            .getOne();
        if (existing)
            return { statusCode: 200, message: 'Thành công', data: existing };
        const conv = await this.convRepo.save(this.convRepo.create({ isGroup: false, creatorId: user1Id }));
        return {
            statusCode: 201,
            message: 'Tạo cuộc trò chuyện thành công',
            data: conv,
        };
    }
    async getMyConversations(userId) {
        const convs = await this.convRepo.find({
            where: { creatorId: userId },
            relations: ['messages', 'creator'],
            order: { updatedAt: 'DESC' },
        });
        return { statusCode: 200, message: 'Thành công', data: convs };
    }
    async getMessages(conversationId, page = 1, limit = 20) {
        const [data, total] = await this.msgRepo.findAndCount({
            where: { conversationId },
            relations: ['sender'],
            order: { createdAt: 'DESC' },
            skip: (page - 1) * limit,
            take: limit,
        });
        return {
            statusCode: 200,
            message: 'Thành công',
            data: data.reverse(),
            meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
        };
    }
    async sendMessage(conversationId, senderId, content) {
        const conv = await this.convRepo.findOne({ where: { id: conversationId } });
        if (!conv)
            throw new common_1.NotFoundException('Không tìm thấy cuộc trò chuyện');
        const msg = await this.msgRepo.save(this.msgRepo.create({ conversationId, senderId, content }));
        return msg;
    }
};
exports.ChatsService = ChatsService;
exports.ChatsService = ChatsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(conversation_entity_1.Conversation)),
    __param(1, (0, typeorm_1.InjectRepository)(message_entity_1.Message)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], ChatsService);
//# sourceMappingURL=chats.service.js.map