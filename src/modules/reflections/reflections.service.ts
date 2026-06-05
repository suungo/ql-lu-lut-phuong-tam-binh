import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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

@Injectable()
export class ReflectionsService {
  constructor(
    @InjectRepository(Reflection)
    private readonly repo: Repository<Reflection>,
    private readonly floodDamagesService: FloodDamagesService,
    private readonly notificationsService: NotificationsService,
    private readonly residentsService: ResidentsService,
    private readonly usersService: UsersService,
  ) {}

  // ══════════════════════════════════════════════════════════════════════
  // TẠO PHẢN ÁNH
  // ══════════════════════════════════════════════════════════════════════

  async create(dto: CreateReflectionDto, currentUser: any) {
    const userId = currentUser.id;
    const roleCode = currentUser.roleCode as RoleCode;

    const reflection = this.repo.create({
      ...dto,
      userId,
      createdBy: userId,
      status: ReflectionStatus.PENDING,
    });

    // MANAGER tạo phản ánh → tự động RESOLVED (dữ liệu có sẵn)
    if (roleCode === RoleCode.MANAGER || roleCode === RoleCode.ADMIN) {
      reflection.status = ReflectionStatus.RESOLVED;
      reflection.response = 'Phản ánh được khởi tạo bởi Quản lý phường.';
      reflection.respondedAt = new Date();
    }

    const saved = await this.repo.save(reflection);

    // Gửi thông báo theo role người tạo
    this.sendCreationNotifications(saved, roleCode, currentUser).catch((err) =>
      console.error('Lỗi gửi thông báo:', err),
    );

    return { statusCode: 200, message: 'Gửi phản ánh thành công', data: saved };
  }

  /**
   * Gửi thông báo sau khi tạo phản ánh dựa vào role
   */
  private async sendCreationNotifications(
    reflection: Reflection,
    roleCode: RoleCode,
    currentUser: any,
  ) {
    switch (roleCode) {
      case RoleCode.RESIDENT: {
        // Tìm OFFICER gần nhất dựa vào tọa độ
        if (reflection.lat && reflection.lng) {
          const nearbyOfficers = await this.usersService.findNearestByRole(
            RoleCode.OFFICER,
            reflection.lat,
            reflection.lng,
          );
          // Gửi thông báo cho 3 OFFICER gần nhất
          for (const officer of nearbyOfficers.slice(0, 3)) {
            await this.notificationsService.create({
              userId: officer.id,
              title: 'Phản ánh mới cần xác minh',
              content: `Người dân báo cáo sự cố tại: ${reflection.address || 'vị trí không xác định'}. Vui lòng đến xác minh thực địa.`,
              type: 'NEW_REFLECTION',
              referenceId: reflection.id,
            });
          }
        }
        break;
      }

      case RoleCode.OFFICER: {
        // OFFICER gửi → thông báo thẳng cho MANAGER và ADMIN
        const managers = await this.usersService.findByRoleCodes([
          RoleCode.MANAGER,
          RoleCode.ADMIN,
        ]);
        for (const m of managers) {
          await this.notificationsService.create({
            userId: m.id,
            title: 'Phản ánh mới từ Cán bộ tăng cường',
            content: `Cán bộ tăng cường vừa gửi phản ánh: "${reflection.title}". Vui lòng tiếp nhận và xử lý.`,
            type: 'NEW_REFLECTION',
            referenceId: reflection.id,
          });
        }
        break;
      }

      case RoleCode.PATROL: {
        // PATROL gửi → thông báo MANAGER và ADMIN
        const managers = await this.usersService.findByRoleCodes([
          RoleCode.MANAGER,
          RoleCode.ADMIN,
        ]);
        for (const m of managers) {
          await this.notificationsService.create({
            userId: m.id,
            title: 'Phản ánh mới từ Cán bộ tuần tra',
            content: `Cán bộ tuần tra vừa gửi phản ánh: "${reflection.title}". Vui lòng tiếp nhận và phân công.`,
            type: 'NEW_REFLECTION',
            referenceId: reflection.id,
          });
        }
        break;
      }

      case RoleCode.INSPECTOR: {
        // INSPECTOR gửi → thông báo MANAGER và ADMIN
        const managers = await this.usersService.findByRoleCodes([
          RoleCode.MANAGER,
          RoleCode.ADMIN,
        ]);
        for (const m of managers) {
          await this.notificationsService.create({
            userId: m.id,
            title: 'Phản ánh mới từ Hậu kiểm',
            content: `Hậu kiểm vừa gửi phản ánh: "${reflection.title}". Vui lòng tiếp nhận.`,
            type: 'NEW_REFLECTION',
            referenceId: reflection.id,
          });
        }
        break;
      }

      case RoleCode.MANAGER:
      case RoleCode.ADMIN: {
        // MANAGER/ADMIN tạo → thông báo tất cả role về phản ánh đã hoàn thành
        const allStaff = await this.usersService.findByRoleCodes([
          RoleCode.OFFICER,
          RoleCode.INSPECTOR,
          RoleCode.PATROL,
        ]);
        for (const u of allStaff) {
          await this.notificationsService.create({
            userId: u.id,
            title: 'Dữ liệu phản ánh mới',
            content: `Quản lý phường đã thêm phản ánh mới lên bản đồ: "${reflection.title}".`,
            type: 'NEW_REFLECTION',
            referenceId: reflection.id,
          });
        }
        break;
      }
    }
  }

  // ══════════════════════════════════════════════════════════════════════
  // BƯỚC 3: OFFICER XÁC MINH PHẢN ÁNH TỪ NGƯỜI DÂN
  // ══════════════════════════════════════════════════════════════════════

  async verifyByOfficer(
    id: number,
    dto: { confirmed: boolean; rejectReason?: string; note?: string },
    officer: any,
  ) {
    const r = await this.repo.findOne({ where: { id } });
    if (!r) throw new NotFoundException('Không tìm thấy phản ánh');
    if (r.status !== ReflectionStatus.PENDING) {
      throw new BadRequestException(
        'Phản ánh này không ở trạng thái chờ xác minh',
      );
    }

    r.officerId = officer.id;
    r.verifiedAt = new Date();

    if (!dto.confirmed) {
      // Từ chối
      r.status = ReflectionStatus.REJECTED;
      r.rejectReason = dto.rejectReason || 'Không có căn cứ xác nhận sự cố';
      r.response = dto.rejectReason;
      r.respondedAt = new Date();
      await this.repo.save(r);

      // Thông báo người dân bị từ chối
      if (r.userId) {
        await this.notificationsService.create({
          userId: r.userId,
          title: 'Phản ánh không được xác nhận',
          content: `Phản ánh "${r.title}" của bạn đã bị từ chối: ${r.rejectReason}`,
          type: 'REFLECTION_REJECTED',
          referenceId: r.id,
        });
      }
      return { statusCode: 200, message: 'Đã từ chối phản ánh', data: r };
    }

    // Xác nhận hợp lệ → chuyển VERIFIED, gửi lên MANAGER
    r.status = ReflectionStatus.VERIFIED;
    if (dto.note) r.response = dto.note;
    await this.repo.save(r);

    // Thông báo người dân đã xác minh
    if (r.userId) {
      await this.notificationsService.create({
        userId: r.userId,
        title: 'Phản ánh đã được xác minh',
        content: `Cán bộ tăng cường đã xác minh sự cố "${r.title}" tại hiện trường. Phản ánh đang được chuyển cho quản lý phường.`,
        type: 'REFLECTION_ACCEPTED',
        referenceId: r.id,
      });
    }

    // Thông báo MANAGER và ADMIN
    const managers = await this.usersService.findByRoleCodes([
      RoleCode.MANAGER,
      RoleCode.ADMIN,
    ]);
    for (const m of managers) {
      await this.notificationsService.create({
        userId: m.id,
        title: 'Phản ánh đã được cán bộ xác minh',
        content: `Cán bộ tăng cường đã xác minh phản ánh: "${r.title}". Vui lòng tạo yêu cầu xử lý cho Hậu kiểm.`,
        type: 'REFLECTION_VERIFIED',
        referenceId: r.id,
      });
    }

    return { statusCode: 200, message: 'Đã xác minh phản ánh', data: r };
  }

  // ══════════════════════════════════════════════════════════════════════
  // BƯỚC 4: MANAGER GIAO CHO INSPECTOR
  // ══════════════════════════════════════════════════════════════════════

  async assignToInspector(
    id: number,
    dto: { inspectorId: number; note?: string },
    manager: any,
  ) {
    const r = await this.repo.findOne({ where: { id } });
    if (!r) throw new NotFoundException('Không tìm thấy phản ánh');
    if (
      ![
        ReflectionStatus.VERIFIED,
        ReflectionStatus.PENDING,
        ReflectionStatus.ASSIGNED,
      ].includes(r.status)
    ) {
      throw new BadRequestException(
        'Phản ánh chưa được xác minh hoặc không phù hợp',
      );
    }

    if (
      r.status === ReflectionStatus.ASSIGNED &&
      r.inspectorId &&
      !r.inspectorAcceptedAt
    ) {
      if (r.assignedAt) {
        const diffMinutes =
          (new Date().getTime() - r.assignedAt.getTime()) / 60000;
        if (diffMinutes <= 5) {
          throw new BadRequestException(
            'Hậu kiểm đang trong thời gian xác nhận (5 phút). Không thể phân công lại.',
          );
        }
      }
    }

    r.status = ReflectionStatus.ASSIGNED;
    r.inspectorId = dto.inspectorId;
    r.managedBy = manager.id;
    r.assignedAt = new Date();
    r.inspectorAcceptedAt = null;
    if (dto.note) r.response = dto.note;
    await this.repo.save(r);

    // Thông báo INSPECTOR
    await this.notificationsService.create({
      userId: dto.inspectorId,
      title: 'Yêu cầu xử lý phản ánh mới',
      content: `Quản lý phường đã giao cho bạn phản ánh: "${r.title}" tại ${r.address || 'vị trí không xác định'}. Vui lòng điều cán bộ tuần tra xử lý.`,
      type: 'REFLECTION_ASSIGNED',
      referenceId: r.id,
    });

    return { statusCode: 200, message: 'Đã giao cho Hậu kiểm', data: r };
  }

  // ══════════════════════════════════════════════════════════════════════
  // BƯỚC 5: INSPECTOR ĐIỀU PATROL
  // ══════════════════════════════════════════════════════════════════════

  async dispatchPatrol(
    id: number,
    dto: { patrolId: number; estimatedHandleMinutes?: number; note?: string },
    inspector: any,
  ) {
    if (inspector.roleCode !== RoleCode.INSPECTOR) {
      throw new BadRequestException(
        'Chỉ có Hậu kiểm mới được phép điều động Tuần tra',
      );
    }

    const r = await this.repo.findOne({ where: { id } });
    if (!r) throw new NotFoundException('Không tìm thấy phản ánh');

    if (
      r.status === ReflectionStatus.IN_PROGRESS &&
      r.patrolId &&
      !r.patrolAcceptedAt
    ) {
      if (r.dispatchedAt) {
        const diffMinutes =
          (new Date().getTime() - r.dispatchedAt.getTime()) / 60000;
        if (diffMinutes <= 5) {
          throw new BadRequestException(
            'Cán bộ tuần tra đang trong thời gian xác nhận (5 phút). Không thể điều động lại.',
          );
        }
      }
    }

    r.status = ReflectionStatus.IN_PROGRESS;
    r.patrolId = dto.patrolId;
    r.inspectorId = inspector.id;
    r.estimatedHandleMinutes = dto.estimatedHandleMinutes;
    r.dispatchedAt = new Date();
    r.patrolAcceptedAt = null;
    if (dto.note) r.response = dto.note;
    await this.repo.save(r);

    // Thông báo PATROL
    await this.notificationsService.create({
      userId: dto.patrolId,
      title: 'Nhiệm vụ mới – Xử lý sự cố',
      content: `Bạn được điều đến xử lý sự cố: "${r.title}" tại ${r.address || 'vị trí không xác định'}. Thời gian dự kiến: ${dto.estimatedHandleMinutes || '?'} phút.`,
      type: 'PATROL_DISPATCHED',
      referenceId: r.id,
    });

    return { statusCode: 200, message: 'Đã điều cán bộ tuần tra', data: r };
  }

  // ══════════════════════════════════════════════════════════════════════
  // NHẬN VIỆC (INSPECTOR & PATROL)
  // ══════════════════════════════════════════════════════════════════════

  async acceptByInspector(id: number, inspector: any) {
    const r = await this.repo.findOne({ where: { id } });
    if (!r) throw new NotFoundException('Không tìm thấy phản ánh');
    if (r.inspectorId !== inspector.id)
      throw new BadRequestException('Phản ánh không được giao cho bạn');
    if (r.inspectorAcceptedAt)
      throw new BadRequestException('Bạn đã nhận việc rồi');

    r.inspectorAcceptedAt = new Date();
    await this.repo.save(r);
    return { statusCode: 200, message: 'Đã nhận việc thành công', data: r };
  }

  async acceptByPatrol(id: number, patrol: any) {
    const r = await this.repo.findOne({ where: { id } });
    if (!r) throw new NotFoundException('Không tìm thấy phản ánh');
    if (r.patrolId !== patrol.id)
      throw new BadRequestException('Phản ánh không được giao cho bạn');
    if (r.patrolAcceptedAt)
      throw new BadRequestException('Bạn đã nhận việc rồi');

    r.patrolAcceptedAt = new Date();
    await this.repo.save(r);
    return { statusCode: 200, message: 'Đã nhận việc thành công', data: r };
  }

  // ══════════════════════════════════════════════════════════════════════
  // BƯỚC 6: PATROL CẬP NHẬT VỊ TRÍ THỜI GIAN THỰC
  // ══════════════════════════════════════════════════════════════════════

  async updatePatrolLocation(
    id: number,
    dto: { lat: number; lng: number },
    patrol: any,
  ) {
    const r = await this.repo.findOne({ where: { id } });
    if (!r) throw new NotFoundException('Không tìm thấy phản ánh');
    if (r.patrolId !== patrol.id) {
      throw new BadRequestException(
        'Bạn không được phân công xử lý phản ánh này',
      );
    }

    r.patrolLat = dto.lat;
    r.patrolLng = dto.lng;
    await this.repo.save(r);

    return {
      statusCode: 200,
      message: 'Đã cập nhật vị trí',
      data: { patrolLat: r.patrolLat, patrolLng: r.patrolLng },
    };
  }

  // ══════════════════════════════════════════════════════════════════════
  // BƯỚC 8: PATROL NỘP BÁO CÁO KẾT QUẢ
  // ══════════════════════════════════════════════════════════════════════

  async submitPatrolReport(
    id: number,
    dto: {
      resolved: boolean;
      patrolReport: string;
      needReinforcement?: boolean;
      incompleteReason?: string;
    },
    patrol: any,
  ) {
    const r = await this.repo.findOne({ where: { id } });
    if (!r) throw new NotFoundException('Không tìm thấy phản ánh');
    if (r.patrolId !== patrol.id) {
      throw new BadRequestException(
        'Bạn không được phân công xử lý phản ánh này',
      );
    }

    r.patrolReport = dto.resolved
      ? dto.patrolReport
      : `[Chưa hoàn thành] ${dto.incompleteReason || ''}\n\n${dto.patrolReport}`;
    r.needReinforcement = dto.needReinforcement ?? false;
    r.status = dto.resolved
      ? ReflectionStatus.COMPLETED
      : ReflectionStatus.IN_PROGRESS;
    await this.repo.save(r);

    if (dto.resolved && r.inspectorId) {
      // Thông báo INSPECTOR cần xác nhận
      await this.notificationsService.create({
        userId: r.inspectorId,
        title: 'Tuần tra báo cáo hoàn thành sự cố',
        content: `Cán bộ tuần tra đã xử lý xong sự cố "${r.title}". Vui lòng kiểm tra và làm báo cáo gửi Quản lý phường.`,
        type: 'PATROL_COMPLETED',
        referenceId: r.id,
      });
    } else if (!dto.resolved && r.inspectorId) {
      // Thông báo INSPECTOR tuần tra chưa xong
      await this.notificationsService.create({
        userId: r.inspectorId,
        title: 'Cập nhật trạng thái xử lý sự cố',
        content: `Cán bộ tuần tra gửi cập nhật sự cố "${r.title}": ${dto.incompleteReason || 'Chưa hoàn thành'}. Cần tiếp viện: ${dto.needReinforcement ? 'Có' : 'Không'}.`,
        type: 'PATROL_UPDATE',
        referenceId: r.id,
      });
    }

    return { statusCode: 200, message: 'Đã nộp báo cáo', data: r };
  }

  // ══════════════════════════════════════════════════════════════════════
  // BƯỚC 9: INSPECTOR XÁC NHẬN VÀ GỬI BÁO CÁO LÊN MANAGER
  // ══════════════════════════════════════════════════════════════════════

  async inspectorConfirm(id: number, dto: { note?: string }, inspector: any) {
    const r = await this.repo.findOne({ where: { id } });
    if (!r) throw new NotFoundException('Không tìm thấy phản ánh');
    if (r.status !== ReflectionStatus.COMPLETED) {
      throw new BadRequestException(
        'Phản ánh chưa được tuần tra báo cáo hoàn thành',
      );
    }

    r.status = ReflectionStatus.RESOLVED;
    r.respondedAt = new Date();
    if (dto.note) r.response = `[Hậu kiểm xác nhận]: ${dto.note}`;
    await this.repo.save(r);

    // Tự động tạo FloodDamage
    await this.createFloodDamageFromReflection(r, inspector.id);

    // Thông báo MANAGER
    if (r.managedBy) {
      await this.notificationsService.create({
        userId: r.managedBy,
        title: 'Báo cáo hoàn thành sự cố từ Hậu kiểm',
        content: `Hậu kiểm xác nhận sự cố "${r.title}" đã được xử lý hoàn thành. Vui lòng xem báo cáo để đóng phản ánh.`,
        type: 'REFLECTION_COMPLETED',
        referenceId: r.id,
      });
    }

    // Thông báo người dân và cán bộ tăng cường
    if (r.userId) {
      await this.notificationsService.create({
        userId: r.userId,
        title: 'Sự cố của bạn đã được xử lý',
        content: `Sự cố "${r.title}" tại ${r.address || 'khu vực bạn báo cáo'} đã được khắc phục hoàn toàn. Cảm ơn bạn đã thông báo!`,
        type: 'REFLECTION_RESOLVED',
        referenceId: r.id,
      });
    }
    if (r.officerId) {
      await this.notificationsService.create({
        userId: r.officerId,
        title: 'Sự cố đã được xử lý hoàn thành',
        content: `Sự cố "${r.title}" mà bạn đã xác minh đã được khắc phục. Thông tin sẽ được hiển thị trên bản đồ.`,
        type: 'REFLECTION_RESOLVED',
        referenceId: r.id,
      });
    }

    // Thông báo các cư dân xung quanh
    await this.notifyNearbyResidents(r);

    return {
      statusCode: 200,
      message: 'Đã xác nhận hoàn thành và gửi báo cáo',
      data: r,
    };
  }

  // ══════════════════════════════════════════════════════════════════════
  // HELPER METHODS
  // ══════════════════════════════════════════════════════════════════════

  private async createFloodDamageFromReflection(
    r: Reflection,
    creatorId: number,
  ) {
    try {
      const damageCategory = this.mapCategoryToDamageCategory(r.category);
      await this.floodDamagesService.create(
        {
          damageCategory,
          description: `Thiệt hại từ sự cố: ${r.title}${r.description ? `\n${r.description}` : ''}`,
          estimatedValue: 0,
          injuredCount: 0,
          deathCount: 0,
          reflectionId: r.id,
          householdId: undefined,
        },
        creatorId,
      );
    } catch (err) {
      console.error('Lỗi tạo FloodDamage từ phản ánh:', err);
    }
  }

  private async notifyNearbyResidents(r: Reflection) {
    if (!r.lat || !r.lng) return;
    const nearbyResidents = await this.residentsService.findNearby(
      r.lat,
      r.lng,
      500,
    );
    for (const res of nearbyResidents) {
      if (res.userId) {
        await this.notificationsService.create({
          userId: res.userId,
          title: 'Sự cố gần bạn đã được khắc phục',
          content: `Sự cố tại ${r.address || 'khu vực gần bạn'} đã được xử lý hoàn toàn.`,
          type: 'NEARBY_REFLECTION',
          referenceId: r.id,
        });
      }
    }
  }

  // ══════════════════════════════════════════════════════════════════════
  // CRUD METHODS
  // ══════════════════════════════════════════════════════════════════════

  async findAll(
    page = 1,
    limit = 10,
    currentUser?: any,
    keyword?: string,
    status?: ReflectionStatus,
    isMap?: boolean,
  ) {
    const qb = this.repo
      .createQueryBuilder('r')
      .leftJoinAndSelect('r.user', 'user')
      .leftJoinAndSelect('user.role', 'role');

    if (isMap) {
      // Bản đồ: hiển thị phản ánh đang xử lý và đã hoàn thành
      qb.andWhere('r.status IN (:...statuses)', {
        statuses: [
          ReflectionStatus.IN_PROGRESS,
          ReflectionStatus.RESOLVED,
          ReflectionStatus.ASSIGNED,
        ],
      });
    } else {
      const roleCode = currentUser?.roleCode;
      if (roleCode === RoleCode.ADMIN || roleCode === RoleCode.MANAGER) {
        // ADMIN và MANAGER xem toàn bộ
      } else if (roleCode === RoleCode.OFFICER) {
        // OFFICER xem phản ánh PENDING (cần xác minh) hoặc do mình đã xác minh, hoặc do mình tự tạo
        qb.andWhere(
          '(r.status = :pendingStatus OR r.officerId = :uid OR r.userId = :uid)',
          {
            pendingStatus: ReflectionStatus.PENDING,
            uid: currentUser?.id,
          },
        );
      } else if (roleCode === RoleCode.INSPECTOR) {
        // INSPECTOR xem phản ánh được giao cho mình
        qb.andWhere('r.inspectorId = :uid', { uid: currentUser?.id });
      } else if (roleCode === RoleCode.PATROL) {
        // PATROL xem phản ánh được điều cho mình
        qb.andWhere('r.patrolId = :uid', { uid: currentUser?.id });
      } else {
        // RESIDENT xem phản ánh của chính mình
        qb.andWhere('r.userId = :uid', { uid: currentUser?.id });
      }

      if (status) qb.andWhere('r.status = :status', { status });
    }

    if (keyword)
      qb.andWhere('(r.title LIKE :kw OR r.content LIKE :kw)', {
        kw: `%${keyword}%`,
      });
    qb.orderBy('r.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);
    const [data, total] = await qb.getManyAndCount();
    return {
      statusCode: 200,
      message: 'Thành công',
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findMyReflections(userId: number, page = 1, limit = 10) {
    const [data, total] = await this.repo.findAndCount({
      where: { userId },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return {
      statusCode: 200,
      message: 'Thành công',
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: number) {
    const r = await this.repo.findOne({ where: { id }, relations: ['user'] });
    if (!r) throw new NotFoundException('Không tìm thấy phản ánh');
    return { statusCode: 200, message: 'Thành công', data: r };
  }

  async update(id: number, dto: UpdateReflectionDto, userId: number) {
    const r = await this.repo.findOne({ where: { id } });
    if (!r) throw new NotFoundException('Không tìm thấy phản ánh');
    Object.assign(r, dto);
    return {
      statusCode: 200,
      message: 'Cập nhật thành công',
      data: await this.repo.save(r),
    };
  }

  async remove(id: number, currentUser?: any) {
    const r = await this.repo.findOne({ where: { id } });
    if (!r) throw new NotFoundException('Không tìm thấy phản ánh');
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
    return { statusCode: 200, message: 'Cập nhật thành công', data: updated };
  }

  private mapCategoryToDamageCategory(
    reflectionCategory: string,
  ): DamageCategory {
    const categoryMap: Record<string, DamageCategory> = {
      FLOOD: DamageCategory.PROPERTY,
      LANDSLIDE: DamageCategory.PROPERTY,
      STRUCTURAL_DAMAGE: DamageCategory.PROPERTY,
      INFRASTRUCTURE: DamageCategory.PROPERTY,
      ROAD_DAMAGE: DamageCategory.PROPERTY,
      BRIDGE_DAMAGE: DamageCategory.PROPERTY,
      ECONOMIC: DamageCategory.ECONOMIC,
      HEALTH: DamageCategory.HEALTH,
      FATALITY: DamageCategory.FATALITY,
      OTHER: DamageCategory.OTHER,
    };
    return categoryMap[reflectionCategory] || DamageCategory.OTHER;
  }
}
