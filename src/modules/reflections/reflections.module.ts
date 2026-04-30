import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommentsService } from './comments.service';
import { Comment } from './entities/comment.entity';
import { Like } from './entities/like.entity';
import { Reflection } from './entities/reflection.entity';
import { LikesService } from './likes.service';
import { ReflectionsController } from './reflections.controller';
import { ReflectionsService } from './reflections.service';

import { FloodDamagesModule } from '../flood-damages/floodDamages.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { ResidentsModule } from '../residents/residents.module';
import { UsersModule } from '../users/users.module';
import { VerificationsModule } from '../verifications/verifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Reflection, Like, Comment]),
    FloodDamagesModule,
    NotificationsModule,
    ResidentsModule,
    UsersModule,
    VerificationsModule,
  ],
  controllers: [ReflectionsController],
  providers: [ReflectionsService, LikesService, CommentsService],
  exports: [ReflectionsService, LikesService, CommentsService],
})
export class ReflectionsModule { }
