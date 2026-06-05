import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationsModule } from '../notifications/notifications.module';
import { Reflection } from '../reflections/entities/reflection.entity';
import { DispatchReportsController } from './dispatch-reports.controller';
import { DispatchReportsService } from './dispatch-reports.service';
import { DispatchReport } from './entities/dispatch-report.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([DispatchReport, Reflection]),
    NotificationsModule,
  ],
  controllers: [DispatchReportsController],
  providers: [DispatchReportsService],
  exports: [DispatchReportsService],
})
export class DispatchReportsModule {}
