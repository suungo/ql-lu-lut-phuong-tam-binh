import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: '/notifications',
})
export class NotificationsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  // Track connected users (socketId -> userId)
  private activeUserIds = new Map<string, number>();

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token =
        client.handshake.auth.token || client.handshake.headers.authorization;
      if (!token) {
        client.disconnect();
        return;
      }

      const cleanToken = token.replace('Bearer ', '');
      const payload = await this.jwtService.verifyAsync(cleanToken, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });

      // Join a room specific to the user ID
      client.join(`user_${payload.sub}`);
      this.activeUserIds.set(client.id, payload.sub);
      this.broadcastActiveUsersCount();
      console.log(`User ${payload.sub} connected to notifications`);
    } catch (error) {
      console.log('Notification connection error:', error.message);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    this.activeUserIds.delete(client.id);
    this.broadcastActiveUsersCount();
    console.log(`Client disconnected from notifications: ${client.id}`);
  }

  sendNotificationToUser(userId: number, notification: any) {
    this.server.to(`user_${userId}`).emit('newNotification', notification);
  }

  private broadcastActiveUsersCount() {
    const count = this.getActiveUsersCount();
    this.server.emit('activeUsersCountUpdated', count);
  }

  public getActiveUsersCount(): number {
    const uniqueUserIds = new Set<number>();
    for (const userId of this.activeUserIds.values()) {
      uniqueUserIds.add(userId);
    }
    return uniqueUserIds.size;
  }
}
