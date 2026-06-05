import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HumanResource } from './entities/human-resource.entity';
import { HumanResourcesService } from './human-resources.service';
import { HumanResourcesController } from './human-resources.controller';

import { AuthsModule } from '../auths/auths.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([HumanResource]),
    AuthsModule,
    NotificationsModule,
  ],
  controllers: [HumanResourcesController],
  providers: [HumanResourcesService],
  exports: [HumanResourcesService],
})
export class HumanResourcesModule {}
