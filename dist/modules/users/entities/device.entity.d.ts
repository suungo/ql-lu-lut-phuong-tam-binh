import { BaseEntity } from 'src/common/entities/base.entity';
import { User } from './user.entity';
export declare class Device extends BaseEntity {
    deviceId: string;
    userId: number;
    user: User;
    deviceName?: string;
    deviceType?: string;
    ipAddress?: string;
    userAgent?: string;
    expoPushToken?: string;
    webPushSub?: any;
    isActive: boolean;
    lastActiveAt?: Date;
}
