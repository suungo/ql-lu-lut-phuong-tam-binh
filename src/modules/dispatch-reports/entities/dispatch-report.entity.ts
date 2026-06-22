import { BaseEntity } from 'src/common/entities/base.entity';
import { Reflection } from 'src/modules/reflections/entities/reflection.entity';
import { User } from 'src/modules/users/entities/user.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import {
  DispatchReportStatus,
  DispatchReportType,
} from '../enums/dispatch-report.enum';

@Entity('dispatch_reports')
export class DispatchReport extends BaseEntity {
  /** Mã biên bản: DR-{timestamp}-{random} */
  @Column()
  code: string;

  /** Loại điều chuyển */
  @Column({
    type: 'enum',
    enum: DispatchReportType,
  })
  type: DispatchReportType;

  /** Trạng thái biên bản */
  @Column({
    type: 'enum',
    enum: DispatchReportStatus,
    default: DispatchReportStatus.PENDING,
  })
  status: DispatchReportStatus;

  // ── LIÊN KẾT PHẢN ÁNH ──────────────────────────────────────────────

  /** ID phản ánh gốc */
  @Column({ name: 'reflection_id' })
  reflectionId: number;

  @ManyToOne(() => Reflection)
  @JoinColumn({ name: 'reflection_id' })
  reflection: Reflection;

  // ── NGƯỜI GIAO & NGƯỜI NHẬN ─────────────────────────────────────────

  /** Người tạo điều chuyển (MANAGER hoặc INSPECTOR) */
  @Column({ name: 'assigned_by' })
  assignedBy: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'assigned_by' })
  assigner: User;

  /** Người được chỉ định (INSPECTOR hoặc PATROL) */
  @Column({ name: 'assigned_to', nullable: true })
  assignedTo?: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'assigned_to' })
  assignee: User;

  @Column({ type: 'varchar', nullable: true, name: 'custom_handler' })
  customHandler?: string;

  // ── THỜI GIAN ───────────────────────────────────────────────────────

  /** Thời điểm tạo điều chuyển */
  @Column({ type: 'timestamp', name: 'assigned_at' })
  assignedAt: Date;

  /** Hạn xác nhận (assignedAt + 5 phút) */
  @Column({ type: 'timestamp', name: 'expired_at', nullable: true })
  expiredAt?: Date;

  /** Thời điểm người nhận xác nhận */
  @Column({ type: 'timestamp', nullable: true, name: 'accepted_at' })
  acceptedAt?: Date;

  /** Thời điểm hoàn thành */
  @Column({ type: 'timestamp', nullable: true, name: 'completed_at' })
  completedAt?: Date;

  /** Thời gian dự kiến hoàn thành */
  @Column({ type: 'timestamp', nullable: true, name: 'expected_time' })
  expectedTime?: Date;

  // ── NỘI DUNG BÁO CÁO ──────────────────────────────────────────────

  /** Tiêu đề biên bản */
  @Column({ type: 'text', nullable: true })
  title?: string;

  /** Mô tả chi tiết từ người giao */
  @Column({ type: 'text', nullable: true })
  description?: string;

  /** Ghi chú khi phân công */
  @Column({ type: 'text', nullable: true })
  note?: string;

  /** Nội dung báo cáo (người nhận cập nhật sau khi xử lý) */
  @Column({ type: 'text', nullable: true, name: 'report_content' })
  reportContent?: string;

  /** Trạng thái phản ánh mà người nhận cập nhật */
  @Column({ type: 'varchar', nullable: true, name: 'reflection_status_update' })
  reflectionStatusUpdate?: string;

  /** Hình ảnh đính kèm báo cáo */
  @Column({ type: 'json', nullable: true })
  attachments?: string[];

  /** Lý do từ chối hoặc hủy */
  @Column({ type: 'text', nullable: true, name: 'reject_reason' })
  rejectReason?: string;
}
