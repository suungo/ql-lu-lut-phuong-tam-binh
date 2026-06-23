import { DispatchReportsService } from './dispatch-reports.service';
import { CreateDispatchReportDto, UpdateDispatchReportDto } from './dto/dispatch-report.dto';
import { DispatchReportStatus, DispatchReportType } from './enums/dispatch-report.enum';
export declare class DispatchReportsController {
    private readonly service;
    constructor(service: DispatchReportsService);
    createToInspector(dto: CreateDispatchReportDto, user: any): Promise<{
        statusCode: number;
        message: string;
        data: import("./entities/dispatch-report.entity").DispatchReport;
    }>;
    createToPatrol(dto: CreateDispatchReportDto, user: any): Promise<{
        statusCode: number;
        message: string;
        data: import("./entities/dispatch-report.entity").DispatchReport;
    }>;
    accept(id: number, user: any): Promise<{
        statusCode: number;
        message: string;
        data: import("./entities/dispatch-report.entity").DispatchReport;
    }>;
    nudge(id: number, user: any): Promise<{
        statusCode: number;
        message: string;
        data: import("./entities/dispatch-report.entity").DispatchReport;
    }>;
    update(id: number, dto: UpdateDispatchReportDto, user: any): Promise<{
        statusCode: number;
        message: string;
        data: import("./entities/dispatch-report.entity").DispatchReport;
    }>;
    findAll(page?: number, limit?: number, status?: DispatchReportStatus, type?: DispatchReportType, reflectionId?: number, search?: string, user?: any): Promise<{
        statusCode: number;
        message: string;
        data: import("./entities/dispatch-report.entity").DispatchReport[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    findMy(user: any, page?: number, limit?: number): Promise<{
        statusCode: number;
        message: string;
        data: import("./entities/dispatch-report.entity").DispatchReport[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    findByReflection(reflectionId: number): Promise<{
        statusCode: number;
        message: string;
        data: import("./entities/dispatch-report.entity").DispatchReport[];
    }>;
    findOne(id: number): Promise<{
        statusCode: number;
        message: string;
        data: import("./entities/dispatch-report.entity").DispatchReport;
    }>;
    remove(id: number): Promise<{
        statusCode: number;
        message: string;
    }>;
}
