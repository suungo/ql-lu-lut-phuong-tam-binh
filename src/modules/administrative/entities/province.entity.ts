import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity('provinces')
export class Province {
  @PrimaryColumn()
  code: number;

  @Column({ nullable: true })
  name: string;
}
// Force reload after database migration
