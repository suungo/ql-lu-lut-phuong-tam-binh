import { Repository } from 'typeorm';
import { Notification } from './entities/notification.entity';
import { NotificationsGateway } from './notifications.gateway';
import { Device } from 'src/modules/users/entities/device.entity';
import { ConfigService } from '@nestjs/config';
export declare class NotificationsService {
    private readonly repo;
    private readonly deviceRepo;
    private readonly notificationsGateway;
    private readonly configService;
    private expo;
    constructor(repo: Repository<Notification>, deviceRepo: Repository<Device>, notificationsGateway: NotificationsGateway, configService: ConfigService);
    getVapidPublicKey(): string;
    create(data: {
        userId: number;
        title: string;
        content: string;
        type?: string;
        referenceId?: number;
    }): Promise<Notification>;
    sendPatrolLocationUpdate(reflectionId: number, lat: number, lng: number): void;
    findByUser(userId: number, page?: number, limit?: number): Promise<{
        statusCode: number;
        message: string;
        data: Notification[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    findOne(id: number, userId: number): Promise<{
        statusCode: number;
        message: string;
        data: Notification;
    }>;
    markRead(id: number, userId: number): Promise<{
        statusCode: number;
        message: string;
    }>;
    markAllRead(userId: number): Promise<{
        statusCode: number;
        message: string;
    }>;
    countUnread(userId: number): Promise<{
        statusCode: number;
        message: string;
        data: {
            unread: number;
        };
    }>;
    findAllSystem(page?: number, limit?: number): Promise<{
        statusCode: number;
        message: string;
        data: Notification[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    createBulkOrSingle(dto: {
        userId?: number;
        roleCode?: string;
        title: string;
        content: string;
    }): Promise<{
        statusCode: number;
        message: string;
        data: Notification;
    } | {
        statusCode: number;
        message: string;
        data?: undefined;
    }>;
}
