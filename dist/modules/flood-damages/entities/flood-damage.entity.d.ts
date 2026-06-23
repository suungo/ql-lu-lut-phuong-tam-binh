import { BaseEntity } from 'src/common/entities/base.entity';
import type { Reflection } from 'src/modules/reflections/entities/reflection.entity';
import type { Resident } from 'src/modules/residents/entities/resident.entity';
import type { User } from 'src/modules/users/entities/user.entity';
import { DamageCategory } from '../enums/damage-category.enum';
import { DamageStatus } from '../enums/damage-status.enum';
export declare class FloodDamage extends BaseEntity {
    damageCategory: DamageCategory;
    description: string;
    estimatedValue: number;
    injuredCount: number;
    deathCount: number;
    status: DamageStatus;
    reflectionId: number;
    reflection: Reflection;
    householdId?: number;
    household?: Resident;
    createdBy: number;
    creator: User;
    reviewedBy?: number;
    reviewedAt?: Date;
}
