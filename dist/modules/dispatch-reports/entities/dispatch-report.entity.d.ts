import { BaseEntity } from 'src/common/entities/base.entity';
import { Reflection } from 'src/modules/reflections/entities/reflection.entity';
import { User } from 'src/modules/users/entities/user.entity';
import { DispatchReportStatus, DispatchReportType } from '../enums/dispatch-report.enum';
export declare class DispatchReport extends BaseEntity {
    code: string;
    type: DispatchReportType;
    status: DispatchReportStatus;
    reflectionId: number;
    reflection: Reflection;
    assignedBy: number;
    assigner: User;
    assignedTo?: number;
    assignee: User;
    customHandler?: string;
    assignedAt: Date;
    expiredAt?: Date;
    acceptedAt?: Date;
    completedAt?: Date;
    expectedTime?: Date;
    title?: string;
    description?: string;
    note?: string;
    reportContent?: string;
    reflectionStatusUpdate?: string;
    attachments?: string[];
    rejectReason?: string;
}
