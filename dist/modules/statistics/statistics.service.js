"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StatisticsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const site_visit_entity_1 = require("./entities/site-visit.entity");
const notifications_gateway_1 = require("../notifications/notifications.gateway");
const users_service_1 = require("../users/users.service");
let StatisticsService = class StatisticsService {
    constructor(siteVisitRepository, notificationsGateway, usersService) {
        this.siteVisitRepository = siteVisitRepository;
        this.notificationsGateway = notificationsGateway;
        this.usersService = usersService;
    }
    async recordVisit(ipAddress, userAgent) {
        const visit = this.siteVisitRepository.create({ ipAddress, userAgent });
        return this.siteVisitRepository.save(visit);
    }
    async getDashboardStats() {
        const activeOnlineCount = this.notificationsGateway.getActiveUsersCount();
        const totalUsers = await this.usersService.countAllUsers();
        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfYear = new Date(now.getFullYear(), 0, 1);
        const yearVisitsData = await this.siteVisitRepository
            .createQueryBuilder('visit')
            .where('visit.visitedAt >= :startOfYear', { startOfYear })
            .getMany();
        const dayVisits = Array.from({ length: 24 }, (_, i) => ({
            time: `${i.toString().padStart(2, '0')}:00`,
            count: 0,
        }));
        const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
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
        const yearVisits = Array.from({ length: 12 }, (_, i) => ({
            time: `Tháng ${i + 1}`,
            count: 0,
        }));
        for (const v of yearVisitsData) {
            const vDate = new Date(v.visitedAt);
            yearVisits[vDate.getMonth()].count++;
            if (vDate >= startOfMonth) {
                monthVisits[vDate.getDate() - 1].count++;
            }
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
};
exports.StatisticsService = StatisticsService;
exports.StatisticsService = StatisticsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(site_visit_entity_1.SiteVisit)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        notifications_gateway_1.NotificationsGateway,
        users_service_1.UsersService])
], StatisticsService);
//# sourceMappingURL=statistics.service.js.map