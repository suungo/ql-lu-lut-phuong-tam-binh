import { CreateVerificationDto, UpdateVerificationDto } from './dto/verification.dto';
import { VerificationStatus } from './enums/verification.enum';
import { VerificationsService } from './verifications.service';
import { User } from '../users/entities/user.entity';
export declare class VerificationsController {
    private readonly service;
    constructor(service: VerificationsService);
    create(dto: CreateVerificationDto, user: User): Promise<{
        statusCode: number;
        message: string;
        data: {
            isMatchedContact: boolean;
            code: string;
            expiredAt: Date;
            title: string;
            description: string;
            verificationType: import("./enums/verification.enum").VerificationType;
            status: VerificationStatus;
            reviewNote?: string;
            reviewedAt?: Date;
            reviewedBy?: number;
            user_id: number;
            user: User;
            attachments?: string[];
            referenceId?: number;
            cccd?: string;
            id: number;
            createdAt?: Date;
            createdBy?: number;
            updatedAt?: Date;
            updatedBy?: number;
            deletedAt?: Date;
            deletedBy?: number;
        };
    }>;
    findAll(page?: number, limit?: number, status?: VerificationStatus, user?: User): Promise<{
        statusCode: number;
        message: string;
        data: import("./entities/verification.entity").Verification[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    findMy(user: User, page?: number, limit?: number): Promise<{
        statusCode: number;
        message: string;
        data: import("./entities/verification.entity").Verification[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    findOne(id: number): Promise<{
        statusCode: number;
        message: string;
        data: import("./entities/verification.entity").Verification;
    }>;
    update(id: number, dto: UpdateVerificationDto, user: any): Promise<{
        statusCode: number;
        message: string;
        data: import("./entities/verification.entity").Verification;
    }>;
    remove(id: number): Promise<{
        statusCode: number;
        message: string;
    }>;
}
