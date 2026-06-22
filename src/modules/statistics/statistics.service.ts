import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SiteVisit } from './entities/site-visit.entity';
import { NotificationsGateway } from '../notifications/notifications.gateway';
import { UsersService } from '../users/users.service';

@Injectable()
export class StatisticsService {
  constructor(
    @InjectRepository(SiteVisit)
    private readonly siteVisitRepository: Repository<SiteVisit>,
    private readonly notificationsGateway: NotificationsGateway,
    private readonly usersService: UsersService,
  ) {}

  async recordVisit(
    ipAddress?: string,
    userAgent?: string,
  ): Promise<SiteVisit> {
    const visit = this.siteVisitRepository.create({ ipAddress, userAgent });
    return this.siteVisitRepository.save(visit);
  }

  async getDashboardStats() {
    const activeOnlineCount = this.notificationsGateway.getActiveUsersCount();
    const totalUsers = await this.usersService.countAllUsers();

    // Fallback Date approach to avoid DB-specific syntax issues like EXTRACT
    // This fetches data and does processing in memory, safe for all DBs
    const now = new Date();
    const startOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    );
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    const yearVisitsData = await this.siteVisitRepository
      .createQueryBuilder('visit')
      .where('visit.visitedAt >= :startOfYear', { startOfYear })
      .getMany();

    // 1. Day visits
    const dayVisits = Array.from({ length: 24 }, (_, i) => ({
      time: `${i.toString().padStart(2, '0')}:00`,
      count: 0,
    }));

    const daysInMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
    ).getDate();
    const monthVisits = Array.from({ length: daysInMonth }, (_, i) => {
      const date = new Date(now.getFullYear(), now.getMonth(), i + 1);
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      return {
        time: `${day}/${month}/${year}`,
        count: 0,
      };
    });

    // 3. Year visits
    const yearVisits = Array.from({ length: 12 }, (_, i) => ({
      time: `Tháng ${i + 1}`,
      count: 0,
    }));

    // Process
    for (const v of yearVisitsData) {
      const vDate = new Date(v.visitedAt);

      // Update year
      yearVisits[vDate.getMonth()].count++;

      // Update month
      if (vDate >= startOfMonth) {
        monthVisits[vDate.getDate() - 1].count++;
      }

      // Update day
      if (vDate >= startOfToday) {
        dayVisits[vDate.getHours()].count++;
      }
    }

    return {
      statusCode: 200,
      data: {
        visits: {
          day: dayVisits,
          month: monthVisits,
          year: yearVisits,
        },
        activeAccounts: [
          {
            name: 'Đang hoạt động',
            value: activeOnlineCount,
            color: '#10b981',
          },
          {
            name: 'Ngoại tuyến',
            value: Math.max(0, totalUsers - activeOnlineCount),
            color: '#cbd5e1',
          },
        ],
      },
      message: 'Lấy dữ liệu thống kê thành công',
    };
  }
}
