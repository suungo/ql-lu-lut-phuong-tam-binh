import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationsModule } from '../notifications/notifications.module';
import { UsersModule } from '../users/users.module';
import { FloodDamage } from './entities/flood-damage.entity';
import { FloodDamagesController } from './floodDamages.controller';
import { FloodDamagesService } from './floodDamages.service';
import { FloodDamageRepository } from './repositories/flood-damage.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([FloodDamage]),
    NotificationsModule,
    UsersModule,
  ],
  controllers: [FloodDamagesController],
  providers: [FloodDamagesService, FloodDamageRepository],
  exports: [FloodDamagesService],
})
export class FloodDamagesModule {}
