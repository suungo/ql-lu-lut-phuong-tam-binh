import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from './entities/role.entity';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {}

  findAll() {
    return this.roleRepository.find();
  }

  async findByCode(roleCode: string) {
    const role = await this.roleRepository.findOne({
      where: { roleCode: roleCode as any },
    });
    if (!role) throw new NotFoundException(`Không tìm thấy role: ${roleCode}`);
    return role;
  }
}
