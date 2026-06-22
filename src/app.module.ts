import { Module, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD, RouterModule } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule, seconds } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getDatabaseConfig } from './database/database.config';
import { routes } from './routes';

// Modules
import { AuthsModule } from './modules/auths/auths.module';
import { ChatsModule } from './modules/chats/chats.module';
import { CloudinaryModule } from './modules/cloudinary/cloudinary.module';
import { DispatchReportsModule } from './modules/dispatch-reports/dispatch-reports.module';
import { FloodDamagesModule } from './modules/flood-damages/floodDamages.module';
import { HumanResourcesModule } from './modules/human-resources/human-resources.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { ReflectionsModule } from './modules/reflections/reflections.module';
import { ResidentsModule } from './modules/residents/residents.module';
import { RolesModule } from './modules/roles/roles.module';
import { UploadModule } from './modules/upload/upload.module';
import { UsersModule } from './modules/users/users.module';
import { AdministrativeModule } from './modules/administrative/administrative.module';
import { StatisticsModule } from './modules/statistics/statistics.module';
import { ResidentContactsModule } from './modules/resident-contacts/resident-contacts.module';

// Seeds
import { Role } from './modules/roles/entities/role.entity';
import { RoleSeederService } from './seeds/role.seeder';
import { SeederRunner } from './seeds/seeder-runner';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    ThrottlerModule.forRoot({
      throttlers: [{ ttl: seconds(60), limit: 120 }],
    }),

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        getDatabaseConfig(configService),
    }),

    // Đăng ký Role trong AppModule context cho Seeder dùng
    TypeOrmModule.forFeature([Role]),

    RouterModule.register(routes),

    AuthsModule,
    UsersModule,
    RolesModule,
    HumanResourcesModule,
    ResidentsModule,
    ReflectionsModule,
    ChatsModule,
    NotificationsModule,
    CloudinaryModule,
    UploadModule,
    FloodDamagesModule,
    AdministrativeModule,
    DispatchReportsModule,
    StatisticsModule,
    ResidentContactsModule,
  ],
  providers: [
    RoleSeederService,
    SeederRunner,
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule implements OnApplicationBootstrap {
  constructor(private readonly seederRunner: SeederRunner) {}

  // Chạy seeder sau khi toàn bộ app đã boot xong (DI đầy đủ)
  async onApplicationBootstrap() {
    await this.seederRunner.runAllSeeders();
  }
}
