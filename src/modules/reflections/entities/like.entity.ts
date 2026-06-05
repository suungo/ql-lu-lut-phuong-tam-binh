import { BaseEntity } from 'src/common/entities/base.entity';
import { User } from 'src/modules/users/entities/user.entity';
import { Column, Entity, JoinColumn, ManyToOne, Unique } from 'typeorm';
import { Reflection } from './reflection.entity';

@Entity('likes')
@Unique(['userId', 'reflectionId']) // 1 user chỉ like 1 lần cho 1 phản ánh
export class Like extends BaseEntity {
  @Column({ name: 'user_id' })
  userId: number;

  @ManyToOne(() => User, (user) => user.likes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'reflection_id' })
  reflectionId: number;

  @ManyToOne(() => Reflection, (reflection) => reflection.likes, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'reflection_id' })
  reflection: Reflection;
}
