import { CreateHumanResourceDto } from './dto/create-human-resource.dto';
import { UpdateHumanResourceDto } from './dto/update-human-resource.dto';
import { HumanResourceStatus } from './enums/human-resource.enum';
import { HumanResourcesService } from './human-resources.service';
export declare class HumanResourcesController {
    private readonly service;
    constructor(service: HumanResourcesService);
    create(dto: CreateHumanResourceDto, user: any): Promise<{
        statusCode: number;
        message: string;
        data: import("./entities/human-resource.entity").HumanResource;
    }>;
    createFromWebhook(dto: any): Promise<{
        statusCode: number;
        message: string;
        data: import("./entities/human-resource.entity").HumanResource;
    }>;
    findAll(user: any, page?: number, limit?: number, keyword?: string, status?: HumanResourceStatus, roleCode?: string): Promise<{
        statusCode: number;
        message: string;
        data: import("./entities/human-resource.entity").HumanResource[];
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
        data: import("./entities/human-resource.entity").HumanResource;
    }>;
    update(id: number, dto: UpdateHumanResourceDto): Promise<{
        statusCode: number;
        message: string;
        data: import("./entities/human-resource.entity").HumanResource;
    }>;
    remove(id: number): Promise<{
        statusCode: number;
        message: string;
    }>;
}
