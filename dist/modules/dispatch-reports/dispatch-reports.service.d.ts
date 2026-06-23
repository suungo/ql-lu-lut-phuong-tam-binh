import { Repository } from 'typeorm';
import { NotificationsService } from '../notifications/notifications.service';
import { Reflection } from '../reflections/entities/reflection.entity';
import { CreateDispatchReportDto, UpdateDispatchReportDto } from './dto/dispatch-report.dto';
import { DispatchReport } from './entities/dispatch-report.entity';
import { DispatchReportStatus, DispatchReportType } from './enums/dispatch-report.enum';
export declare class DispatchReportsService {
    private readonly repo;
    private readonly reflectionRepo;
    private readonly notificationsService;
    constructor(repo: Repository<DispatchReport>, reflectionRepo: Repository<Reflection>, notificationsService: NotificationsService);
    createDispatchToInspector(dto: CreateDispatchReportDto, managerId: number): Promise<{
        statusCode: number;
        message: string;
        data: DispatchReport;
    }>;
    createDispatchToPatrol(dto: CreateDispatchReportDto, inspectorId: number): Promise<{
        statusCode: number;
        message: string;
        data: DispatchReport;
    }>;
    acceptDispatch(id: number, userId: number): Promise<{
        statusCode: number;
        message: string;
        data: DispatchReport;
    }>;
    updateReport(id: number, dto: UpdateDispatchReportDto, userId: number): Promise<{
        statusCode: number;
        message: string;
        data: DispatchReport;
    }>;
    findAll(page?: number, limit?: number, filters?: {
        status?: DispatchReportStatus;
        type?: DispatchReportType;
        reflectionId?: number;
        assignedTo?: number;
        assignedBy?: number;
        search?: string;
    }): Promise<{
        statusCode: number;
        message: string;
        data: DispatchReport[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    findOne(id: number): Promise<{
        statusCode: number;
        message: string;
        data: DispatchReport;
    }>;
    findByReflection(reflectionId: number): Promise<{
        statusCode: number;
        message: string;
        data: DispatchReport[];
    }>;
    remove(id: number): Promise<{
        statusCode: number;
        message: string;
    }>;
    nudgeDispatch(id: number, senderId: number): Promise<{
        statusCode: number;
        message: string;
        data: DispatchReport;
    }>;
}
