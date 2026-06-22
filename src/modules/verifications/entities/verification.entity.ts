import { BaseEntity } from 'src/common/entities/base.entity';
import { User } from 'src/modules/users/entities/user.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import {
  VerificationStatus,
  VerificationType,
} from '../enums/verification.enum';

@Entity('verifications')
export class Verification extends BaseEntity {
  @Column()
  code: string;

  @Column({ nullable: true })
  expiredAt: Date;

  @Column()
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({
    type: 'enum',
    enum: VerificationType,
    default: VerificationType.OTHER,
  })
  verificationType: VerificationType;

  @Column({
    type: 'enum',
    enum: VerificationStatus,
    default: VerificationStatus.PENDING,
  })
  status: VerificationStatus;

  @Column({ nullable: true, type: 'text' })
  reviewNote?: string;

  @Column({ nullable: true })
  reviewedAt?: Date;

  @Column({ nullable: true, name: 'reviewed_by' })
  reviewedBy?: number;

  @Column({ nullable: true, name: 'user_id' })
  user_id: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ nullable: true, type: 'json' })
  attachments?: string[];

  @Column({ nullable: true, name: 'reference_id' })
  referenceId?: number;

  @Column({ nullable: true })
  cccd?: string; // Số CCCD người dân khai khi đăng ký

  @Column({ nullable: true, default: null, name: 'is_matched_contact' })
  isMatchedContact?: boolean; // Có khớp danh sách liên hệ không
}
