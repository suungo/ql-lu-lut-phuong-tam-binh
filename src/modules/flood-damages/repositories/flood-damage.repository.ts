import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { FloodDamage } from '../entities/flood-damage.entity';

@Injectable()
export class FloodDamageRepository extends Repository<FloodDamage> {
  constructor(private dataSource: DataSource) {
    super(FloodDamage, dataSource.createEntityManager());
  }

  async findWithRelations(id: number): Promise<FloodDamage | null> {
    return this.findOne({
      where: { id },
      relations: ['reflection', 'household', 'creator'],
    });
  }

  async findByReflectionId(reflectionId: number): Promise<FloodDamage[]> {
    return this.find({
      where: { reflectionId },
      relations: ['household'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByHouseholdId(householdId: number): Promise<FloodDamage[]> {
    return this.find({
      where: { householdId },
      order: { createdAt: 'DESC' },
    });
  }
}
