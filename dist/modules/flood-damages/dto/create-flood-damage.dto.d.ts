import { DamageCategory } from '../enums/damage-category.enum';
export declare class CreateFloodDamageDto {
    damageCategory: DamageCategory;
    description: string;
    estimatedValue: number;
    injuredCount?: number;
    deathCount?: number;
    reflectionId: number;
    householdId?: number;
}
