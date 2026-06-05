import { BaseEntity } from 'src/common/entities/base.entity';
import type { FloodDamage } from 'src/modules/flood-damages/entities/flood-damage.entity';
import { User } from 'src/modules/users/entities/user.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import {
  Category,
  EventType,
  Priority,
  ReflectionStatus,
} from '../enums/reflection.enum';
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

  // ── WORKFLOW FIELDS ──────────────────────────────────────────────────

  /** ID cán bộ tăng cường xác minh (OFFICER) */
  @Column({ nullable: true, name: 'officer_id' })
  officerId?: number;

  /** ID hậu kiểm phụ trách (INSPECTOR) */
  @Column({ nullable: true, name: 'inspector_id' })
  inspectorId?: number;

  /** ID cán bộ tuần tra được điều (PATROL) */
  @Column({ nullable: true, name: 'patrol_id' })
  patrolId?: number;

  /** Lý do từ chối (OFFICER điền khi reject) */
  @Column({ type: 'text', nullable: true, name: 'reject_reason' })
  rejectReason?: string;

  /** Báo cáo tình trạng của PATROL sau khi đến hiện trường */
  @Column({ type: 'text', nullable: true, name: 'patrol_report' })
  patrolReport?: string;

  /** Cần tiếp viện không (PATROL báo cáo) */
  @Column({ default: false, name: 'need_reinforcement' })
  needReinforcement: boolean;

  /** Thời gian dự kiến xử lý (phút) */
  @Column({ nullable: true, name: 'estimated_handle_minutes' })
  estimatedHandleMinutes?: number;

  /** Vị trí hiện tại của PATROL (lat) */
  @Column({ type: 'float', nullable: true, name: 'patrol_lat' })
  patrolLat?: number;

  /** Vị trí hiện tại của PATROL (lng) */
  @Column({ type: 'float', nullable: true, name: 'patrol_lng' })
  patrolLng?: number;

  /** Thời điểm OFFICER xác minh */
  @Column({ type: 'timestamp', nullable: true, name: 'verified_at' })
  verifiedAt?: Date;

  /** Thời điểm PATROL được điều động */
  @Column({ type: 'timestamp', nullable: true, name: 'dispatched_at' })
  dispatchedAt?: Date;

  /** Thời điểm MANAGER giao cho INSPECTOR */
  @Column({ type: 'timestamp', nullable: true, name: 'assigned_at' })
  assignedAt?: Date;

  /** Thời điểm INSPECTOR bấm nhận việc */
  @Column({ type: 'timestamp', nullable: true, name: 'inspector_accepted_at' })
  inspectorAcceptedAt?: Date;

  /** Thời điểm PATROL bấm nhận việc */
  @Column({ type: 'timestamp', nullable: true, name: 'patrol_accepted_at' })
  patrolAcceptedAt?: Date;

  @OneToMany(() => Like, (l) => l.reflection)
  likes: Like[];

  @OneToMany(() => Comment, (c) => c.reflection)
  comments: Comment[];

  @OneToMany(
    () =>
      require('../../flood-damages/entities/flood-damage.entity').FloodDamage,
    (fd: FloodDamage) => fd.reflection,
  )
  floodDamages: FloodDamage[];
}
