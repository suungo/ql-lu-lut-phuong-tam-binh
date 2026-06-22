import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { Device } from './entities/device.entity';
import { ReputationHistory } from './entities/reputation-history.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Device, ReputationHistory])],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService, TypeOrmModule],
})
export class UsersModule {}
