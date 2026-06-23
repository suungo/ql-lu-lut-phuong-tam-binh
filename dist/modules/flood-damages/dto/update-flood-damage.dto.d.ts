import { DamageCategory } from '../enums/damage-category.enum';
import { DamageStatus } from '../enums/damage-status.enum';
export declare class UpdateFloodDamageDto {
    damageCategory?: DamageCategory;
    description?: string;
    estimatedValue?: number;
    injuredCount?: number;
    deathCount?: number;
    status?: DamageStatus;
    householdId?: number;
}
