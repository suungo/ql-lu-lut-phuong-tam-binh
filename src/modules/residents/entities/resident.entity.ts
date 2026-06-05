import { BaseEntity } from 'src/common/entities/base.entity';
import type { FloodDamage } from 'src/modules/flood-damages/entities/flood-damage.entity';
import { Column, Entity, OneToMany } from 'typeorm';
import {
  HasBusiness,
  HasChildren,
  HasElderly,
  HasPregnant,
  HasSick,
  HouseType,
} from '../enums/resident.enum';

@Entity('residents')
export class Resident extends BaseEntity {
  @Column({ default: '' })
  residentCode: string; // Mã dân cư

  @Column({ default: '' })
  fullName: string; // Tên chủ hộ

  @Column({ nullable: true })
  phoneNumber?: string; // Số điện thoại

  @Column({ nullable: true })
  email?: string; // Email

  @Column({ nullable: true })
  address: string; // Địa chỉ

  @Column({ type: 'decimal', precision: 10, scale: 6, nullable: true })
  latitude: number; // Vĩ độ

  @Column({ type: 'decimal', precision: 10, scale: 6, nullable: true })
  longitude: number; // Kinh độ

  @Column({ nullable: true })
  numberOfMembers: number; // Số thành viên trong hộ

  @Column({ nullable: true })
  hasElderly: HasElderly; // Có người già

  @Column({ nullable: true })
  hasChildren: HasChildren; // Có trẻ em

  @Column({ nullable: true })
  hasPregnantWomen: HasPregnant; // Có phụ nữ mang thai

  @Column({ nullable: true })
  hasChronicDisease: HasSick; // Có người bị bệnh nền

  @Column({ nullable: true })
  houseType: HouseType; // Loại nhà

  @Column({ nullable: true })
  numberOfFloors: number; // Số tầng

  @Column({ nullable: true })
  hasBusiness: HasBusiness; // Có kinh doanh

  @Column({ nullable: true, name: 'user_id' })
  userId?: number; // ID người dùng

  // 🔗 One-to-Many: Một hộ dân có thể bị nhiều thiệt hại
  @OneToMany(
    () =>
      require('../../flood-damages/entities/flood-damage.entity').FloodDamage,
    (fd: FloodDamage) => fd.household,
  )
  floodDamages: FloodDamage[];
}
