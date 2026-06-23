import { BaseEntity } from 'src/common/entities/base.entity';
import { User } from 'src/modules/users/entities/user.entity';
import { Reflection } from './reflection.entity';
export declare class Like extends BaseEntity {
    userId: number;
    user: User;
    reflectionId: number;
    reflection: Reflection;
}
