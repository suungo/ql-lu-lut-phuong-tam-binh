import { Repository } from 'typeorm';
import { SiteVisit } from './entities/site-visit.entity';
import { NotificationsGateway } from '../notifications/notifications.gateway';
import { UsersService } from '../users/users.service';
export declare class StatisticsService {
    private readonly siteVisitRepository;
    private readonly notificationsGateway;
    private readonly usersService;
    constructor(siteVisitRepository: Repository<SiteVisit>, notificationsGateway: NotificationsGateway, usersService: UsersService);
    recordVisit(ipAddress?: string, userAgent?: string): Promise<SiteVisit>;
    getDashboardStats(): Promise<{
        statusCode: number;
        data: {
            visits: {
                day: {
                    time: string;
                    count: number;
                }[];
                month: {
                    time: string;
                    count: number;
                }[];
                year: {
                    time: string;
                    count: number;
                }[];
            };
            activeAccounts: {
                name: string;
                value: number;
                color: string;
            }[];
        };
        message: string;
    }>;
}
