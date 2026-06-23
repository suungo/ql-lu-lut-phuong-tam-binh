import { Repository } from 'typeorm';
import { AuthsService } from '../auths/auths.service';
import { NotificationsService } from '../notifications/notifications.service';
import { Reflection } from '../reflections/entities/reflection.entity';
import { ResidentContactsService } from '../resident-contacts/resident-contacts.service';
import { UsersService } from '../users/users.service';
import { CreateVerificationDto, UpdateVerificationDto } from './dto/verification.dto';
import { Verification } from './entities/verification.entity';
import { VerificationStatus, VerificationType } from './enums/verification.enum';
export declare class VerificationsService {
    private readonly repo;
    private readonly reflectionRepo;
    private readonly notificationsService;
    private readonly usersService;
    private readonly residentContactsService;
    private readonly authsService;
    constructor(repo: Repository<Verification>, reflectionRepo: Repository<Reflection>, notificationsService: NotificationsService, usersService: UsersService, residentContactsService: ResidentContactsService, authsService: AuthsService);
    create(dto: CreateVerificationDto, user_id: number): Promise<{
        statusCode: number;
        message: string;
        data: {
            isMatchedContact: boolean;
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
            user: import("../users/entities/user.entity").User;
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
    findAll(page?: number, limit?: number, status?: VerificationStatus): Promise<{
        statusCode: number;
        message: string;
        data: Verification[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    findMyVerifications(userId: number, page?: number, limit?: number): Promise<{
        statusCode: number;
        message: string;
        data: Verification[];
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
        data: Verification;
    }>;
    update(id: number, dto: UpdateVerificationDto, reviewerId: number): Promise<{
        statusCode: number;
        message: string;
        data: Verification;
    }>;
    remove(id: number): Promise<{
        statusCode: number;
        message: string;
    }>;
}
