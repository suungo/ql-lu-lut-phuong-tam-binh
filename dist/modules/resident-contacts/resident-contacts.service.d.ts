import { Repository } from 'typeorm';
import { BulkCreateResidentContactDto, CreateResidentContactDto, UpdateResidentContactDto } from './dto/resident-contact.dto';
import { ResidentContact } from './entities/resident-contact.entity';
export declare class ResidentContactsService {
    private readonly repo;
    constructor(repo: Repository<ResidentContact>);
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
        data: ResidentContact;
    }>;
    findAll(page?: number, limit?: number, keyword?: string): Promise<{
        statusCode: number;
        message: string;
        data: ResidentContact[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    findByCccd(cccd: string): Promise<ResidentContact | null>;
    update(id: number, dto: UpdateResidentContactDto): Promise<{
        statusCode: number;
        message: string;
        data: ResidentContact;
    }>;
    remove(id: number): Promise<{
        statusCode: number;
        message: string;
    }>;
}
