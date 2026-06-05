import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { RoleCode } from 'src/common/enums/role-code.enum';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly repo: Repository<User>,
  ) {}

  async findAll(page = 1, limit = 10, keyword?: string) {
    const where = keyword
      ? [
          { fullName: Like(`%${keyword}%`) },
          { phoneNumber: Like(`%${keyword}%`) },
        ]
      : {};
    const [data, total] = await this.repo.findAndCount({
      where,
      skip: (page - 1) * limit,
      take: limit,
      select: [
        'id',
        'fullName',
        'email',
        'phoneNumber',
        'gender',
        'status',
        'avatar',
        'createdAt',
      ],
      relations: ['role'],
      order: { createdAt: 'DESC' },
    });
    return {
      statusCode: 200,
      message: 'Thành công',
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: number) {
    const user = await this.repo.findOne({
      where: { id },
      select: [
        'id',
        'fullName',
        'email',
        'phoneNumber',
        'gender',
        'dateBirth',
        'address',
        'avatar',
        'status',
        'createdAt',
      ],
      relations: ['role'],
    });
    if (!user) throw new NotFoundException('Không tìm thấy người dùng');
    return { statusCode: 200, message: 'Thành công', data: user };
  }

  async updateProfile(id: number, dto: Partial<User>) {
    const user = await this.repo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('Không tìm thấy người dùng');
    const { password: _, ...safeDto } = dto as any;
    Object.assign(user, safeDto);
    const saved = await this.repo.save(user);
    const { password: _p, ...result } = saved;
    return { statusCode: 200, message: 'Cập nhật thành công', data: result };
  }

  async findByRoleCode(roleCode: RoleCode) {
    return await this.repo.find({
      where: { role: { roleCode } },
      relations: ['role'],
    });
  }

  async remove(id: number) {
    const user = await this.repo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('Không tìm thấy người dùng');
    await this.repo.softDelete(id);
    return { statusCode: 200, message: 'Xóa người dùng thành công' };
  }

  /**
   * Tìm các user theo role và sắp xếp theo khoảng cách gần nhất (dựa vào address là tạm).
   * TODO: Khi user có tọa độ realtime, sẽ tính khoảng cách chính xác hơn.
   */
  async findNearestByRole(
    roleCode: RoleCode,
    lat: number,
    lng: number,
  ): Promise<User[]> {
    const users = await this.repo.find({
      where: { role: { roleCode } },
      relations: ['role'],
    });
    // Trả về danh sách (có thể mở rộng thêm distance sort khi có lat/lng của user)
    return users;
  }

  /**
   * Tìm tất cả user theo nhiều role
   */
  async findByRoleCodes(roleCodes: RoleCode[]): Promise<User[]> {
    const users: User[] = [];
    for (const roleCode of roleCodes) {
      const found = await this.findByRoleCode(roleCode);
      users.push(...found);
    }
    return users;
  }
}
