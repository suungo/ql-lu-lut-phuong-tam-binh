import { BaseEntity } from 'src/common/entities/base.entity';
import { User } from 'src/modules/users/entities/user.entity';
import { Reflection } from './reflection.entity';
export declare class Comment extends BaseEntity {
    content: string;
    userId: number;
    user: User;
    reflectionId: number;
    reflection: Reflection;
    parentId?: number;
    parent?: Comment;
    replies?: Comment[];
}
