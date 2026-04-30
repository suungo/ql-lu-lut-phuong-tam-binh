import { BaseEntity } from 'src/common/entities/base.entity';
import type { FloodDamage } from 'src/modules/flood-damages/entities/flood-damage.entity';
import { User } from 'src/modules/users/entities/user.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { Category, EventType, Priority, ReflectionStatus } from '../enums/reflection.enum';
import { Comment } from './comment.entity';
import { Like } from './like.entity';

@Entity('reflections')
export class Reflection extends BaseEntity {
  @Column({ nullable: true })
  title?: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({
    type: 'enum',
    enum: Category,
    default: Category.OTHER,
  })
  category: Category;

  @Column({
    type: 'enum',
    enum: ReflectionStatus,
    default: ReflectionStatus.PENDING,
  })
  status: ReflectionStatus;

  @Column({
    type: 'enum',
    enum: Priority,
    default: Priority.LOW,
  })
  priority: Priority;

  @Column({
    type: 'enum',
    enum: EventType,
    default: EventType.OTHER,
  })
  typeOfIncident: EventType;

  @Column({ type: 'float', nullable: true })
  lat?: number;

  @Column({ type: 'float', nullable: true })
  lng?: number;

  @Column({ type: 'text', nullable: true })
  address?: string;

  @Column({ nullable: true, name: 'user_id' })
  userId: number;

  @ManyToOne(() => User, (user) => user.reflections)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'json', nullable: true })
  imageUrl?: string[];

  @Column({ type: 'text', nullable: true })
  response?: string;

  @Column({ type: 'timestamp', nullable: true })
  respondedAt?: Date;

  @Column({ nullable: true, name: 'managed_by' })
  managedBy?: number;

  @OneToMany(() => Like, (l) => l.reflection)
  likes: Like[];

  @OneToMany(() => Comment, (c) => c.reflection)
  comments: Comment[];

  @OneToMany(() => require('../../flood-damages/entities/flood-damage.entity').FloodDamage, (fd: FloodDamage) => fd.reflection)
  floodDamages: FloodDamage[];
}
