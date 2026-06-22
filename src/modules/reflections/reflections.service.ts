import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual } from 'typeorm';
import { CreateReflectionDto, UpdateReflectionDto } from './dto/reflection.dto';
import { Reflection } from './entities/reflection.entity';
import { ReflectionStatus } from './enums/reflection.enum';

import { RoleCode } from 'src/common/enums/role-code.enum';
import { DamageCategory } from '../flood-damages/enums/damage-category.enum';
import { FloodDamagesService } from '../flood-damages/floodDamages.service';
import { NotificationsService } from '../notifications/notifications.service';
import { ResidentsService } from '../residents/residents.service';
import { UsersService } from '../users/users.service';
import { OllamaService } from '../ollama/ollama.service';
import { DispatchReport } from '../dispatch-reports/entities/dispatch-report.entity';
import { DispatchReportStatus } from '../dispatch-reports/enums/dispatch-report.enum';
import { User } from '../users/entities/user.entity';
import { HumanResource } from '../human-resources/entities/human-resource.entity';

@Injectable()
export class ReflectionsService {
  constructor(
    @InjectRepository(Reflection)
    private readonly repo: Repository<Reflection>,
    @InjectRepository(DispatchReport)
    private readonly dispatchReportRepo: Repository<DispatchReport>,
    private readonly floodDamagesService: FloodDamagesService,
    private readonly notificationsService: NotificationsService,
    private readonly residentsService: ResidentsService,
    private readonly usersService: UsersService,
    private readonly ollamaService: OllamaService,
  ) {}

  // ══════════════════════════════════════════════════════════════════════
  // TẠO PHẢN ÁNH
  // ══════════════════════════════════════════════════════════════════════

  async create(dto: CreateReflectionDto, currentUser: any) {
    const userId = currentUser.id;
    const roleCode = currentUser.roleCode as RoleCode;

    // Kiểm tra điểm uy tín và chống spam đối với người dân
    if (roleCode === RoleCode.RESIDENT) {
      // 1. Chặn spam: Nếu gửi 5 phản ánh trong vòng 5 phút, chặn 15 phút từ lúc gửi tin thứ 5
      const lastReflections = await this.repo.find({
        where: { userId },
        order: { createdAt: 'DESC' },
        take: 5,
      });

      if (lastReflections.length === 5) {
        const oldestOfFive = lastReflections[4];
        const newestOfFive = lastReflections[0];
        
        // Kiểm tra xem 5 phản ánh gần nhất có được tạo trong vòng 5 phút hay không
        const diffMs = newestOfFive.createdAt.getTime() - oldestOfFive.createdAt.getTime();
        const fiveMinutesInMs = 5 * 60 * 1000;
        
        if (diffMs <= fiveMinutesInMs) {
          // Tính thời gian hết hạn chặn (15 phút kể từ phản ánh thứ 5)
          const blockedUntil = new Date(newestOfFive.createdAt.getTime() + 15 * 60 * 1000);
          const now = new Date();
          
          if (now < blockedUntil) {
            const remainingMinutes = Math.ceil((blockedUntil.getTime() - now.getTime()) / (60 * 1000));
            throw new ForbiddenException(
              `Bạn đã gửi quá nhiều phản ánh trong thời gian ngắn (5 tin trong 5 phút). Vui lòng thử lại sau ${remainingMinutes} phút.`,
            );
          }
        }
      }

      // 2. Kiểm tra điểm uy tín
      const userResult = await this.usersService.findOne(userId);
      if (userResult?.data?.reputationPoints === 0) {
        throw new ForbiddenException(
          'Tài khoản của bạn tạm thời bị khóa chức năng gửi phản ánh do điểm uy tín bằng 0.',
        );
      }
    }

    let reflection: Reflection;

    if (dto.originalReflectionId && (roleCode === RoleCode.MANAGER || roleCode === RoleCode.ADMIN)) {
      const originalReflection = await this.repo.findOne({ where: { id: dto.originalReflectionId } });
      if (!originalReflection) {
        throw new NotFoundException('Không tìm thấy phản ánh gốc');
      }
      originalReflection.isPublishedOnMap = true;
      originalReflection.publishedAt = new Date();
      originalReflection.managedBy = userId;
      originalReflection.status = ReflectionStatus.RESOLVED;
      if (!originalReflection.response) {
        originalReflection.response = 'Phản ánh đã được xử lý và công khai lên bản đồ bởi Quản lý phường.';
        originalReflection.respondedAt = new Date();
      }
      reflection = originalReflection;
    } else {
      reflection = this.repo.create({
        ...dto,
        userId,
        createdBy: userId,
        status: ReflectionStatus.PENDING,
      });

      // MANAGER tạo phản ánh → tự động RESOLVED (dữ liệu có sẵn)
      if (roleCode === RoleCode.MANAGER || roleCode === RoleCode.ADMIN) {
        reflection.status = ReflectionStatus.RESOLVED;
        reflection.response = dto.isPublishedOnMap
          ? 'Phản ánh đã được xử lý và công khai lên bản đồ bởi Quản lý phường.'
          : 'Phản ánh được khởi tạo bởi Quản lý phường.';
        reflection.respondedAt = new Date();
        if (dto.isPublishedOnMap) {
          reflection.isPublishedOnMap = true;
          reflection.publishedAt = new Date();
        }
      }
    }

    const saved = await this.repo.save(reflection);

    // Xác minh bằng AI chạy ngầm đối với phản ánh từ NGƯỜI DÂN
    if (roleCode === RoleCode.RESIDENT) {
      // Chạy ngầm không dùng await
      this.processResidentReflectionAsync(saved.id, dto, currentUser).catch((err) =>
        console.error('Lỗi khi chạy AI ngầm:', err),
      );
    } else {
      // Gửi thông báo theo role người tạo (trừ RESIDENT vì RESIDENT sẽ gửi trong processResidentReflectionAsync)
      this.sendCreationNotifications(saved, roleCode, currentUser).catch((err) =>
        console.error('Lỗi gửi thông báo:', err),
      );
    }

    return {
      statusCode: 200,
      message: 'Gửi phản ánh thành công',
      data: saved,
    };
  }

  /**
   * Xử lý kiểm duyệt AI ngầm cho phản ánh của người dân
   */
  private async processResidentReflectionAsync(
    reflectionId: number,
    dto: CreateReflectionDto,
    currentUser: any,
  ) {
    try {
      const reflection = await this.repo.findOne({ where: { id: reflectionId } });
      if (!reflection) return;

      let nearbyReportsContext = '';
      if (dto.lat && dto.lng) {
        const nearbyReports = await this.findNearbyActiveReflections(dto.lat, dto.lng);
        // Loại trừ chính phản ánh hiện tại ra khỏi danh sách
        const otherNearbyReports = nearbyReports.filter((r) => r.id !== reflectionId);
        if (otherNearbyReports.length > 0) {
          nearbyReportsContext = otherNearbyReports
            .map(
              (r) =>
                `- ID: ${r.id}, Tiêu đề: "${r.title}", Nội dung: "${r.content}", Địa chỉ: "${r.address || 'vị trí gần đó'}"`,
            )
            .join('\n');
        }
      }

      const aiResult = await this.ollamaService.analyzeReflection(
        dto.title,
        dto.content,
        dto.description,
        nearbyReportsContext || undefined,
      );

      if (aiResult.isSpam || aiResult.isSensitive || !aiResult.isValid) {
        reflection.status = ReflectionStatus.REJECTED;
        reflection.rejectReason = `[Kiểm duyệt AI]: ${aiResult.reason || 'Nội dung phản ánh được xác định là không phù hợp hoặc spam.'}`;
        reflection.response = reflection.rejectReason;
        reflection.respondedAt = new Date();

        await this.repo.save(reflection);

        if (reflection.userId) {
          await this.usersService
            .adjustReputation(
              reflection.userId,
              -1,
              'Bị hệ thống AI từ chối do nội dung không phù hợp hoặc spam',
              reflection.id,
            )
            .catch((err) => console.error('Lỗi trừ điểm uy tín AI:', err));
        }
      }

      // Gửi thông báo (thành công hoặc từ chối)
      await this.sendCreationNotifications(reflection, RoleCode.RESIDENT, currentUser);
    } catch (err) {
      console.error('Lỗi khi xử lý AI ngầm:', err);
      // Nếu lỗi AI, vẫn giữ nguyên PENDING và báo thành công
      const reflection = await this.repo.findOne({ where: { id: reflectionId } });
      if (reflection) {
        await this.sendCreationNotifications(reflection, RoleCode.RESIDENT, currentUser);
      }
    }
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
        // Nếu bị AI từ chối -> Gửi thông báo từ chối trực tiếp cho người dân
        if (reflection.status === ReflectionStatus.REJECTED) {
          if (reflection.userId) {
            await this.notificationsService.create({
              userId: reflection.userId,
              title: 'Phản ánh bị từ chối tự động',
              content:
                reflection.rejectReason ||
                'Nội dung phản ánh không phù hợp hoặc là spam.',
              type: 'REFLECTION_REJECTED',
              referenceId: reflection.id,
            });
          }
          break;
        }

        // Nếu xác minh AI thành công -> Gửi thông báo gửi thành công cho người dân
        if (reflection.userId) {
          await this.notificationsService.create({
            userId: reflection.userId,
            title: 'Gửi phản ánh thành công',
            content: `Phản ánh "${reflection.title}" đã được ghi nhận và đang chờ Cán bộ tăng cường đến xác minh thực địa.`,
            type: 'NEW_REFLECTION',
            referenceId: reflection.id,
          });
        }

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
      if (!dto.rejectReason || !dto.rejectReason.trim()) {
        throw new BadRequestException('Vui lòng nhập lý do từ chối phản ánh');
      }
      r.status = ReflectionStatus.REJECTED;
      r.rejectReason = dto.rejectReason;
      r.response = dto.rejectReason;
      r.respondedAt = new Date();
      await this.repo.save(r);

      if (r.userId) {
        await this.usersService
          .adjustReputation(
            r.userId,
            -2,
            `Bị cán bộ từ chối: ${r.rejectReason || 'Nội dung không chính xác'}`,
            r.id,
          )
          .catch((err) => console.error('Lỗi trừ điểm uy tín cán bộ:', err));
      }

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
  // NHẬN VIỆC (INSPECTOR & PATROL)
  // ══════════════════════════════════════════════════════════════════════

  async acceptByPatrol(id: number, patrol: any) {
    const r = await this.repo.findOne({ where: { id } });
    if (!r) throw new NotFoundException('Không tìm thấy phản ánh');
    if (r.patrolId !== patrol.id)
      throw new BadRequestException('Phản ánh không được giao cho bạn');
    if (r.patrolAcceptedAt)
      throw new BadRequestException('Bạn đã nhận việc rồi');

    r.patrolAcceptedAt = new Date();
    await this.repo.save(r);

    // Cập nhật trạng thái của DispatchReport liên quan
    const dispatchReport = await this.dispatchReportRepo.findOne({
      where: {
        reflectionId: id,
        assignedTo: patrol.id,
        status: DispatchReportStatus.PENDING,
      },
    });

    if (dispatchReport) {
      dispatchReport.status = DispatchReportStatus.IN_PROGRESS;
      dispatchReport.acceptedAt = new Date();
      await this.dispatchReportRepo.save(dispatchReport);

      // Thông báo cho người giao (Quản lý / Hậu kiểm)
      await this.notificationsService.create({
        userId: dispatchReport.assignedBy,
        title: 'Cán bộ tuần tra đã đến hiện trường',
        content: `Cán bộ tuần tra đã xác nhận đến nơi và bắt đầu xử lý phản ánh "${r.title}".`,
        type: 'DISPATCH_ACCEPTED',
        referenceId: r.id,
      });

      // Thông báo cho tất cả Quản lý và Admin (trừ người giao để tránh trùng lặp)
      const managers = await this.usersService.findByRoleCodes([
        RoleCode.MANAGER,
        RoleCode.ADMIN,
      ]);
      for (const m of managers) {
        if (m.id !== dispatchReport.assignedBy) {
          await this.notificationsService.create({
            userId: m.id,
            title: 'Cán bộ tuần tra đã đến hiện trường',
            content: `Cán bộ tuần tra đã xác nhận đến nơi và bắt đầu xử lý phản ánh "${r.title}". Trạng thái yêu cầu chuyển sang Đang xử lý.`,
            type: 'DISPATCH_ACCEPTED',
            referenceId: r.id,
          });
        }
      }
    }

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

    // Phát sự kiện realtime cho web dashboard
    this.notificationsService.sendPatrolLocationUpdate(id, dto.lat, dto.lng);

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
    r.needReinforcement = false;
    r.status = dto.resolved
      ? ReflectionStatus.COMPLETED
      : ReflectionStatus.IN_PROGRESS;
    await this.repo.save(r);

    // Cập nhật DispatchReport liên quan
    const dispatchReport = await this.dispatchReportRepo.findOne({
      where: [
        { reflectionId: id, assignedTo: patrol.id, status: DispatchReportStatus.IN_PROGRESS },
        { reflectionId: id, assignedTo: patrol.id, status: DispatchReportStatus.ACCEPTED },
        { reflectionId: id, assignedTo: patrol.id, status: DispatchReportStatus.PENDING }
      ]
    });

    if (dispatchReport) {
      if (dispatchReport.status === DispatchReportStatus.PENDING) {
        dispatchReport.acceptedAt = new Date();
      }
      dispatchReport.status = dto.resolved
        ? DispatchReportStatus.COMPLETED
        : DispatchReportStatus.IN_PROGRESS;
      dispatchReport.reportContent = r.patrolReport;
      dispatchReport.reflectionStatusUpdate = dto.resolved ? 'COMPLETED' : 'IN_PROGRESS';
      if (dto.resolved) {
        dispatchReport.completedAt = new Date();
      }
      await this.dispatchReportRepo.save(dispatchReport);
    }

    // Thông báo MANAGER khi tuần tra báo cáo (xong hoặc chưa xong)
    const managersToNotify: number[] = [];
    if (r.managedBy) {
      managersToNotify.push(r.managedBy);
    } else {
      const allManagers = await this.usersService.findByRoleCodes([
        RoleCode.MANAGER,
        RoleCode.ADMIN,
      ]);
      managersToNotify.push(...allManagers.map((m) => m.id));
    }

    if (dto.resolved) {
      for (const mId of managersToNotify) {
        await this.notificationsService.create({
          userId: mId,
          title: 'Tuần tra báo cáo hoàn thành sự cố',
          content: `Cán bộ tuần tra đã xử lý xong sự cố "${r.title}". Vui lòng xác nhận hoàn thành.`,
          type: 'PATROL_COMPLETED',
          referenceId: r.id,
        });
      }
    } else {
      for (const mId of managersToNotify) {
        await this.notificationsService.create({
          userId: mId,
          title: 'Cập nhật trạng thái xử lý sự cố',
          content: `Cán bộ tuần tra gửi cập nhật sự cố "${r.title}": ${dto.incompleteReason || 'Chưa hoàn thành'}.`,
          type: 'PATROL_UPDATE',
          referenceId: r.id,
        });
      }
    }

    return { statusCode: 200, message: 'Đã nộp báo cáo', data: r };
  }

  // ══════════════════════════════════════════════════════════════════════
  // BUOC CUOI: MANAGER XAC NHAN HOAN THANH (COMPLETED -> RESOLVED)
  // ══════════════════════════════════════════════════════════════════════

  async managerConfirm(id: number, dto: { note?: string; rating?: number }, manager: any) {
    const r = await this.repo.findOne({ where: { id } });
    if (!r) throw new NotFoundException('Không tìm thấy phản ánh');
    if (r.status !== ReflectionStatus.COMPLETED) {
      throw new BadRequestException(
        'Phản ánh chưa được tuần tra báo cáo hoàn thành',
      );
    }

    r.status = ReflectionStatus.RESOLVED;
    r.respondedAt = new Date();
    r.managedBy = manager.id;
    if (dto.note) r.response = `[Quản lý xác nhận]: ${dto.note}`;
    if (dto.rating !== undefined) {
      if (dto.rating < 1 || dto.rating > 5) {
        throw new BadRequestException('Điểm đánh giá phải từ 1 đến 5 sao');
      }
      r.rating = dto.rating;
    }
    await this.repo.save(r);

    if (r.userId) {
      await this.usersService
        .adjustReputation(r.userId, 1, 'Hoàn thành xử lý sự cố báo cáo', r.id)
        .catch((err) => console.error('Lỗi cộng điểm uy tín hoàn thành:', err));
    }

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

    await this.notifyNearbyResidents(r);

    return {
      statusCode: 200,
      message: 'Đã xác nhận hoàn thành và cập nhật sự cố',
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
    assignedUserId?: number,
  ) {
    const qb = this.repo
      .createQueryBuilder('r')
      .leftJoinAndSelect('r.user', 'user')
      .leftJoinAndSelect('user.role', 'role')
      .addSelect(`CASE r.priority 
        WHEN 'HIGH' THEN 1 
        WHEN 'MEDIUM' THEN 2 
        WHEN 'LOW' THEN 3 
        ELSE 4 
      END`, 'priority_order');

    if (isMap) {
      qb.andWhere('r.isPublishedOnMap = :published', { published: true });
    } else {
      const roleCode = currentUser?.roleCode;
      if (assignedUserId) {
        qb.andWhere(
          '(r.officerId = :assignedUserId OR r.inspectorId = :assignedUserId OR r.patrolId = :assignedUserId)',
          { assignedUserId },
        );
      } else {
        if (roleCode === RoleCode.ADMIN || roleCode === RoleCode.MANAGER) {
          // ADMIN và MANAGER chỉ xem các phản ánh đã được xác minh (khác PENDING)
          qb.andWhere('r.status != :pendingStatus', {
            pendingStatus: ReflectionStatus.PENDING,
          });
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
      }

      if (status) qb.andWhere('r.status = :status', { status });
    }

    if (keyword)
      qb.andWhere('(r.title LIKE :kw OR r.content LIKE :kw)', {
        kw: `%${keyword}%`,
      });
    qb.orderBy('priority_order', 'ASC')
      .addOrderBy('r.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);
    const [data, total] = await qb.getManyAndCount();

    if (currentUser?.roleCode === RoleCode.RESIDENT) {
      data.forEach((item) => {
        if (item.userId !== currentUser.id) {
          if (item.user && item.user.fullName) {
            item.user.fullName = this.maskName(item.user.fullName);
          }
          if (item.user) {
            item.user.phoneNumber = '***';
            item.user.email = '***';
            item.user.address = '***';
          }
          if (item.address) {
            item.address = this.maskAddress(item.address);
          }
        }
      });
    }

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

  async findOne(id: number, currentUser?: any) {
    const r = await this.repo.findOne({ where: { id }, relations: ['user'] });
    if (!r) throw new NotFoundException('Không tìm thấy phản ánh');

    if (currentUser?.roleCode === RoleCode.RESIDENT && r.userId !== currentUser.id) {
      if (r.user && r.user.fullName) {
        r.user.fullName = this.maskName(r.user.fullName);
      }
      if (r.user) {
        r.user.phoneNumber = '***';
        r.user.email = '***';
        r.user.address = '***';
      }
      if (r.address) {
        r.address = this.maskAddress(r.address);
      }
    }

    if (r.officerId) {
      try {
        const officerUser = await this.repo.manager.findOne(User, {
          where: { id: r.officerId },
        });
        const officerHr = await this.repo.manager.findOne(HumanResource, {
          where: { userId: r.officerId },
        });
        r['officer'] = {
          id: r.officerId,
          fullName: officerUser?.fullName || '',
          employeeCode: officerHr?.employeeCode || '',
        };
      } catch (err) {
        console.error('Lỗi khi truy vấn thông tin cán bộ từ chối:', err);
      }
    }

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

  private async findNearbyActiveReflections(
    lat: number,
    lng: number,
    minutes = 120,
    maxDistanceMeters = 150,
  ): Promise<Reflection[]> {
    if (!lat || !lng) return [];

    // Tính toán giới hạn bounding box xấp xỉ
    const latDelta = maxDistanceMeters / 111111;
    const lngDelta =
      maxDistanceMeters / (111111 * Math.cos((lat * Math.PI) / 180));

    const sinceDate = new Date(Date.now() - minutes * 60 * 1000);

    return this.repo
      .createQueryBuilder('r')
      .where('r.createdAt >= :sinceDate', { sinceDate })
      .andWhere('r.status IN (:...statuses)', {
        statuses: [
          ReflectionStatus.PENDING,
          ReflectionStatus.VERIFIED,
          ReflectionStatus.ASSIGNED,
          ReflectionStatus.IN_PROGRESS,
        ],
      })
      .andWhere('r.lat BETWEEN :minLat AND :maxLat', {
        minLat: lat - latDelta,
        maxLat: lat + latDelta,
      })
      .andWhere('r.lng BETWEEN :minLng AND :maxLng', {
        minLng: lng - lngDelta,
        maxLng: lng + lngDelta,
      })
      .getMany();
  }

  async getAssignedStats(userId: number) {
    const reflections = await this.repo.find({
      where: [
        { officerId: userId },
        { inspectorId: userId },
        { patrolId: userId },
      ],
      select: ['id', 'status'],
    });

    const stats = {
      total: reflections.length,
      completed: reflections.filter(
        (r) =>
          r.status === ReflectionStatus.RESOLVED ||
          r.status === ReflectionStatus.COMPLETED,
      ).length,
      inProgress: reflections.filter(
        (r) =>
          r.status === ReflectionStatus.IN_PROGRESS ||
          r.status === ReflectionStatus.ASSIGNED,
      ).length,
      pending: reflections.filter(
        (r) =>
          r.status === ReflectionStatus.PENDING ||
          r.status === ReflectionStatus.VERIFIED,
      ).length,
      rejected: reflections.filter(
        (r) => r.status === ReflectionStatus.REJECTED,
      ).length,
    };

    return {
      statusCode: 200,
      message: 'Lấy thống kê nhiệm vụ thành công',
      data: stats,
    };
  }

  async rateReflection(id: number, rating: number, userId: number, comment?: string) {
    const r = await this.repo.findOne({ where: { id } });
    if (!r) throw new NotFoundException('Không tìm thấy phản ánh');
    
    if (r.userId !== userId) {
      throw new ForbiddenException('Bạn không phải người tạo phản ánh này để thực hiện đánh giá');
    }

    if (r.status !== ReflectionStatus.RESOLVED) {
      throw new BadRequestException('Chỉ có thể đánh giá phản ánh đã hoàn thành');
    }

    if (rating < 1 || rating > 5) {
      throw new BadRequestException('Số sao đánh giá phải từ 1 đến 5');
    }

    r.rating = rating;
    if (comment) {
      r.response = r.response 
        ? `${r.response}\n[Đánh giá của cư dân - ${rating} sao]: ${comment}`
        : `[Đánh giá của cư dân - ${rating} sao]: ${comment}`;
    }

    await this.repo.save(r);
    return {
      statusCode: 200,
      message: 'Đánh giá thành công',
      data: r,
    };
  }

  private maskName(fullName: string): string {
    if (!fullName) return '';
    const parts = fullName.trim().split(/\s+/);
    if (parts.length === 0) return '';
    return `${parts[0]} ***`;
  }

  private maskAddress(address: string): string {
    if (!address) return '';
    const parts = address.split(',').map((p) => p.trim());
    if (parts.length > 2) {
      return `***, ${parts.slice(parts.length - 2).join(', ')}`;
    }
    return '***';
  }
}
