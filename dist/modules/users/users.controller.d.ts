import { CreateUserDto } from './dto/create-user.dto';
import { UsersService } from './users.service';
import { RoleCode } from 'src/common/enums/role-code.enum';
export declare class UsersController {
    private readonly service;
    constructor(service: UsersService);
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
            role: import("../roles/entities/role.entity").Role;
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
    findAll(page?: number, limit?: number, keyword?: string, roleCode?: RoleCode): Promise<{
        statusCode: number;
        message: string;
        data: import("./entities/user.entity").User[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    getWorkQuality(page?: number, limit?: number, keyword?: string): Promise<{
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
            role: import("../roles/entities/role.entity").Role;
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
    findByRole(roleCode: RoleCode): Promise<import("./entities/user.entity").User[]>;
    getMyReputationHistory(user: any): Promise<{
        statusCode: number;
        message: string;
        data: import("./entities/reputation-history.entity").ReputationHistory[];
    }>;
    getProfile(user: any): Promise<{
        statusCode: number;
        message: string;
        data: import("./entities/user.entity").User;
    }>;
    findOne(id: number): Promise<{
        statusCode: number;
        message: string;
        data: import("./entities/user.entity").User;
    }>;
    updateProfile(user: any, dto: any): Promise<{
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
            role: import("../roles/entities/role.entity").Role;
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
    updateReputation(id: number, reputationPoints: number): Promise<{
        statusCode: number;
        message: string;
        data: {
            reputationPoints: number;
        };
    }>;
    remove(id: number): Promise<{
        statusCode: number;
        message: string;
    }>;
    findDeleted(page?: number, limit?: number, keyword?: string): Promise<{
        statusCode: number;
        message: string;
        data: import("./entities/user.entity").User[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    restore(id: number): Promise<{
        statusCode: number;
        message: string;
    }>;
    suspend(id: number): Promise<{
        statusCode: number;
        message: string;
    }>;
    unsuspend(id: number): Promise<{
        statusCode: number;
        message: string;
    }>;
}
