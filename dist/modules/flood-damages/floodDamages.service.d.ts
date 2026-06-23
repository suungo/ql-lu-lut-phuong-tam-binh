import { NotificationsService } from '../notifications/notifications.service';
import { UsersService } from '../users/users.service';
import { CreateFloodDamageDto } from './dto/create-flood-damage.dto';
import { FilterFloodDamageDto } from './dto/filter-flood-damage.dto';
import { UpdateFloodDamageDto } from './dto/update-flood-damage.dto';
import { FloodDamage } from './entities/flood-damage.entity';
import { DamageStatus } from './enums/damage-status.enum';
import { FloodDamageRepository } from './repositories/flood-damage.repository';
export declare class FloodDamagesService {
    private readonly floodDamageRepository;
    private readonly notificationsService;
    private readonly usersService;
    constructor(floodDamageRepository: FloodDamageRepository, notificationsService: NotificationsService, usersService: UsersService);
    create(dto: CreateFloodDamageDto, userId: number): Promise<FloodDamage>;
    findAll(dto: FilterFloodDamageDto, currentUser?: any): Promise<{
        statusCode: number;
        data: FloodDamage[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findOne(id: number): Promise<FloodDamage>;
    update(id: number, dto: UpdateFloodDamageDto): Promise<{
        statusCode: number;
        message: string;
        data: FloodDamage;
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
            damages: FloodDamage[];
        };
    }>;
    updateStatus(id: number, status: DamageStatus, reviewerId?: number): Promise<{
        statusCode: number;
        message: string;
        data: FloodDamage;
    }>;
}
