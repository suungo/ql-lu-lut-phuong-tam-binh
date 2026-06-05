import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Province } from './entities/province.entity';
import { Ward } from './entities/ward.entity';
import { AdministrativeService } from './administrative.service';
import { AdministrativeController } from './administrative.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Province, Ward])],
  controllers: [AdministrativeController],
  providers: [AdministrativeService],
  exports: [AdministrativeService],
})
export class AdministrativeModule {}
