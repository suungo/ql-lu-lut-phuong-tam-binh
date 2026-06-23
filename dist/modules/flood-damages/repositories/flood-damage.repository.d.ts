import { DataSource, Repository } from 'typeorm';
import { FloodDamage } from '../entities/flood-damage.entity';
export declare class FloodDamageRepository extends Repository<FloodDamage> {
    private dataSource;
    constructor(dataSource: DataSource);
    findWithRelations(id: number): Promise<FloodDamage | null>;
    findByReflectionId(reflectionId: number): Promise<FloodDamage[]>;
    findByHouseholdId(householdId: number): Promise<FloodDamage[]>;
}
