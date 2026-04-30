import { BaseEntity } from 'src/common/entities/base.entity';
import { Gender } from 'src/common/enums/gender.enum';
import { Column, Entity } from 'typeorm';
import {
  HumanResourcePosition,
  HumanResourceStatus,
} from '../enums/human-resource.enum';

@Entity('human_resources')
export class HumanResource extends BaseEntity {
  @Column()
  fullName: string;

  @Column({ unique: true })
  employeeCode: string;

  @Column({ unique: true })
  phoneNumber: string;

  @Column({ nullable: true })
  email?: string;

  @Column({ type: 'enum', enum: Gender, default: Gender.MALE })
  gender: Gender;

  @Column({ nullable: true })
  dateBirth?: Date;

  @Column({ nullable: true })
  address?: string;

  @Column({ nullable: true })
  avatar?: string;

  @Column({
    type: 'enum',
    enum: HumanResourcePosition,
    default: HumanResourcePosition.STAFF,
  })
  position: HumanResourcePosition;

  @Column({
    type: 'enum',
    enum: HumanResourceStatus,
  })
  status: HumanResourceStatus;

  @Column({ nullable: true })
  notes?: string;

  @Column({ nullable: true })
  userId?: number;
}
