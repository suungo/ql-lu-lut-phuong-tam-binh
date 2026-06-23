import { CreateFloodDamageDto } from './dto/create-flood-damage.dto';
import { FilterFloodDamageDto } from './dto/filter-flood-damage.dto';
import { UpdateFloodDamageDto } from './dto/update-flood-damage.dto';
import { DamageStatus } from './enums/damage-status.enum';
import { FloodDamagesService } from './floodDamages.service';
export declare class FloodDamagesController {
    private readonly floodDamagesService;
    constructor(floodDamagesService: FloodDamagesService);
    create(dto: CreateFloodDamageDto, req: any): Promise<{
        statusCode: number;
        data: import("./entities/flood-damage.entity").FloodDamage;
    }>;
    findAll(dto: FilterFloodDamageDto, req: any): Promise<{
        statusCode: number;
        data: import("./entities/flood-damage.entity").FloodDamage[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findOne(id: number): Promise<{
        statusCode: number;
        data: import("./entities/flood-damage.entity").FloodDamage;
    }>;
    update(id: number, dto: UpdateFloodDamageDto): Promise<{
        statusCode: number;
        message: string;
        data: import("./entities/flood-damage.entity").FloodDamage;
    }>;
    remove(id: number): Promise<{
        statusCode: number;
        message: string;
    }>;
    getStatsByReflection(reflectionId: number): Promise<{
        statusCode: number;
        data: {
            totalDamages: number;
            totalValue: number;
            totalInjured: number;
            totalDeaths: number;
            damages: import("./entities/flood-damage.entity").FloodDamage[];
        };
    }>;
    updateStatus(id: number, status: DamageStatus, req: any): Promise<{
        statusCode: number;
        message: string;
        data: import("./entities/flood-damage.entity").FloodDamage;
    }>;
}
