import { BaseEntity } from 'src/common/entities/base.entity';
import { User } from './user.entity';
export declare class ReputationHistory extends BaseEntity {
    userId: number;
    user: User;
    amount: number;
    reason: string;
    reflectionId?: number;
}
