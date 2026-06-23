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
exports.ChatsGateway = void 0;
const config_1 = require("@nestjs/config");
const jwt_1 = require("@nestjs/jwt");
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const role_code_enum_1 = require("../../common/enums/role-code.enum");
const notifications_service_1 = require("../notifications/notifications.service");
const users_service_1 = require("../users/users.service");
const chats_service_1 = require("./chats.service");
let ChatsGateway = class ChatsGateway {
    constructor(chatsService, jwtService, configService, usersService, notificationsService) {
        this.chatsService = chatsService;
        this.jwtService = jwtService;
        this.configService = configService;
        this.usersService = usersService;
        this.notificationsService = notificationsService;
        this.activeUsers = new Map();
        this.emergencySessions = new Map();
    }
    async handleConnection(client) {
        try {
            const token = client.handshake.auth.token || client.handshake.headers.authorization;
            if (token) {
                const cleanToken = token.replace('Bearer ', '');
                const payload = await this.jwtService.verifyAsync(cleanToken, {
                    secret: this.configService.get('JWT_SECRET'),
                });
                this.activeUsers.set(client.id, {
                    userId: payload.sub,
                    roleCode: payload.roleCode,
                });
                console.log(`Chat client connected: ${client.id}, User: ${payload.sub}, Role: ${payload.roleCode}`);
            }
            else {
                console.log(`Guest chat client connected: ${client.id}`);
            }
            this.broadcastRespondersStatus();
        }
        catch (error) {
            console.log('Chat connection error (invalid token):', error.message);
            console.log(`Guest chat client connected: ${client.id}`);
            this.broadcastRespondersStatus();
        }
    }
    handleDisconnect(client) {
        this.activeUsers.delete(client.id);
        console.log(`Chat client disconnected: ${client.id}`);
        this.broadcastRespondersStatus();
    }
    broadcastRespondersStatus() {
        let hasOfficer = false;
        let hasStaff = false;
        for (const [, user] of this.activeUsers.entries()) {
            if (user.roleCode === 'OFFICER')
                hasOfficer = true;
            if (user.roleCode === 'STAFF')
                hasStaff = true;
        }
        this.server.emit('respondersStatus', {
            hasOfficer,
            hasStaff,
        });
    }
    handleCheckActiveResponders(client) {
        let hasOfficer = false;
        let hasStaff = false;
        for (const [, user] of this.activeUsers.entries()) {
            if (user.roleCode === 'OFFICER')
                hasOfficer = true;
            if (user.roleCode === 'STAFF')
                hasStaff = true;
        }
        return { event: 'activeRespondersStatus', data: { hasOfficer, hasStaff } };
    }
    async handleJoinEmergencyUser(data, client) {
        client.rooms.forEach((room) => {
            if (room.startsWith('user_'))
                client.leave(room);
        });
        client.join(`user_${data.sessionId}`);
        if (!this.emergencySessions.has(data.sessionId)) {
            this.emergencySessions.set(data.sessionId, {
                sessionId: data.sessionId,
                helpType: data.helpType,
                userTitle: data.userTitle,
                messages: [],
                lastUpdate: Date.now(),
            });
            this.server
                .to(`responders_${data.helpType}`)
                .emit('newEmergencySession', this.emergencySessions.get(data.sessionId));
            const targetRole = data.helpType === 'medical' ? role_code_enum_1.RoleCode.STAFF : role_code_enum_1.RoleCode.OFFICER;
            const responders = await this.usersService.findByRoleCode(targetRole);
            for (const responder of responders) {
                await this.notificationsService.create({
                    userId: responder.id,
                    title: data.helpType === 'medical'
                        ? 'Yêu cầu Cấp cứu y tế'
                        : 'Yêu cầu Cứu hộ/Di tản',
                    content: `Có người dân (${data.userTitle}) vừa yêu cầu hỗ trợ khẩn cấp trên kênh Chat. Vui lòng vào trang Tin nhắn khẩn cấp ngay!`,
                    type: 'EMERGENCY_CHAT',
                });
            }
        }
        return {
            event: 'emergencySessionData',
            data: this.emergencySessions.get(data.sessionId),
        };
    }
    handleJoinEmergencyResponder(helpType, client) {
        client.rooms.forEach((room) => {
            if (room.startsWith('responders_'))
                client.leave(room);
        });
        client.join(`responders_${helpType}`);
        const sessions = Array.from(this.emergencySessions.values())
            .filter((s) => s.helpType === helpType)
            .sort((a, b) => b.lastUpdate - a.lastUpdate);
        return { event: 'activeEmergencySessions', data: sessions };
    }
    handleEmergencyMessage(data, client) {
        const session = this.emergencySessions.get(data.sessionId);
        if (session) {
            session.messages.push(data.message);
            session.lastUpdate = Date.now();
            this.server
                .to(`responders_${data.helpType}`)
                .emit('newEmergencyMessage', {
                sessionId: data.sessionId,
                message: data.message,
            });
            this.server.to(`user_${data.sessionId}`).emit('newEmergencyMessage', {
                sessionId: data.sessionId,
                message: data.message,
            });
            this.server
                .to(`responders_${data.helpType}`)
                .emit('updateSessionList', session);
        }
    }
    getActiveUsersCount() {
        const uniqueUserIds = new Set();
        for (const user of this.activeUsers.values()) {
            uniqueUserIds.add(user.userId);
        }
        return uniqueUserIds.size;
    }
};
exports.ChatsGateway = ChatsGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], ChatsGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('checkActiveResponders'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket]),
    __metadata("design:returntype", void 0)
], ChatsGateway.prototype, "handleCheckActiveResponders", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('joinEmergencyUser'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], ChatsGateway.prototype, "handleJoinEmergencyUser", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('joinEmergencyResponder'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, socket_io_1.Socket]),
    __metadata("design:returntype", void 0)
], ChatsGateway.prototype, "handleJoinEmergencyResponder", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('sendEmergencyMessage'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_io_1.Socket]),
    __metadata("design:returntype", void 0)
], ChatsGateway.prototype, "handleEmergencyMessage", null);
exports.ChatsGateway = ChatsGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({ cors: { origin: '*' }, namespace: '/chats' }),
    __metadata("design:paramtypes", [chats_service_1.ChatsService,
        jwt_1.JwtService,
        config_1.ConfigService,
        users_service_1.UsersService,
        notifications_service_1.NotificationsService])
], ChatsGateway);
//# sourceMappingURL=chats.gateway.js.map