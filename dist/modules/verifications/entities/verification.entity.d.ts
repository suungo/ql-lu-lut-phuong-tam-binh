import { BaseEntity } from 'src/common/entities/base.entity';
import { User } from 'src/modules/users/entities/user.entity';
import { VerificationStatus, VerificationType } from '../enums/verification.enum';
export declare class Verification extends BaseEntity {
    code: string;
    expiredAt: Date;
    title: string;
    description: string;
    verificationType: VerificationType;
    status: VerificationStatus;
    reviewNote?: string;
    reviewedAt?: Date;
    reviewedBy?: number;
    user_id: number;
    user: User;
    attachments?: string[];
    referenceId?: number;
    cccd?: string;
    isMatchedContact?: boolean;
}
