import { OnModuleInit } from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { RoleCode } from 'src/common/enums/role-code.enum';
import { ReputationHistory } from './entities/reputation-history.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { Role } from 'src/modules/roles/entities/role.entity';
export declare class UsersService implements OnModuleInit {
    private readonly repo;
    constructor(repo: Repository<User>);
    create(dto: CreateUserDto): Promise<{
        statusCode: number;
        message: string;
        data: {
            fullName: string;
            email: string;
            phoneNumber: string;
            gender: import("../../common/enums/gender.enum").Gender;
            dateBirth: Date;
            address: string;
            avatar?: string;
            status: import("./enums/user-status.enum").UserStatus;
            reputationPoints: number;
            reputationBlockedUntil?: Date;
            roleId: number;
            role: Role;
            notifications: import("../notifications/entities/notification.entity").Notification[];
            messages: import("../chats/entities/message.entity").Message[];
            conversations: import("../chats/entities/conversation.entity").Conversation[];
            reflections: import("../reflections/entities/reflection.entity").Reflection[];
            likes: import("../reflections/entities/like.entity").Like[];
            comments: import("../reflections/entities/comment.entity").Comment[];
            devices: import("./entities/device.entity").Device[];
            floodDamages: import("../flood-damages/entities/flood-damage.entity").FloodDamage[];
            id: number;
            createdAt?: Date;
            createdBy?: number;
            updatedAt?: Date;
            updatedBy?: number;
            deletedAt?: Date;
            deletedBy?: number;
        };
    }>;
    onModuleInit(): Promise<void>;
    checkAndResetReputationForNewYear(): Promise<void>;
    findAll(page?: number, limit?: number, keyword?: string, roleCode?: RoleCode): Promise<{
        statusCode: number;
        message: string;
        data: User[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    getStaffWorkQuality(page?: number, limit?: number, keyword?: string): Promise<{
        statusCode: number;
        message: string;
        data: {
            averageRating: number;
            ratingCount: number;
            fullName: string;
            email: string;
            phoneNumber: string;
            password?: string;
            gender: import("../../common/enums/gender.enum").Gender;
            dateBirth: Date;
            address: string;
            avatar?: string;
            status: import("./enums/user-status.enum").UserStatus;
            reputationPoints: number;
            reputationBlockedUntil?: Date;
            roleId: number;
            role: Role;
            notifications: import("../notifications/entities/notification.entity").Notification[];
            messages: import("../chats/entities/message.entity").Message[];
            conversations: import("../chats/entities/conversation.entity").Conversation[];
            reflections: import("../reflections/entities/reflection.entity").Reflection[];
            likes: import("../reflections/entities/like.entity").Like[];
            comments: import("../reflections/entities/comment.entity").Comment[];
            devices: import("./entities/device.entity").Device[];
            floodDamages: import("../flood-damages/entities/flood-damage.entity").FloodDamage[];
            id: number;
            createdAt?: Date;
            createdBy?: number;
            updatedAt?: Date;
            updatedBy?: number;
            deletedAt?: Date;
            deletedBy?: number;
        }[];
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
        data: User;
    }>;
    updateProfile(id: number, dto: Partial<User>): Promise<{
        statusCode: number;
        message: string;
        data: {
            fullName: string;
            email: string;
            phoneNumber: string;
            gender: import("../../common/enums/gender.enum").Gender;
            dateBirth: Date;
            address: string;
            avatar?: string;
            status: import("./enums/user-status.enum").UserStatus;
            reputationPoints: number;
            reputationBlockedUntil?: Date;
            roleId: number;
            role: Role;
            notifications: import("../notifications/entities/notification.entity").Notification[];
            messages: import("../chats/entities/message.entity").Message[];
            conversations: import("../chats/entities/conversation.entity").Conversation[];
            reflections: import("../reflections/entities/reflection.entity").Reflection[];
            likes: import("../reflections/entities/like.entity").Like[];
            comments: import("../reflections/entities/comment.entity").Comment[];
            devices: import("./entities/device.entity").Device[];
            floodDamages: import("../flood-damages/entities/flood-damage.entity").FloodDamage[];
            id: number;
            createdAt?: Date;
            createdBy?: number;
            updatedAt?: Date;
            updatedBy?: number;
            deletedAt?: Date;
            deletedBy?: number;
        };
    }>;
    findByRoleCode(roleCode: RoleCode): Promise<User[]>;
    remove(id: number): Promise<{
        statusCode: number;
        message: string;
    }>;
    updateReputation(id: number, points: number): Promise<{
        statusCode: number;
        message: string;
        data: {
            reputationPoints: number;
        };
    }>;
    findNearestByRole(roleCode: RoleCode, lat: number, lng: number): Promise<User[]>;
    findByRoleCodes(roleCodes: RoleCode[]): Promise<User[]>;
    adjustReputation(userId: number, amount: number, reason: string, reflectionId?: number): Promise<void>;
    getReputationHistory(userId: number): Promise<{
        statusCode: number;
        message: string;
        data: ReputationHistory[];
    }>;
    countAllUsers(): Promise<number>;
    findDeleted(page?: number, limit?: number, keyword?: string): Promise<{
        statusCode: number;
        message: string;
        data: User[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    restoreDeleted(id: number): Promise<{
        statusCode: number;
        message: string;
    }>;
    suspendUser(id: number): Promise<{
        statusCode: number;
        message: string;
    }>;
    activateUser(id: number): Promise<{
        statusCode: number;
        message: string;
    }>;
}
