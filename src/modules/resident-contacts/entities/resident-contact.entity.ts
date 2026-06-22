import { BaseEntity } from 'src/common/entities/base.entity';
import { Column, Entity, Index } from 'typeorm';

@Entity('resident_contacts')
export class ResidentContact extends BaseEntity {
  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  phoneNumber: string;

  @Index()
  @Column({ unique: true })
  cccd: string; // Số CCCD — khóa nối với bảng residents

  @Column({ nullable: true })
  address: string;
}
