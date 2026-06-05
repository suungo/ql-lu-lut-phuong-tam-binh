import { BaseEntity } from 'src/common/entities/base.entity';
import type { Reflection } from 'src/modules/reflections/entities/reflection.entity';
import type { Resident } from 'src/modules/residents/entities/resident.entity';
import type { User } from 'src/modules/users/entities/user.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { DamageCategory } from '../enums/damage-category.enum';
import { DamageStatus } from '../enums/damage-status.enum';

@Entity('flood_damages')
export class FloodDamage extends BaseEntity {
  @Column({ type: 'enum', enum: DamageCategory })
  damageCategory: DamageCategory;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'decimal', default: 0 })
  estimatedValue: number;

  @Column({ type: 'int', default: 0 })
  injuredCount: number;

  @Column({ type: 'int', default: 0 })
  deathCount: number;

  @Column({
    type: 'enum',
    enum: DamageStatus,
    default: DamageStatus.PENDING,
  })
  status: DamageStatus;

  // 🔗 Many-to-One: Một phản ánh có thể có nhiều thiệt hại
  @Column({ name: 'reflection_id' })
  reflectionId: number;

  @ManyToOne(
    () => require('../../reflections/entities/reflection.entity').Reflection,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'reflection_id' })
  reflection: Reflection;

  // 🔗 Many-to-One: Một hộ dân có thể bị nhiều thiệt hại
  @Column({ name: 'household_id', nullable: true })
  householdId?: number;

  @ManyToOne(
    () => require('../../residents/entities/resident.entity').Resident,
    {
      onDelete: 'SET NULL',
      nullable: true,
    },
  )
  @JoinColumn({ name: 'household_id' })
  household?: Resident;

  // 🔗 Many-to-One: Cán bộ ghi nhận thiệt hại
  @Column({ name: 'created_by' })
  createdBy: number;

  @ManyToOne(() => require('../../users/entities/user.entity').User, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'created_by' })
  creator: User;

  // 🔗 Người kiểm duyệt (ADMIN/MANAGER/LEADER)
  @Column({ name: 'reviewed_by', nullable: true })
  reviewedBy?: number;

  @Column({ name: 'reviewed_at', type: 'timestamp', nullable: true })
  reviewedAt?: Date;
}
