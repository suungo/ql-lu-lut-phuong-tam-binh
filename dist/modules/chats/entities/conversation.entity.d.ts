import { BaseEntity } from 'src/common/entities/base.entity';
import { User } from 'src/modules/users/entities/user.entity';
import { Message } from './message.entity';
export declare class Conversation extends BaseEntity {
    name?: string;
    isGroup: boolean;
    creatorId: number;
    creator: User;
    messages: Message[];
}
