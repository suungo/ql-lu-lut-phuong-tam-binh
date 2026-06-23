import { StatisticsService } from './statistics.service';
export declare class StatisticsController {
    private readonly statisticsService;
    constructor(statisticsService: StatisticsService);
    recordVisit(req: any): Promise<{
        statusCode: number;
        message: string;
    }>;
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
