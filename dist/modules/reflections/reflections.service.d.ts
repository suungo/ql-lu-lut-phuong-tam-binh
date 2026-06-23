import { Repository } from 'typeorm';
import { CreateReflectionDto, UpdateReflectionDto } from './dto/reflection.dto';
import { Reflection } from './entities/reflection.entity';
import { ReflectionStatus } from './enums/reflection.enum';
import { FloodDamagesService } from '../flood-damages/floodDamages.service';
import { NotificationsService } from '../notifications/notifications.service';
import { ResidentsService } from '../residents/residents.service';
import { UsersService } from '../users/users.service';
import { OllamaService } from '../ollama/ollama.service';
import { DispatchReport } from '../dispatch-reports/entities/dispatch-report.entity';
export declare class ReflectionsService {
    private readonly repo;
    private readonly dispatchReportRepo;
    private readonly floodDamagesService;
    private readonly notificationsService;
    private readonly residentsService;
    private readonly usersService;
    private readonly ollamaService;
    constructor(repo: Repository<Reflection>, dispatchReportRepo: Repository<DispatchReport>, floodDamagesService: FloodDamagesService, notificationsService: NotificationsService, residentsService: ResidentsService, usersService: UsersService, ollamaService: OllamaService);
    create(dto: CreateReflectionDto, currentUser: any): Promise<{
        statusCode: number;
        message: string;
        data: Reflection;
    }>;
    private processResidentReflectionAsync;
    private sendCreationNotifications;
    verifyByOfficer(id: number, dto: {
        confirmed: boolean;
        rejectReason?: string;
        note?: string;
    }, officer: any): Promise<{
        statusCode: number;
        message: string;
        data: Reflection;
    }>;
    acceptByPatrol(id: number, patrol: any): Promise<{
        statusCode: number;
        message: string;
        data: Reflection;
    }>;
    updatePatrolLocation(id: number, dto: {
        lat: number;
        lng: number;
    }, patrol: any): Promise<{
        statusCode: number;
        message: string;
        data: {
            patrolLat: number;
            patrolLng: number;
        };
    }>;
    submitPatrolReport(id: number, dto: {
        resolved: boolean;
        patrolReport: string;
        incompleteReason?: string;
    }, patrol: any): Promise<{
        statusCode: number;
        message: string;
        data: Reflection;
    }>;
    managerConfirm(id: number, dto: {
        note?: string;
        rating?: number;
    }, manager: any): Promise<{
        statusCode: number;
        message: string;
        data: Reflection;
    }>;
    private createFloodDamageFromReflection;
    private notifyNearbyResidents;
    findAll(page?: number, limit?: number, currentUser?: any, keyword?: string, status?: ReflectionStatus, isMap?: boolean, assignedUserId?: number): Promise<{
        statusCode: number;
        message: string;
        data: Reflection[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    findMyReflections(userId: number, page?: number, limit?: number): Promise<{
        statusCode: number;
        message: string;
        data: Reflection[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    findOne(id: number, currentUser?: any): Promise<{
        statusCode: number;
        message: string;
        data: Reflection;
    }>;
    update(id: number, dto: UpdateReflectionDto, userId: number): Promise<{
        statusCode: number;
        message: string;
        data: Reflection;
    }>;
    remove(id: number, currentUser?: any): Promise<{
        statusCode: number;
        message: string;
    }>;
    updateStatus(id: number, status: ReflectionStatus, currentUser?: any): Promise<{
        statusCode: number;
        message: string;
        data: Reflection;
    }>;
    private mapCategoryToDamageCategory;
    private findNearbyActiveReflections;
    getAssignedStats(userId: number): Promise<{
        statusCode: number;
        message: string;
        data: {
            total: number;
            completed: number;
            inProgress: number;
            pending: number;
            rejected: number;
        };
    }>;
    rateReflection(id: number, rating: number, userId: number, comment?: string): Promise<{
        statusCode: number;
        message: string;
        data: Reflection;
    }>;
    private maskName;
    private maskAddress;
}
