import { BaseEntity } from 'src/common/entities/base.entity';
import { User } from 'src/modules/users/entities/user.entity';
import { Conversation } from './conversation.entity';
export declare class Message extends BaseEntity {
    content: string;
    imageUrl?: string;
    isRead: boolean;
    senderId: number;
    sender: User;
    conversationId: number;
    conversation: Conversation;
}
