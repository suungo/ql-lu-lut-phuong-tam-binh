import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { NotificationsService } from '../notifications/notifications.service';
import { UsersService } from '../users/users.service';
import { ChatsService } from './chats.service';
export declare class ChatsGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private readonly chatsService;
    private readonly jwtService;
    private readonly configService;
    private readonly usersService;
    private readonly notificationsService;
    server: Server;
    private activeUsers;
    private emergencySessions;
    constructor(chatsService: ChatsService, jwtService: JwtService, configService: ConfigService, usersService: UsersService, notificationsService: NotificationsService);
    handleConnection(client: Socket): Promise<void>;
    handleDisconnect(client: Socket): void;
    private broadcastRespondersStatus;
    handleCheckActiveResponders(client: Socket): {
        event: string;
        data: {
            hasOfficer: boolean;
            hasStaff: boolean;
        };
    };
    handleJoinEmergencyUser(data: {
        helpType: string;
        sessionId: string;
        userTitle: string;
    }, client: Socket): Promise<{
        event: string;
        data: {
            sessionId: string;
            helpType: string;
            userTitle: string;
            messages: any[];
            lastUpdate: number;
        };
    }>;
    handleJoinEmergencyResponder(helpType: string, client: Socket): {
        event: string;
        data: {
            sessionId: string;
            helpType: string;
            userTitle: string;
            messages: any[];
            lastUpdate: number;
        }[];
    };
    handleEmergencyMessage(data: {
        helpType: string;
        sessionId: string;
        message: any;
    }, client: Socket): void;
    getActiveUsersCount(): number;
}
