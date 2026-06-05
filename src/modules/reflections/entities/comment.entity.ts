import { BaseEntity } from 'src/common/entities/base.entity';
import { User } from 'src/modules/users/entities/user.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { Reflection } from './reflection.entity';

@Entity('comments')
export class Comment extends BaseEntity {
  @Column({ type: 'text' })
  content: string;

  @Column({ name: 'user_id' })
  userId: number;

  @ManyToOne(() => User, (user) => user.comments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'reflection_id' })
  reflectionId: number;

  @ManyToOne(() => Reflection, (reflection) => reflection.comments, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'reflection_id' })
  reflection: Reflection;

  @Column({ name: 'parent_id', nullable: true })
  parentId?: number; // Hỗ trợ reply comment

  @ManyToOne(() => Comment, (comment) => comment.replies, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'parent_id' })
  parent?: Comment;

  @OneToMany(() => Comment, (comment) => comment.parent)
  replies?: Comment[];
}
