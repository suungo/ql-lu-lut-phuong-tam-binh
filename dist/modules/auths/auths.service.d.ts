import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { RoleCode } from 'src/common/enums/role-code.enum';
import { Role } from 'src/modules/roles/entities/role.entity';
import { Device } from 'src/modules/users/entities/device.entity';
import { User } from 'src/modules/users/entities/user.entity';
import { Repository } from 'typeorm';
import { MailService } from '../mail/mail.service';
import { Verification } from '../verifications/entities/verification.entity';
import { ChangePasswordDto } from './dto/changePassword.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RegisterDto } from './dto/register.dto';
import { ResetPasswordDto } from './dto/resetPassword.dto';
import { SubscribePushDto } from './dto/subscribe-push.dto';
export declare class AuthsService {
    private readonly userRepository;
    private readonly roleRepository;
    private readonly deviceRepository;
    private readonly jwtService;
    private readonly configService;
    private mailService;
    private verificationRepository;
    constructor(userRepository: Repository<User>, roleRepository: Repository<Role>, deviceRepository: Repository<Device>, jwtService: JwtService, configService: ConfigService, mailService: MailService, verificationRepository: Repository<Verification>);
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
            role: Role;
            notifications: import("../notifications/entities/notification.entity").Notification[];
            messages: import("../chats/entities/message.entity").Message[];
            conversations: import("../chats/entities/conversation.entity").Conversation[];
            reflections: import("../reflections/entities/reflection.entity").Reflection[];
            likes: import("../reflections/entities/like.entity").Like[];
            comments: import("../reflections/entities/comment.entity").Comment[];
            devices: Device[];
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
    createAccount(data: {
        fullName: string;
        phoneNumber: string;
        email: string;
        roleCode: RoleCode;
        address?: string;
    }): Promise<User>;
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
                role: Role;
                notifications: import("../notifications/entities/notification.entity").Notification[];
                messages: import("../chats/entities/message.entity").Message[];
                conversations: import("../chats/entities/conversation.entity").Conversation[];
                reflections: import("../reflections/entities/reflection.entity").Reflection[];
                likes: import("../reflections/entities/like.entity").Like[];
                comments: import("../reflections/entities/comment.entity").Comment[];
                devices: Device[];
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
    subscribePush(userId: number, dto: SubscribePushDto): Promise<{
        statusCode: number;
        message: string;
    }>;
    logout(userId: number, deviceId?: string): Promise<{
        statusCode: number;
        message: string;
    }>;
    getUserActiveDevices(userId: number): Promise<{
        statusCode: number;
        message: string;
        data: Device[];
    }>;
    refreshToken(dto: RefreshTokenDto): Promise<{
        statusCode: number;
        message: string;
        data: {
            accessToken: string;
            refreshToken: string;
        };
    }>;
    sendOtpResetPassword(phoneNumber: string): Promise<{
        statusCode: number;
        message: string;
    }>;
    resetPasswordWithOtp(dto: ResetPasswordDto): Promise<{
        statusCode: number;
        message: string;
    }>;
    changePassword(userId: number, dto: ChangePasswordDto): Promise<{
        statusCode: number;
        message: string;
    }>;
    findUserByPhoneNumber(phoneNumber: string): Promise<User>;
    findUserById(id: number): Promise<User>;
}
