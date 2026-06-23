import { AuthsService } from './auths.service';
import { ChangePasswordDto } from './dto/changePassword.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RegisterDto } from './dto/register.dto';
import { ResetPasswordDto } from './dto/resetPassword.dto';
import { SubscribePushDto } from './dto/subscribe-push.dto';
export declare class AuthsController {
    private readonly authsService;
    constructor(authsService: AuthsService);
    register(dto: RegisterDto): Promise<{
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
            status: import("../users/enums/user-status.enum").UserStatus;
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
            devices: import("../users/entities/device.entity").Device[];
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
    login(dto: LoginDto): Promise<{
        statusCode: number;
        message: string;
        data: {
            accessToken: string;
            refreshToken: string;
            user: {
                fullName: string;
                email: string;
                phoneNumber: string;
                gender: import("../../common/enums/gender.enum").Gender;
                dateBirth: Date;
                address: string;
                avatar?: string;
                status: import("../users/enums/user-status.enum").UserStatus;
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
                devices: import("../users/entities/device.entity").Device[];
                floodDamages: import("../flood-damages/entities/flood-damage.entity").FloodDamage[];
                id: number;
                createdAt?: Date;
                createdBy?: number;
                updatedAt?: Date;
                updatedBy?: number;
                deletedAt?: Date;
                deletedBy?: number;
            };
            deviceId: string;
        };
    }>;
    refreshToken(dto: RefreshTokenDto): Promise<{
        statusCode: number;
        message: string;
        data: {
            accessToken: string;
            refreshToken: string;
        };
    }>;
    getMe(user: any): Promise<{
        statusCode: number;
        message: string;
    }>;
    sendOtpResetPassword(phoneNumber: string): Promise<{
        statusCode: number;
        message: string;
    }>;
    resetPassword(dto: ResetPasswordDto): Promise<{
        statusCode: number;
        message: string;
    }>;
    changePassword(req: any, dto: ChangePasswordDto): Promise<{
        statusCode: number;
        message: string;
    }>;
    subscribePush(req: any, dto: SubscribePushDto): Promise<{
        statusCode: number;
        message: string;
    }>;
    logout(req: any, deviceId?: string): Promise<{
        statusCode: number;
        message: string;
    }>;
    getUserDevices(req: any): Promise<{
        statusCode: number;
        message: string;
        data: import("../users/entities/device.entity").Device[];
    }>;
}
