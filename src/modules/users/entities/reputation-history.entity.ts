import { BaseEntity } from 'src/common/entities/base.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { User } from './user.entity';

@Entity('reputation_history')
export class ReputationHistory extends BaseEntity {
  @Column({ name: 'user_id' })
  userId: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column()
  amount: number; // e.g. -1, -2, +1

  @Column()
  reason: string; // e.g. "Bị AI từ chối", "Bị cán bộ từ chối", "Sự cố hoàn thành"

  @Column({ nullable: true, name: 'reflection_id' })
  reflectionId?: number;
}
