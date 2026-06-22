import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Verification } from './entities/verification.entity';
import { VerificationsService } from './verifications.service';
import { VerificationsController } from './verifications.controller';

import { Reflection } from '../reflections/entities/reflection.entity';
import { NotificationsModule } from '../notifications/notifications.module';
import { UsersModule } from '../users/users.module';
import { ResidentContactsModule } from '../resident-contacts/resident-contacts.module';
import { AuthsModule } from '../auths/auths.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Verification, Reflection]),
    NotificationsModule,
    UsersModule,
    ResidentContactsModule,
    AuthsModule,
  ],
  controllers: [VerificationsController],
  providers: [VerificationsService],
  exports: [VerificationsService],
})
export class VerificationsModule {}
