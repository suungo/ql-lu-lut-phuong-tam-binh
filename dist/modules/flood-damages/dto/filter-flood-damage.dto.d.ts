import { DamageCategory } from '../enums/damage-category.enum';
import { DamageStatus } from '../enums/damage-status.enum';
export declare class FilterFloodDamageDto {
    search?: string;
    category?: DamageCategory;
    status?: DamageStatus;
    reflectionId?: number;
    householdId?: number;
    page?: number;
    limit?: number;
}
