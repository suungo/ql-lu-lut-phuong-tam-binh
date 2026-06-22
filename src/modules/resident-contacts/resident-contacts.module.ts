import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ResidentContact } from './entities/resident-contact.entity';
import { ResidentContactsController } from './resident-contacts.controller';
import { ResidentContactsService } from './resident-contacts.service';

@Module({
  imports: [TypeOrmModule.forFeature([ResidentContact])],
  controllers: [ResidentContactsController],
  providers: [ResidentContactsService],
  exports: [ResidentContactsService],
})
export class ResidentContactsModule {}
