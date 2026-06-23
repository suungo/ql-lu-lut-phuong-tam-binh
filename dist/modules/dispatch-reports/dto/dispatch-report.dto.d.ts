import { DispatchReportStatus } from '../enums/dispatch-report.enum';
export declare class CreateDispatchReportDto {
    reflectionId: number;
    assignedTo?: number;
    title?: string;
    description?: string;
    note?: string;
    customHandler?: string;
    expectedTime?: Date;
}
export declare class UpdateDispatchReportDto {
    status?: DispatchReportStatus;
    reportContent?: string;
    reflectionStatusUpdate?: string;
    rejectReason?: string;
    attachments?: string[];
    title?: string;
    description?: string;
    expectedTime?: Date;
}
