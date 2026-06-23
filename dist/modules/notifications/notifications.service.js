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
exports.NotificationsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const notification_entity_1 = require("./entities/notification.entity");
const notifications_gateway_1 = require("./notifications.gateway");
const device_entity_1 = require("../users/entities/device.entity");
const config_1 = require("@nestjs/config");
const expo_server_sdk_1 = require("expo-server-sdk");
const webpush = require("web-push");
const user_entity_1 = require("../users/entities/user.entity");
let NotificationsService = class NotificationsService {
    constructor(repo, deviceRepo, notificationsGateway, configService) {
        this.repo = repo;
        this.deviceRepo = deviceRepo;
        this.notificationsGateway = notificationsGateway;
        this.configService = configService;
        this.expo = new expo_server_sdk_1.Expo();
        const vapidPublic = this.configService.get('VAPID_PUBLIC_KEY');
        const vapidPrivate = this.configService.get('VAPID_PRIVATE_KEY');
        const vapidSubject = this.configService.get('VAPID_SUBJECT') ||
            'mailto:admin@ql-vunglu.site';
        if (vapidPublic && vapidPrivate) {
            webpush.setVapidDetails(vapidSubject, vapidPublic, vapidPrivate);
            console.log('✅ Web Push VAPID keys loaded successfully.');
        }
        else {
            console.warn('⚠️ Missing VAPID_PUBLIC_KEY or VAPID_PRIVATE_KEY in environment variables. Web Push might fail.');
        }
    }
    getVapidPublicKey() {
        return this.configService.get('VAPID_PUBLIC_KEY') || '';
    }
    async create(data) {
        const n = this.repo.create(data);
        const saved = await this.repo.save(n);
        this.notificationsGateway.sendNotificationToUser(data.userId, saved);
        const devices = await this.deviceRepo.find({
            where: { userId: data.userId, isActive: true },
        });
        if (devices.length > 0) {
            const expoTokens = devices
                .map((d) => d.expoPushToken)
                .filter((token) => !!token && expo_server_sdk_1.Expo.isExpoPushToken(token));
            if (expoTokens.length > 0) {
                const messages = expoTokens.map((token) => ({
                    to: token,
                    sound: 'default',
                    title: data.title,
                    body: data.content,
                    data: {
                        id: saved.id,
                        type: data.type,
                        referenceId: data.referenceId,
                    },
                }));
                const chunks = this.expo.chunkPushNotifications(messages);
                for (const chunk of chunks) {
                    try {
                        const ticketChunk = await this.expo.sendPushNotificationsAsync(chunk);
                        console.log('✅ Expo push tickets sent:', ticketChunk);
                    }
                    catch (error) {
                        console.error('❌ Error sending Expo push notification:', error);
                    }
                }
            }
            const webSubs = devices
                .map((d) => d.webPushSub)
                .filter((sub) => !!sub && typeof sub === 'object' && 'endpoint' in sub);
            if (webSubs.length > 0) {
                const payload = JSON.stringify({
                    title: data.title,
                    body: data.content,
                    data: {
                        id: saved.id,
                        type: data.type,
                        referenceId: data.referenceId,
                    },
                });
                for (const sub of webSubs) {
                    try {
                        await webpush.sendNotification(sub, payload);
                        console.log('✅ Sent Web Push notification successfully to:', sub.endpoint);
                    }
                    catch (error) {
                        console.error('❌ Error sending Web Push notification:', error);
                    }
                }
            }
        }
        return saved;
    }
    sendPatrolLocationUpdate(reflectionId, lat, lng) {
        if (this.notificationsGateway && this.notificationsGateway.server) {
            this.notificationsGateway.server.emit('patrol_location_updated', {
                id: reflectionId,
                lat,
                lng,
            });
        }
    }
    async findByUser(userId, page = 1, limit = 10) {
        const [data, total] = await this.repo.findAndCount({
            where: { userId },
            order: { createdAt: 'DESC' },
            skip: (page - 1) * limit,
            take: limit,
        });
        return {
            statusCode: 200,
            message: 'Thành công',
            data,
            meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
        };
    }
    async findOne(id, userId) {
        const notification = await this.repo.findOne({ where: { id, userId } });
        if (!notification)
            throw new common_1.NotFoundException('Không tìm thấy thông báo');
        return { statusCode: 200, message: 'Thành công', data: notification };
    }
    async markRead(id, userId) {
        await this.repo.update({ id, userId }, { isRead: true });
        return { statusCode: 200, message: 'Đánh dấu đã đọc' };
    }
    async markAllRead(userId) {
        await this.repo.update({ userId, isRead: false }, { isRead: true });
        return { statusCode: 200, message: 'Đã đọc tất cả thông báo' };
    }
    async countUnread(userId) {
        const count = await this.repo.count({ where: { userId, isRead: false } });
        return { statusCode: 200, message: 'Thành công', data: { unread: count } };
    }
    async findAllSystem(page = 1, limit = 10) {
        const [data, total] = await this.repo.findAndCount({
            relations: ['user'],
            order: { createdAt: 'DESC' },
            skip: (page - 1) * limit,
            take: limit,
        });
        return {
            statusCode: 200,
            message: 'Thành công',
            data,
            meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
        };
    }
    async createBulkOrSingle(dto) {
        const userRepo = this.repo.manager.getRepository(user_entity_1.User);
        if (dto.userId) {
            const user = await userRepo.findOne({ where: { id: dto.userId } });
            if (!user)
                throw new Error('Không tìm thấy người dùng');
            const saved = await this.create({
                userId: dto.userId,
                title: dto.title,
                content: dto.content,
                type: 'SYSTEM',
            });
            return {
                statusCode: 201,
                message: 'Đã gửi thông báo tới người dùng',
                data: saved,
            };
        }
        if (dto.roleCode) {
            const users = await userRepo.find({
                where: { role: { roleCode: dto.roleCode } },
                relations: ['role'],
            });
            for (const u of users) {
                await this.create({
                    userId: u.id,
                    title: dto.title,
                    content: dto.content,
                    type: 'SYSTEM',
                });
            }
            return {
                statusCode: 201,
                message: 'Đã gửi thông báo tới nhóm vai trò ' + dto.roleCode,
            };
        }
        const users = await userRepo.find();
        for (const u of users) {
            await this.create({
                userId: u.id,
                title: dto.title,
                content: dto.content,
                type: 'SYSTEM',
            });
        }
        return {
            statusCode: 201,
            message: 'Đã gửi thông báo tới tất cả người dùng',
        };
    }
};
exports.NotificationsService = NotificationsService;
exports.NotificationsService = NotificationsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(notification_entity_1.Notification)),
    __param(1, (0, typeorm_1.InjectRepository)(device_entity_1.Device)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        notifications_gateway_1.NotificationsGateway,
        config_1.ConfigService])
], NotificationsService);
//# sourceMappingURL=notifications.service.js.map