import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateReflectionDto, UpdateReflectionDto } from './dto/reflection.dto';
import { Reflection } from './entities/reflection.entity';
import { ReflectionStatus } from './enums/reflection.enum';

import { RoleCode } from 'src/common/enums/role-code.enum';
import { DamageCategory } from '../flood-damages/enums/damage-category.enum';
import { FloodDamagesService } from '../flood-damages/floodDamages.service';
import { NotificationsService } from '../notifications/notifications.service';
import { ResidentsService } from '../residents/residents.service';
import { UsersService } from '../users/users.service';
import { VerificationType } from '../verifications/enums/verification.enum';
import { VerificationsService } from '../verifications/verifications.service';

@Injectable()
export class ReflectionsService {
  constructor(
    @InjectRepository(Reflection)
    private readonly repo: Repository<Reflection>,
    private readonly floodDamagesService: FloodDamagesService,
    private readonly notificationsService: NotificationsService,
    private readonly residentsService: ResidentsService,
    private readonly usersService: UsersService,
    private readonly verificationsService: VerificationsService,
  ) { }

  async create(dto: CreateReflectionDto, currentUser: any) {
    const userId = currentUser.id;
    const title = dto.title
    const content = dto.content

    const reflection = this.repo.create({ ...dto, userId, title, content, createdBy: userId });

    // Nếu là Quản lý phường (MANAGER) tạo thì trạng thái mặc định là Đã xử lý
    if (currentUser.roleCode === RoleCode.MANAGER) {
      reflection.status = ReflectionStatus.RESOLVED;
      reflection.response = 'Báo cáo được khởi tạo bởi Quản lý phường.';
      reflection.respondedAt = new Date();
    }

    const saved = await this.repo.save(reflection);

    // Thông báo cho Tình nguyện viên (LEADER) nếu người dân gửi phản ánh
    if (currentUser.roleCode === RoleCode.RESIDENT) {
      const leaders = await this.usersService.findByRoleCode(RoleCode.LEADER);
      for (const l of leaders) {
        await this.notificationsService.create({
          userId: l.id,
          title: 'Phản ánh mới cần xác minh',
          content: `Người dân đã gửi phản ánh mới: ${title}. Vui lòng xác minh thông tin.`,
          type: 'NEW_REFLECTION',
          referenceId: saved.id,
        });
      }

      // Tạo bản ghi xác thực (Verification)
      await this.verificationsService.create({
        title: `Phản ánh từ hộ dân: ${title}`,
        description: content,
        verificationType: VerificationType.REFLECTION,
        attachments: dto.imageUrl,
        referenceId: saved.id,
      }, userId);
    }

    return { statusCode: 200, message: 'Gửi phản ánh thành công', data: saved };
  }

  async findAll(page = 1, limit = 10, currentUser?: any, keyword?: string, status?: ReflectionStatus, isMap?: boolean) {
    const qb = this.repo.createQueryBuilder('r')
      .leftJoinAndSelect('r.user', 'user')
      .leftJoinAndSelect('user.role', 'role');

    if (isMap) {
      // Dashboard/Bản đồ: Tất cả role đều thấy phản ánh ĐANG XỬ LÝ và ĐÃ XỬ LÝ
      qb.andWhere('r.status IN (:...statuses)', { statuses: [ReflectionStatus.IN_PROGRESS, ReflectionStatus.RESOLVED] });
    } else {
      // Danh sách: Phân quyền xem dữ liệu
      if (currentUser?.roleCode === RoleCode.ADMIN) {
        // ADMIN xem toàn bộ - không filter
      } else if (currentUser?.roleCode === RoleCode.MANAGER) {
        // MANAGER chỉ xem phản ánh do mình tạo (dùng createdBy hoặc userId nếu data cũ)
        qb.andWhere('(r.createdBy = :createdBy OR (r.createdBy IS NULL AND r.userId = :userId))', { 
          createdBy: currentUser?.id,
          userId: currentUser?.id 
        });
      } else {
        // Các role khác (LEADER, STAFF, RESIDENT...) chỉ xem phản ánh của chính mình tạo
        qb.andWhere('r.userId = :userId', { userId: currentUser?.id });
      }

      if (status) qb.andWhere('r.status = :status', { status });
    }

    if (keyword) qb.andWhere('(r.title LIKE :kw OR r.content LIKE :kw)', { kw: `%${keyword}%` });
    qb.orderBy('r.createdAt', 'DESC').skip((page - 1) * limit).take(limit);
    const [data, total] = await qb.getManyAndCount();
    return { statusCode: 200, message: 'Thành công', data, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async findMyReflections(userId: number, page = 1, limit = 10) {
    const [data, total] = await this.repo.findAndCount({
      where: { userId },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { statusCode: 200, message: 'Thành công', data, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async findOne(id: number) {
    const r = await this.repo.findOne({ where: { id }, relations: ['user'] });
    if (!r) throw new NotFoundException('Không tìm thấy phản ánh');
    return { statusCode: 200, message: 'Thành công', data: r };
  }

  async update(id: number, dto: UpdateReflectionDto, userId: number) {
    const r = await this.repo.findOne({ where: { id } });
    if (!r) throw new NotFoundException('Không tìm thấy phản ánh');
    if (dto.title) { r.title = dto.title }
    if (dto.content) { r.content = dto.content; }
    if (dto.category) { r.category = dto.category; }
    if (dto.description) { r.description = dto.description; }
    if (dto.lat) { r.lat = dto.lat; }
    if (dto.lng) { r.lng = dto.lng; }
    if (dto.address) { r.address = dto.address; }
    if (dto.imageUrl) { r.imageUrl = dto.imageUrl; }
    if (dto.priority) { r.priority = dto.priority; }
    if (dto.typeOfIncident) { r.typeOfIncident = dto.typeOfIncident; }
    if (dto.response) {
      r.response = dto.response;
      r.respondedAt = new Date();
    }
    Object.assign(r, dto);
    return { statusCode: 200, message: 'Cập nhật thành công', data: await this.repo.save(r) };
  }

  async remove(id: number, currentUser?: any) {
    const r = await this.repo.findOne({ where: { id } });
    if (!r) throw new NotFoundException('Không tìm thấy phản ánh');

    // Chỉ ADMIN mới được xóa phản ánh đã hoàn thành (RESOLVED)
    const isAdmin = currentUser?.roleCode === RoleCode.ADMIN;
    if (r.status === ReflectionStatus.RESOLVED && !isAdmin) {
      throw new BadRequestException('Không thể xóa phản ánh đã hoàn thành');
    }

    await this.repo.softDelete(id);
    return { statusCode: 200, message: 'Xóa thành công' };
  }

  async updateStatus(id: number, status: ReflectionStatus, currentUser?: any) {
    const r = await this.repo.findOne({ where: { id } });
    if (!r) throw new NotFoundException('Không tìm thấy phản ánh');
    r.status = status;
    const updated = await this.repo.save(r);

    // 🆕 Tự động tạo FloodDamage khi phản ánh được đánh dấu "Đã xử lý"
    if (status === ReflectionStatus.RESOLVED) {
      // Lấy userId từ reflection hoặc currentUser
      const creatorId = r.userId || currentUser?.id || 1;

      // Xác định category dựa trên loại sự cố
      let damageCategory = DamageCategory.OTHER;
      if (r.category) {
        damageCategory = this.mapCategoryToDamageCategory(r.category);
      }

      // Tạo FloodDamage với thông tin cơ bản từ reflection
      await this.floodDamagesService.create(
        {
          damageCategory,
          description: `Thiệt hại từ sự cố: ${r.title}${r.description ? `\n${r.description}` : ''}`,
          estimatedValue: 0, // Người dùng cần cập nhật sau
          injuredCount: 0,
          deathCount: 0,
          reflectionId: r.id,
          householdId: undefined,
        },
        creatorId,
      );
    }

    // Thông báo cho cư dân xung quanh nếu được xác nhận (IN_PROGRESS) hoặc hoàn tất (RESOLVED)
    if (
      status === ReflectionStatus.IN_PROGRESS ||
      status === ReflectionStatus.RESOLVED
    ) {
      if (r.lat && r.lng) {
        const radius = 20; // 20 mét
        const nearbyResidents = await this.residentsService.findNearby(
          r.lat,
          r.lng,
          radius,
        );

        for (const res of nearbyResidents) {
          if (res.userId) {
            await this.notificationsService.create({
              userId: res.userId,
              title:
                status === ReflectionStatus.IN_PROGRESS
                  ? 'Sự cố gần bạn đang được xử lý'
                  : 'Sự cố gần bạn đã hoàn tất',
              content: `Phản ánh tại ${r.address || 'vị trí gần bạn'} đã được xác nhận và ${status === ReflectionStatus.IN_PROGRESS ? 'đang trong quá trình xử lý' : 'đã xử lý xong'}.`,
              type: 'NEARBY_REFLECTION',
              referenceId: r.id,
            });
          }
        }
      }
    }

    return { statusCode: 200, message: 'Cập nhật thành công', data: updated };
  }

  /**
   * Map category của Reflection sang DamageCategory
   */
  private mapCategoryToDamageCategory(reflectionCategory: string): DamageCategory {
    const categoryMap: Record<string, DamageCategory> = {
      'FLOOD': DamageCategory.PROPERTY,
      'LANDSLIDE': DamageCategory.PROPERTY,
      'STRUCTURAL_DAMAGE': DamageCategory.PROPERTY,
      'INFRASTRUCTURE': DamageCategory.PROPERTY,
      'ROAD_DAMAGE': DamageCategory.PROPERTY,
      'BRIDGE_DAMAGE': DamageCategory.PROPERTY,
      'ECONOMIC': DamageCategory.ECONOMIC,
      'HEALTH': DamageCategory.HEALTH,
      'FATALITY': DamageCategory.FATALITY,
      'OTHER': DamageCategory.OTHER,
    };

    return categoryMap[reflectionCategory] || DamageCategory.OTHER;
  }
}
