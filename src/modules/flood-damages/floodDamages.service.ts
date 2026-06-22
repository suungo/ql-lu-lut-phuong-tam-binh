import { Injectable, NotFoundException } from '@nestjs/common';
import { RoleCode } from 'src/common/enums/role-code.enum';
import { NotificationsService } from '../notifications/notifications.service';
import { UsersService } from '../users/users.service';
import { CreateFloodDamageDto } from './dto/create-flood-damage.dto';
import { FilterFloodDamageDto } from './dto/filter-flood-damage.dto';
import { UpdateFloodDamageDto } from './dto/update-flood-damage.dto';
import { FloodDamage } from './entities/flood-damage.entity';
import { DamageStatus } from './enums/damage-status.enum';
import { FloodDamageRepository } from './repositories/flood-damage.repository';

import { Resident } from '../residents/entities/resident.entity';

@Injectable()
export class FloodDamagesService {
  constructor(
    private readonly floodDamageRepository: FloodDamageRepository,
    private readonly notificationsService: NotificationsService,
    private readonly usersService: UsersService,
  ) {}

  // ➕ Tạo thiệt hại mới
  async create(
    dto: CreateFloodDamageDto,
    userId: number,
  ): Promise<FloodDamage> {
    let householdId = dto.householdId;
    if (!householdId) {
      try {
        const residentRepo = this.floodDamageRepository.manager.getRepository(Resident);
        const resident = await residentRepo.findOne({ where: { userId } });
        if (resident) {
          householdId = resident.id;
        }
      } catch (err) {
        console.error('Lỗi khi truy vấn thông tin hộ dân để liên kết thiệt hại:', err);
      }
    }

    const floodDamage = this.floodDamageRepository.create({
      ...dto,
      householdId,
      createdBy: userId,
      injuredCount: dto.injuredCount || 0,
      deathCount: dto.deathCount || 0,
    });

    const saved = await this.floodDamageRepository.save(floodDamage);

    // 🔔 Gửi thông báo cho quản lý (ADMIN, MANAGER, LEADER)
    try {
      const creatorResponse = await this.usersService.findOne(userId);
      const creator = creatorResponse.data;

      // Lấy danh sách quản lý
      const managers = await this.usersService.findByRoleCode(RoleCode.MANAGER);
      const admins = await this.usersService.findByRoleCode(RoleCode.ADMIN);

      const allManagers = [...admins, ...managers];

      // Nội dung thông báo
      const title = 'Người dân cập nhật thiệt hại mới';
      const content = `${creator?.fullName || 'Người dân'} vừa cập nhật thiệt hại mới. Loại: ${dto.damageCategory}, Giá trị: ${dto.estimatedValue || 0} VND. Vui lòng kiểm tra và xác nhận.`;

      // Gửi thông báo cho từng quản lý
      for (const manager of allManagers) {
        await this.notificationsService.create({
          userId: manager.id,
          title,
          content,
          type: 'FLOOD_DAMAGE_NEW',
          referenceId: saved.id,
        });
      }
    } catch (error) {
      console.error('❌ Gửi thông báo thiệt hại thất bại:', error.message);
    }

    return saved;
  }

  // 📋 Lấy danh sách thiệt hại (có filter, pagination)
  async findAll(dto: FilterFloodDamageDto, currentUser?: any) {
    const {
      search,
      category,
      status,
      reflectionId,
      householdId,
      page = 1,
      limit = 10,
    } = dto;

    const query = this.floodDamageRepository
      .createQueryBuilder('fd')
      .leftJoinAndSelect('fd.reflection', 'reflection')
      .leftJoinAndSelect('fd.household', 'household')
      .leftJoinAndSelect('fd.creator', 'creator');

    // Nếu người dùng đăng nhập là cư dân (RESIDENT), chỉ cho phép lấy thiệt hại do chính họ tạo (createdBy),
    // hoặc thiệt hại liên quan đến phản ánh do họ gửi (reflection.userId),
    // hoặc thiệt hại liên quan đến hộ dân của họ (household.userId)
    if (currentUser && currentUser.roleCode === RoleCode.RESIDENT) {
      query.andWhere(
        '(fd.createdBy = :currentUserId OR reflection.userId = :currentUserId OR household.userId = :currentUserId)',
        { currentUserId: currentUser.id },
      );
    } else if (householdId) {
      // Filter theo householdId được yêu cầu (đối với admin/manager)
      query.andWhere('fd.householdId = :householdId', { householdId });
    }

    // Filter theo category
    if (category) {
      query.andWhere('fd.damageCategory = :category', { category });
    }

    // Filter theo status
    if (status) {
      query.andWhere('fd.status = :status', { status });
    }

    // Filter theo reflectionId
    if (reflectionId) {
      query.andWhere('fd.reflectionId = :reflectionId', { reflectionId });
    }

    // Search theo description
    if (search) {
      query.andWhere('fd.description ILIKE :search', { search: `%${search}%` });
    }

    // Pagination
    const skip = (page - 1) * limit;
    query.skip(skip).take(limit);

    // Sort by createdAt DESC
    query.orderBy('fd.createdAt', 'DESC');

    const [data, total] = await query.getManyAndCount();

    return {
      statusCode: 200,
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // 🔍 Chi tiết thiệt hại
  async findOne(id: number): Promise<FloodDamage> {
    const damage = await this.floodDamageRepository.findWithRelations(id);

    if (!damage) {
      throw new NotFoundException(`Không tìm thấy thiệt hại với ID ${id}`);
    }

    return damage;
  }

  // ✏️ Cập nhật thiệt hại
  async update(id: number, dto: UpdateFloodDamageDto) {
    const damage = await this.findOne(id);

    Object.assign(damage, dto);
    const updatedDamage = await this.floodDamageRepository.save(damage);
    return {
      statusCode: 200,
      message: 'Cập nhật thiệt hại thành công',
      data: updatedDamage,
    };
  }

  // 🗑️ Xóa thiệt hại
  async remove(id: number) {
    const damage = await this.findOne(id);
    await this.floodDamageRepository.remove(damage);
    const response = {
      statusCode: 200,
      message: 'Xóa thiệt hại thành công',
    };
    return response;
  }

  // 📊 Thống kê theo reflection
  async getStatsByReflection(reflectionId: number) {
    const damages =
      await this.floodDamageRepository.findByReflectionId(reflectionId);

    const totalValue = damages.reduce(
      (sum, d) => sum + Number(d.estimatedValue),
      0,
    );
    const totalInjured = damages.reduce((sum, d) => sum + d.injuredCount, 0);
    const totalDeaths = damages.reduce((sum, d) => sum + d.deathCount, 0);

    return {
      statusCode: 200,
      data: {
        totalDamages: damages.length,
        totalValue,
        totalInjured,
        totalDeaths,
        damages,
      },
    };
  }

  // Cập nhật trạng thái thiệt hại
  async updateStatus(id: number, status: DamageStatus, reviewerId?: number) {
    const damage = await this.findOne(id);
    const oldStatus = damage.status;
    damage.status = status;

    // Nếu có reviewerId thì cập nhật
    if (reviewerId) {
      damage.reviewedBy = reviewerId;
      damage.reviewedAt = new Date();
    }

    const updatedDamage = await this.floodDamageRepository.save(damage);

    // 🔔 Gửi thông báo cho người dân khi được xác nhận/từ chối
    if (
      oldStatus !== status &&
      [DamageStatus.APPROVED, DamageStatus.REJECTED].includes(status)
    ) {
      try {
        const reviewerResponse = reviewerId
          ? await this.usersService.findOne(reviewerId)
          : null;
        const reviewer = reviewerResponse?.data;

        const residentResponse = await this.usersService.findOne(
          damage.createdBy,
        );
        const resident = residentResponse?.data;

        if (resident) {
          const title =
            status === DamageStatus.APPROVED
              ? 'Thiệt hại đã được xác nhận'
              : 'Thiệt hại bị từ chối';
          const content =
            status === DamageStatus.APPROVED
              ? `Thiệt hại của bạn đã được ${reviewer?.fullName || 'quản lý'} xác nhận. Giá trị: ${damage.estimatedValue || 0} VND.`
              : `Thiệt hại của bạn đã bị ${reviewer?.fullName || 'quản lý'} từ chối. Vui lòng liên hệ để biết thêm chi tiết.`;

          await this.notificationsService.create({
            userId: resident.id,
            title,
            content,
            type: 'FLOOD_DAMAGE_UPDATE',
            referenceId: damage.id,
          });
        }
      } catch (error) {
        console.error(
          '❌ Gửi thông báo cập nhật thiệt hại thất bại:',
          error.message,
        );
      }
    }

    return {
      statusCode: 200,
      message: 'Cập nhật trạng thái thiệt hại thành công',
      data: updatedDamage,
    };
  }
}
