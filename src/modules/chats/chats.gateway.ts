import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { RoleCode } from 'src/common/enums/role-code.enum';
import { NotificationsService } from '../notifications/notifications.service';
import { UsersService } from '../users/users.service';
import { ChatsService } from './chats.service';

@WebSocketGateway({ cors: { origin: '*' }, namespace: '/chats' })
export class ChatsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  // Track active users: socketId -> { userId, roleCode }
  private activeUsers = new Map<string, { userId: number; roleCode: string }>();

  // Track emergency sessions: sessionId -> SessionData
  private emergencySessions = new Map<
    string,
    {
      sessionId: string;
      helpType: string;
      userTitle: string;
      messages: any[];
      lastUpdate: number;
    }
  >();

  constructor(
    private readonly chatsService: ChatsService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token =
        client.handshake.auth.token || client.handshake.headers.authorization;
      if (token) {
        const cleanToken = token.replace('Bearer ', '');
        const payload = await this.jwtService.verifyAsync(cleanToken, {
          secret: this.configService.get<string>('JWT_SECRET'),
        });

        this.activeUsers.set(client.id, {
          userId: payload.sub,
          roleCode: payload.roleCode,
        });
        console.log(
          `Chat client connected: ${client.id}, User: ${payload.sub}, Role: ${payload.roleCode}`,
        );
      } else {
        console.log(`Guest chat client connected: ${client.id}`);
      }

      // Notify all clients about responder status change
      this.broadcastRespondersStatus();
    } catch (error) {
      console.log('Chat connection error (invalid token):', error.message);
      // Still allow connection as guest
      console.log(`Guest chat client connected: ${client.id}`);
      this.broadcastRespondersStatus();
    }
  }

  handleDisconnect(client: Socket) {
    this.activeUsers.delete(client.id);
    console.log(`Chat client disconnected: ${client.id}`);
    this.broadcastRespondersStatus();
  }

  private broadcastRespondersStatus() {
    let hasOfficer = false;
    let hasStaff = false;

    for (const [, user] of this.activeUsers.entries()) {
      if (user.roleCode === 'OFFICER') hasOfficer = true;
      if (user.roleCode === 'STAFF') hasStaff = true;
    }

    this.server.emit('respondersStatus', {
      hasOfficer,
      hasStaff,
    });
  }

  @SubscribeMessage('checkActiveResponders')
  handleCheckActiveResponders(@ConnectedSocket() client: Socket) {
    let hasOfficer = false;
    let hasStaff = false;

    for (const [, user] of this.activeUsers.entries()) {
      if (user.roleCode === 'OFFICER') hasOfficer = true;
      if (user.roleCode === 'STAFF') hasStaff = true;
    }

    return { event: 'activeRespondersStatus', data: { hasOfficer, hasStaff } };
  }

  @SubscribeMessage('joinEmergencyUser')
  async handleJoinEmergencyUser(
    @MessageBody()
    data: { helpType: string; sessionId: string; userTitle: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.rooms.forEach((room) => {
      if (room.startsWith('user_')) client.leave(room);
    });

    client.join(`user_${data.sessionId}`);

    if (!this.emergencySessions.has(data.sessionId)) {
      this.emergencySessions.set(data.sessionId, {
        sessionId: data.sessionId,
        helpType: data.helpType,
        userTitle: data.userTitle,
        messages: [],
        lastUpdate: Date.now(),
      });

      this.server
        .to(`responders_${data.helpType}`)
        .emit(
          'newEmergencySession',
          this.emergencySessions.get(data.sessionId),
        );

      const targetRole =
        data.helpType === 'medical' ? RoleCode.STAFF : RoleCode.OFFICER;
      const responders = await this.usersService.findByRoleCode(targetRole);
      for (const responder of responders) {
        await this.notificationsService.create({
          userId: responder.id,
          title:
            data.helpType === 'medical'
              ? 'Yêu cầu Cấp cứu y tế'
              : 'Yêu cầu Cứu hộ/Di tản',
          content: `Có người dân (${data.userTitle}) vừa yêu cầu hỗ trợ khẩn cấp trên kênh Chat. Vui lòng vào trang Tin nhắn khẩn cấp ngay!`,
          type: 'EMERGENCY_CHAT',
        });
      }
    }

    return {
      event: 'emergencySessionData',
      data: this.emergencySessions.get(data.sessionId),
    };
  }

  @SubscribeMessage('joinEmergencyResponder')
  handleJoinEmergencyResponder(
    @MessageBody() helpType: string,
    @ConnectedSocket() client: Socket,
  ) {
    client.rooms.forEach((room) => {
      if (room.startsWith('responders_')) client.leave(room);
    });

    client.join(`responders_${helpType}`);

    const sessions = Array.from(this.emergencySessions.values())
      .filter((s) => s.helpType === helpType)
      .sort((a, b) => b.lastUpdate - a.lastUpdate);

    return { event: 'activeEmergencySessions', data: sessions };
  }

  @SubscribeMessage('sendEmergencyMessage')
  handleEmergencyMessage(
    @MessageBody() data: { helpType: string; sessionId: string; message: any },
    @ConnectedSocket() client: Socket,
  ) {
    const session = this.emergencySessions.get(data.sessionId);
    if (session) {
      session.messages.push(data.message);
      session.lastUpdate = Date.now();

      this.server
        .to(`responders_${data.helpType}`)
        .emit('newEmergencyMessage', {
          sessionId: data.sessionId,
          message: data.message,
        });
      this.server.to(`user_${data.sessionId}`).emit('newEmergencyMessage', {
        sessionId: data.sessionId,
        message: data.message,
      });

      // Update session list order for responders
      this.server
        .to(`responders_${data.helpType}`)
        .emit('updateSessionList', session);
    }
  }
}
