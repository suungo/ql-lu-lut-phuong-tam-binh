import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

// Import trực tiếp tất cả entities để tránh lỗi glob trong dev mode
import { Conversation } from 'src/modules/chats/entities/conversation.entity';
import { Message } from 'src/modules/chats/entities/message.entity';
import { FloodDamage } from 'src/modules/flood-damages/entities/flood-damage.entity';
import { HumanResource } from 'src/modules/human-resources/entities/human-resource.entity';
import { Notification } from 'src/modules/notifications/entities/notification.entity';
import { Comment } from 'src/modules/reflections/entities/comment.entity';
import { Like } from 'src/modules/reflections/entities/like.entity';
import { Reflection } from 'src/modules/reflections/entities/reflection.entity';
import { Resident } from 'src/modules/residents/entities/resident.entity';
import { Role } from 'src/modules/roles/entities/role.entity';
import { Device } from 'src/modules/users/entities/device.entity';
import { User } from 'src/modules/users/entities/user.entity';
import { ReputationHistory } from 'src/modules/users/entities/reputation-history.entity';
import { Verification } from 'src/modules/verifications/entities/verification.entity';
import { Province } from 'src/modules/administrative/entities/province.entity';
import { Ward } from 'src/modules/administrative/entities/ward.entity';
import { DispatchReport } from 'src/modules/dispatch-reports/entities/dispatch-report.entity';
import { SiteVisit } from 'src/modules/statistics/entities/site-visit.entity';
import { ResidentContact } from 'src/modules/resident-contacts/entities/resident-contact.entity';

export const ALL_ENTITIES = [
  User,
  Role,
  Device,
  ReputationHistory,
  Province,
  Ward,
  FloodDamage,
  HumanResource,
  Resident,
  Reflection,
  Like,
  Comment,
  Verification,
  Notification,
  Conversation,
  Message,
  DispatchReport,
  SiteVisit,
  ResidentContact,
];

export const getDatabaseConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions => {
  const isProduction = configService.get<string>('NODE_ENV') === 'production';
  return {
    type: 'postgres',
    host: configService.get<string>('DB_HOST'),
    port: configService.get<number>('DB_PORT'),
    username: configService.get<string>('DB_USERNAME'),
    password: configService.get<string>('DB_PASSWORD'),
    database: configService.get<string>('DB_NAME'),
    entities: ALL_ENTITIES,
    synchronize: configService.get<string>('DB_SYNC') === 'true',
    namingStrategy: new SnakeNamingStrategy(),
    logging: ['error'],
    // 🔐 SSL bắt buộc khi kết nối Supabase (tự động tắt nếu chạy ở localhost)
    ssl:
      configService.get<string>('DB_HOST') === 'localhost' ||
      configService.get<string>('DB_HOST') === '127.0.0.1'
        ? false
        : { rejectUnauthorized: false },
    connectTimeoutMS: 10000, // timeout 10s thay vì mặc định
    extra: {
      connectionTimeoutMillis: 10000,
    },
  };
};
