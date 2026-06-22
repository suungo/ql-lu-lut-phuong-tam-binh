import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './entities/notification.entity';
import { NotificationsGateway } from './notifications.gateway';
import { Device } from 'src/modules/users/entities/device.entity';
import { ConfigService } from '@nestjs/config';
import { Expo } from 'expo-server-sdk';
import * as webpush from 'web-push';
import { User } from 'src/modules/users/entities/user.entity';

@Injectable()
export class NotificationsService {
  private expo: Expo;

  constructor(
    @InjectRepository(Notification)
    private readonly repo: Repository<Notification>,
    @InjectRepository(Device)
    private readonly deviceRepo: Repository<Device>,
    private readonly notificationsGateway: NotificationsGateway,
    private readonly configService: ConfigService,
  ) {
    this.expo = new Expo();

    const vapidPublic = this.configService.get<string>('VAPID_PUBLIC_KEY');
    const vapidPrivate = this.configService.get<string>('VAPID_PRIVATE_KEY');
    const vapidSubject =
      this.configService.get<string>('VAPID_SUBJECT') ||
      'mailto:admin@ql-vunglu.site';

    if (vapidPublic && vapidPrivate) {
      webpush.setVapidDetails(vapidSubject, vapidPublic, vapidPrivate);
      console.log('✅ Web Push VAPID keys loaded successfully.');
    } else {
      console.warn(
        '⚠️ Missing VAPID_PUBLIC_KEY or VAPID_PRIVATE_KEY in environment variables. Web Push might fail.',
      );
    }
  }

  getVapidPublicKey() {
    return this.configService.get<string>('VAPID_PUBLIC_KEY') || '';
  }

  async create(data: {
    userId: number;
    title: string;
    content: string;
    type?: string;
    referenceId?: number;
  }) {
    const n = this.repo.create(data);
    const saved = await this.repo.save(n);

    // Phát thông báo realtime tới user qua WebSockets
    this.notificationsGateway.sendNotificationToUser(data.userId, saved);

    // Lấy các thiết bị active của user
    const devices = await this.deviceRepo.find({
      where: { userId: data.userId, isActive: true },
    });

    if (devices.length > 0) {
      // 1. Gửi qua Expo Push Notifications (Mobile)
      const expoTokens = devices
        .map((d) => d.expoPushToken)
        .filter(
          (token): token is string => !!token && Expo.isExpoPushToken(token),
        );

      if (expoTokens.length > 0) {
        const messages = expoTokens.map((token) => ({
          to: token,
          sound: 'default' as const,
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
            const ticketChunk =
              await this.expo.sendPushNotificationsAsync(chunk);
            console.log('✅ Expo push tickets sent:', ticketChunk);
          } catch (error) {
            console.error('❌ Error sending Expo push notification:', error);
          }
        }
      }

      // 2. Gửi qua Web Push Notifications (Web)
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
            await webpush.sendNotification(
              sub as webpush.PushSubscription,
              payload,
            );
            console.log(
              '✅ Sent Web Push notification successfully to:',
              sub.endpoint,
            );
          } catch (error) {
            console.error('❌ Error sending Web Push notification:', error);
          }
        }
      }
    }

    return saved;
  }

  sendPatrolLocationUpdate(reflectionId: number, lat: number, lng: number) {
    if (this.notificationsGateway && this.notificationsGateway.server) {
      this.notificationsGateway.server.emit('patrol_location_updated', {
        id: reflectionId,
        lat,
        lng,
      });
    }
  }

  async findByUser(userId: number, page = 1, limit = 10) {
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

  async findOne(id: number, userId: number) {
    const notification = await this.repo.findOne({ where: { id, userId } });
    if (!notification) throw new NotFoundException('Không tìm thấy thông báo');
    return { statusCode: 200, message: 'Thành công', data: notification };
  }

  async markRead(id: number, userId: number) {
    await this.repo.update({ id, userId }, { isRead: true });
    return { statusCode: 200, message: 'Đánh dấu đã đọc' };
  }

  async markAllRead(userId: number) {
    await this.repo.update({ userId, isRead: false }, { isRead: true });
    return { statusCode: 200, message: 'Đã đọc tất cả thông báo' };
  }

  async countUnread(userId: number) {
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

  async createBulkOrSingle(dto: {
    userId?: number;
    roleCode?: string;
    title: string;
    content: string;
  }) {
    const userRepo = this.repo.manager.getRepository(User);
    if (dto.userId) {
      const user = await userRepo.findOne({ where: { id: dto.userId } });
      if (!user) throw new Error('Không tìm thấy người dùng');
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
        where: { role: { roleCode: dto.roleCode as any } },
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
    // Send to all
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
}
