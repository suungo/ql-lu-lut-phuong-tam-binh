import { VerificationStatus, VerificationType } from '../enums/verification.enum';
export declare class CreateVerificationDto {
    title: string;
    description: string;
    verificationType?: VerificationType;
    attachments?: string[];
    referenceId?: number;
    cccd?: string;
    status?: VerificationStatus;
}
declare const UpdateVerificationDto_base: import("@nestjs/common").Type<Partial<CreateVerificationDto>>;
export declare class UpdateVerificationDto extends UpdateVerificationDto_base {
    status?: VerificationStatus;
    reviewNote?: string;
}
export {};
