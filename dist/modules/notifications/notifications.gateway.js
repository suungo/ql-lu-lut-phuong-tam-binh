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
exports.NotificationsGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
let NotificationsGateway = class NotificationsGateway {
    constructor(jwtService, configService) {
        this.jwtService = jwtService;
        this.configService = configService;
        this.activeUserIds = new Map();
    }
    async handleConnection(client) {
        try {
            const token = client.handshake.auth.token || client.handshake.headers.authorization;
            if (!token) {
                client.disconnect();
                return;
            }
            const cleanToken = token.replace('Bearer ', '');
            const payload = await this.jwtService.verifyAsync(cleanToken, {
                secret: this.configService.get('JWT_SECRET'),
            });
            client.join(`user_${payload.sub}`);
            this.activeUserIds.set(client.id, payload.sub);
            this.broadcastActiveUsersCount();
            console.log(`User ${payload.sub} connected to notifications`);
        }
        catch (error) {
            console.log('Notification connection error:', error.message);
            client.disconnect();
        }
    }
    handleDisconnect(client) {
        this.activeUserIds.delete(client.id);
        this.broadcastActiveUsersCount();
        console.log(`Client disconnected from notifications: ${client.id}`);
    }
    sendNotificationToUser(userId, notification) {
        this.server.to(`user_${userId}`).emit('newNotification', notification);
    }
    broadcastActiveUsersCount() {
        const count = this.getActiveUsersCount();
        this.server.emit('activeUsersCountUpdated', count);
    }
    getActiveUsersCount() {
        const uniqueUserIds = new Set();
        for (const userId of this.activeUserIds.values()) {
            uniqueUserIds.add(userId);
        }
        return uniqueUserIds.size;
    }
};
exports.NotificationsGateway = NotificationsGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], NotificationsGateway.prototype, "server", void 0);
exports.NotificationsGateway = NotificationsGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: '*',
        },
        namespace: '/notifications',
    }),
    __metadata("design:paramtypes", [jwt_1.JwtService,
        config_1.ConfigService])
], NotificationsGateway);
//# sourceMappingURL=notifications.gateway.js.map