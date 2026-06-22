import { Controller, Get, Post, Req } from '@nestjs/common';
import { StatisticsService } from './statistics.service';

@Controller('statistics')
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  @Post('visit')
  async recordVisit(@Req() req: any) {
    const ipAddress = req.ip || req.connection?.remoteAddress;
    const userAgent = req.headers['user-agent'];
    await this.statisticsService.recordVisit(ipAddress, userAgent);
    return { statusCode: 201, message: 'Ghi nhận lượt truy cập thành công' };
  }

  @Get('dashboard')
  async getDashboardStats() {
    return this.statisticsService.getDashboardStats();
  }
}
