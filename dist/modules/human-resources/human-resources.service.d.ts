import { Repository } from 'typeorm';
import { CreateHumanResourceDto } from './dto/create-human-resource.dto';
import { UpdateHumanResourceDto } from './dto/update-human-resource.dto';
import { HumanResource } from './entities/human-resource.entity';
import { HumanResourceStatus } from './enums/human-resource.enum';
import { AuthsService } from '../auths/auths.service';
import { NotificationsService } from '../notifications/notifications.service';
export declare class HumanResourcesService {
    private readonly repo;
    private readonly authsService;
    private readonly notificationsService;
    constructor(repo: Repository<HumanResource>, authsService: AuthsService, notificationsService: NotificationsService);
    create(dto: CreateHumanResourceDto, currentUser?: any): Promise<{
        statusCode: number;
        message: string;
        data: HumanResource;
    }>;
    findAll(page?: number, limit?: number, currentUser?: any, keyword?: string, status?: HumanResourceStatus, roleCode?: string): Promise<{
        statusCode: number;
        message: string;
        data: HumanResource[];
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
        data: HumanResource;
    }>;
    update(id: number, dto: UpdateHumanResourceDto): Promise<{
        statusCode: number;
        message: string;
        data: HumanResource;
    }>;
    remove(id: number): Promise<{
        statusCode: number;
        message: string;
    }>;
}
