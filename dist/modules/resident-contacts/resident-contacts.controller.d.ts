import { BulkCreateResidentContactDto, CreateResidentContactDto, UpdateResidentContactDto } from './dto/resident-contact.dto';
import { ResidentContactsService } from './resident-contacts.service';
export declare class ResidentContactsController {
    private readonly service;
    constructor(service: ResidentContactsService);
    bulkCreate(dto: BulkCreateResidentContactDto): Promise<{
        statusCode: number;
        message: string;
        data: {
            success: number;
            skipped: number;
            errors: string[];
        };
    }>;
    create(dto: CreateResidentContactDto): Promise<{
        statusCode: number;
        message: string;
        data: import("./entities/resident-contact.entity").ResidentContact;
    }>;
    findAll(page?: number, limit?: number, keyword?: string): Promise<{
        statusCode: number;
        message: string;
        data: import("./entities/resident-contact.entity").ResidentContact[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    checkCccd(cccd: string): Promise<{
        statusCode: number;
        message: string;
        data: import("./entities/resident-contact.entity").ResidentContact;
        isMatched: boolean;
    }>;
    update(id: number, dto: UpdateResidentContactDto): Promise<{
        statusCode: number;
        message: string;
        data: import("./entities/resident-contact.entity").ResidentContact;
    }>;
    remove(id: number): Promise<{
        statusCode: number;
        message: string;
    }>;
}
