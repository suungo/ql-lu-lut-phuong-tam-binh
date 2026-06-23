import { Repository } from 'typeorm';
import { AuthsService } from '../auths/auths.service';
import { CreateResidentDto, UpdateResidentDto } from './dto/resident.dto';
import { Resident } from './entities/resident.entity';
import { HasBusiness, HasChildren, HasElderly, HasPregnant, HasSick, HouseType } from './enums/resident.enum';
export declare class ResidentsService {
    private readonly repo;
    private readonly authsService;
    constructor(repo: Repository<Resident>, authsService: AuthsService);
    create(dto: CreateResidentDto, currentUser: any): Promise<{
        statusCode: number;
        message: string;
        data: Resident;
    }>;
    findAll(page?: number, limit?: number, currentUser?: any, keyword?: string, houseType?: HouseType, hasElderly?: HasElderly, hasChildren?: HasChildren, hasPregnantWomen?: HasPregnant, hasChronicDisease?: HasSick, hasBusiness?: HasBusiness): Promise<{
        statusCode: number;
        message: string;
        data: Resident[];
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
        data: any;
    }>;
    update(id: number, dto: UpdateResidentDto): Promise<{
        statusCode: number;
        message: string;
        data: Resident;
    }>;
    remove(id: number): Promise<{
        statusCode: number;
        message: string;
    }>;
    findMyResident(userId: number): Promise<{
        statusCode: number;
        message: string;
        data: Resident;
    }>;
    findNearby(lat: number, lng: number, radiusInMeters: number): Promise<Resident[]>;
}
