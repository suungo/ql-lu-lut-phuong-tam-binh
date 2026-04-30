import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RoleCode } from 'src/common/enums/role-code.enum';
import { Role } from 'src/modules/roles/entities/role.entity';

const defaultRoles = [
  { roleCode: RoleCode.ADMIN, roleName: 'Quản trị viên', description: 'Toàn quyền hệ thống' },
  { roleCode: RoleCode.MANAGER, roleName: 'Quản lý', description: 'Quản lý hoạt động phường' },
  { roleCode: RoleCode.OFFICER, roleName: 'Cán bộ', description: 'Cán bộ quản lý phường' },
  { roleCode: RoleCode.LEADER, roleName: 'Tình nguyện viên', description: 'Tình nguyện viên khu phố' },
  { roleCode: RoleCode.STAFF, roleName: 'Nhân viên', description: 'Nhân viên y tế/vận hành' },
  { roleCode: RoleCode.RESIDENT, roleName: 'Cư dân', description: 'Cư dân sinh sống tại địa bàn' },
];

@Injectable()
export class RoleSeederService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepo: Repository<Role>,
  ) {}

  async seedRoles() {
    for (const role of defaultRoles) {
      const existing = await this.roleRepo.findOne({ where: { roleCode: role.roleCode } });
      if (!existing) {
        await this.roleRepo.save(this.roleRepo.create(role));
        console.log(`✅ Seeded role: ${role.roleName}`);
      }
    }
    console.log('✅ All roles seeded!');
  }
}
