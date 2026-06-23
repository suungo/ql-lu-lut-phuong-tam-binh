import { BaseEntity } from 'src/common/entities/base.entity';
import { User } from 'src/modules/users/entities/user.entity';
export declare class Notification extends BaseEntity {
    title: string;
    content: string;
    isRead: boolean;
    type?: string;
    referenceId?: number;
    userId: number;
    user: User;
}
