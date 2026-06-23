import { NotificationsService } from './notifications.service';
export declare class NotificationsController {
    private readonly service;
    constructor(service: NotificationsService);
    findAll(user: any, page?: number, limit?: number): Promise<{
        statusCode: number;
        message: string;
        data: import("./entities/notification.entity").Notification[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    getVapidPublicKey(): string;
    countUnread(user: any): Promise<{
        statusCode: number;
        message: string;
        data: {
            unread: number;
        };
    }>;
    markRead(id: number, user: any): Promise<{
        statusCode: number;
        message: string;
    }>;
    markAllRead(user: any): Promise<{
        statusCode: number;
        message: string;
    }>;
    findAdminList(page?: number, limit?: number): Promise<{
        statusCode: number;
        message: string;
        data: import("./entities/notification.entity").Notification[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    findOne(id: number, user: any): Promise<{
        statusCode: number;
        message: string;
        data: import("./entities/notification.entity").Notification;
    }>;
    createNotification(dto: {
        userId?: number;
        roleCode?: string;
        title: string;
        content: string;
    }): Promise<{
        statusCode: number;
        message: string;
        data: import("./entities/notification.entity").Notification;
    } | {
        statusCode: number;
        message: string;
        data?: undefined;
    }>;
}
