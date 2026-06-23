import { BaseEntity } from 'src/common/entities/base.entity';
export declare class SiteVisit extends BaseEntity {
    visitedAt: Date;
    ipAddress: string;
    userAgent: string;
}
