import { BaseEntity } from 'src/common/entities/base.entity';
import { Gender } from 'src/common/enums/gender.enum';
import { Conversation } from 'src/modules/chats/entities/conversation.entity';
import { Message } from 'src/modules/chats/entities/message.entity';
import type { FloodDamage } from 'src/modules/flood-damages/entities/flood-damage.entity';
import { Notification } from 'src/modules/notifications/entities/notification.entity';
import { Comment } from 'src/modules/reflections/entities/comment.entity';
import { Like } from 'src/modules/reflections/entities/like.entity';
import { Reflection } from 'src/modules/reflections/entities/reflection.entity';
import { Role } from 'src/modules/roles/entities/role.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { UserStatus } from '../enums/user-status.enum';
import { Device } from './device.entity';

@Entity('users')
export class User extends BaseEntity {
  @Column({ nullable: true })
  fullName: string;

  @Column({ nullable: true })
  email: string;

  @Column({ unique: true })
  phoneNumber: string;

  @Column({ nullable: true })
  password?: string;

  @Column({ type: 'enum', enum: Gender, default: Gender.MALE })
  gender: Gender;

  @Column({ nullable: true })
  dateBirth: Date;

  @Column({ nullable: true, length: 255 })
  address: string;

  @Column({ nullable: true })
  avatar?: string;

  @Column({ type: 'enum', enum: UserStatus, default: UserStatus.ACTIVE })
  status: UserStatus;

  @Column({ nullable: true, name: 'role_id' })
  roleId: number;

  @ManyToOne(() => Role, (role) => role.users)
  @JoinColumn({ name: 'role_id' })
  role: Role;

  @OneToMany(() => Notification, (n) => n.user)
  notifications: Notification[];

  @OneToMany(() => Message, (m) => m.sender)
  messages: Message[];

  @OneToMany(() => Conversation, (c) => c.creator)
  conversations: Conversation[];

  @OneToMany(() => Reflection, (r) => r.user)
  reflections: Reflection[];

  @OneToMany(() => Like, (l) => l.user)
  likes: Like[];

  @OneToMany(() => Comment, (c) => c.user)
  comments: Comment[];

  @OneToMany(() => Device, (d) => d.user)
  devices: Device[];

  // 🔗 One-to-Many: Cán bộ ghi nhận nhiều thiệt hại
  @OneToMany(
    () =>
      require('../../flood-damages/entities/flood-damage.entity').FloodDamage,
    (fd: FloodDamage) => fd.creator,
  )
  floodDamages: FloodDamage[];
}
