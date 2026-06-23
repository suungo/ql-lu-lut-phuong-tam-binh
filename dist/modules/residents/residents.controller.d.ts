import { CreateResidentDto, UpdateResidentDto } from './dto/resident.dto';
import { HasBusiness, HasChildren, HasElderly, HasPregnant, HasSick, HouseType } from './enums/resident.enum';
import { ResidentsService } from './residents.service';
export declare class ResidentsController {
    private readonly service;
    constructor(service: ResidentsService);
    create(dto: CreateResidentDto, user: any): Promise<{
        statusCode: number;
        message: string;
        data: import("./entities/resident.entity").Resident;
    }>;
    createFromWebhook(dto: CreateResidentDto): Promise<{
        statusCode: number;
        message: string;
        data: import("./entities/resident.entity").Resident;
    }>;
    findAll(user: any, page?: number, limit?: number, keyword?: string, houseType?: HouseType, hasElderly?: HasElderly, hasChildren?: HasChildren, hasPregnantWomen?: HasPregnant, hasChronicDisease?: HasSick, hasBusiness?: HasBusiness): Promise<{
        statusCode: number;
        message: string;
        data: import("./entities/resident.entity").Resident[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    findMyResident(user: any): Promise<{
        statusCode: number;
        message: string;
        data: import("./entities/resident.entity").Resident;
    }>;
    findOne(id: number): Promise<{
        statusCode: number;
        message: string;
        data: any;
    }>;
    update(id: number, dto: UpdateResidentDto): Promise<{
        statusCode: number;
        message: string;
        data: import("./entities/resident.entity").Resident;
    }>;
    remove(id: number): Promise<{
        statusCode: number;
        message: string;
    }>;
}
