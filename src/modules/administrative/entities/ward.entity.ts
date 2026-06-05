import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Province } from './province.entity';

@Entity('wards')
export class Ward {
  @PrimaryColumn()
  code: number;

  @Column()
  name: string;

  @Column({ name: 'province_code' })
  provinceCode: number;

  @ManyToOne(() => Province, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'province_code' })
  province: Province;
}
