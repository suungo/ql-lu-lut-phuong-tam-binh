import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotificationsService } from '../notifications/notifications.service';
import { Reflection } from '../reflections/entities/reflection.entity';
import { ReflectionStatus } from '../reflections/enums/reflection.enum';
import {
  CreateDispatchReportDto,
  UpdateDispatchReportDto,
} from './dto/dispatch-report.dto';
import { DispatchReport } from './entities/dispatch-report.entity';
import {
  DispatchReportStatus,
  DispatchReportType,
} from './enums/dispatch-report.enum';

@Injectable()
export class DispatchReportsService {
  constructor(
    @InjectRepository(DispatchReport)
    private readonly repo: Repository<DispatchReport>,
    @InjectRepository(Reflection)
    private readonly reflectionRepo: Repository<Reflection>,
    private readonly notificationsService: NotificationsService,
  ) {}

  // ══════════════════════════════════════════════════════════════════════
  // TẠO ĐIỀU CHUYỂN (MANAGER → INSPECTOR)
  // ══════════════════════════════════════════════════════════════════════

  async createDispatchToInspector(
    dto: CreateDispatchReportDto,
    managerId: number,
  ) {
    const reflection = await this.reflectionRepo.findOne({
      where: { id: dto.reflectionId },
    });
    if (!reflection) throw new NotFoundException('Không tìm thấy phản ánh');

    // Kiểm tra trạng thái hợp lệ
    if (
      ![ReflectionStatus.VERIFIED, ReflectionStatus.ASSIGNED].includes(
        reflection.status,
      )
    ) {
      throw new BadRequestException(
        'Phản ánh chưa được xác minh hoặc không phù hợp để điều chuyển',
      );
    }

    // Nếu đang có dispatch pending, kiểm tra timeout
    const existingPending = await this.repo.findOne({
      where: {
        reflectionId: dto.reflectionId,
        type: DispatchReportType.MANAGER_TO_INSPECTOR,
        status: DispatchReportStatus.PENDING,
      },
    });

    if (existingPending) {
      const now = new Date();
      if (now < existingPending.expiredAt) {
        throw new BadRequestException(
          'Đang trong thời gian chờ xác nhận (5 phút). Không thể tạo điều chuyển mới.',
        );
      }
      // Quá hạn → hủy cái cũ
      existingPending.status = DispatchReportStatus.EXPIRED;
      await this.repo.save(existingPending);
    }

    const now = new Date();
    const expiredAt = new Date(now.getTime() + 5 * 60 * 1000); // +5 phút
    const code = `DR-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const report = this.repo.create({
      code,
      type: DispatchReportType.MANAGER_TO_INSPECTOR,
      status: DispatchReportStatus.PENDING,
      reflectionId: dto.reflectionId,
      assignedBy: managerId,
      assignedTo: dto.assignedTo,
      assignedAt: now,
      expiredAt,
      title: dto.title || `Điều chuyển phản ánh: ${reflection.title}`,
      description: dto.description,
      note: dto.note,
      createdBy: managerId,
    });

    const saved = await this.repo.save(report);

    // Cập nhật reflection
    reflection.status = ReflectionStatus.ASSIGNED;
    reflection.inspectorId = dto.assignedTo;
    reflection.managedBy = managerId;
    reflection.assignedAt = now;
    reflection.inspectorAcceptedAt = null;
    await this.reflectionRepo.save(reflection);

    // Thông báo cho INSPECTOR
    await this.notificationsService.create({
      userId: dto.assignedTo,
      title: 'Điều chuyển phản ánh mới',
      content: `Quản lý đã điều chuyển phản ánh "${reflection.title}" cho bạn. Vui lòng xác nhận trong vòng 5 phút.`,
      type: 'DISPATCH_NEW',
      referenceId: reflection.id,
    });

    return {
      statusCode: 201,
      message: 'Tạo điều chuyển thành công',
      data: saved,
    };
  }

  // ══════════════════════════════════════════════════════════════════════
  // TẠO ĐIỀU CHUYỂN (INSPECTOR → PATROL)
  // ══════════════════════════════════════════════════════════════════════

  async createDispatchToPatrol(
    dto: CreateDispatchReportDto,
    inspectorId: number,
  ) {
    const reflection = await this.reflectionRepo.findOne({
      where: { id: dto.reflectionId },
    });
    if (!reflection) throw new NotFoundException('Không tìm thấy phản ánh');

    if (
      ![ReflectionStatus.ASSIGNED, ReflectionStatus.IN_PROGRESS].includes(
        reflection.status,
      )
    ) {
      throw new BadRequestException(
        'Phản ánh chưa được giao hoặc không phù hợp để điều Tuần tra',
      );
    }

    // Kiểm tra pending dispatch
    const existingPending = await this.repo.findOne({
      where: {
        reflectionId: dto.reflectionId,
        type: DispatchReportType.INSPECTOR_TO_PATROL,
        status: DispatchReportStatus.PENDING,
      },
    });

    if (existingPending) {
      const now = new Date();
      if (now < existingPending.expiredAt) {
        throw new BadRequestException(
          'Đang trong thời gian chờ xác nhận (5 phút). Không thể tạo điều chuyển mới.',
        );
      }
      existingPending.status = DispatchReportStatus.EXPIRED;
      await this.repo.save(existingPending);
    }

    const now = new Date();
    const expiredAt = new Date(now.getTime() + 5 * 60 * 1000);
    const code = `DR-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const report = this.repo.create({
      code,
      type: DispatchReportType.INSPECTOR_TO_PATROL,
      status: DispatchReportStatus.PENDING,
      reflectionId: dto.reflectionId,
      assignedBy: inspectorId,
      assignedTo: dto.assignedTo,
      assignedAt: now,
      expiredAt,
      title: dto.title || `Điều chuyển tuần tra: ${reflection.title}`,
      description: dto.description,
      note: dto.note,
      createdBy: inspectorId,
    });

    const saved = await this.repo.save(report);

    // Cập nhật reflection
    reflection.status = ReflectionStatus.IN_PROGRESS;
    reflection.patrolId = dto.assignedTo;
    reflection.dispatchedAt = now;
    reflection.patrolAcceptedAt = null;
    await this.reflectionRepo.save(reflection);

    // Thông báo cho PATROL
    await this.notificationsService.create({
      userId: dto.assignedTo,
      title: 'Nhiệm vụ tuần tra mới',
      content: `Hậu kiểm đã điều bạn xử lý sự cố "${reflection.title}" tại ${reflection.address || 'vị trí không xác định'}. Vui lòng xác nhận trong vòng 5 phút.`,
      type: 'DISPATCH_NEW',
      referenceId: reflection.id,
    });

    return {
      statusCode: 201,
      message: 'Tạo điều chuyển Tuần tra thành công',
      data: saved,
    };
  }

  // ══════════════════════════════════════════════════════════════════════
  // XÁC NHẬN ĐIỀU CHUYỂN
  // ══════════════════════════════════════════════════════════════════════

  async acceptDispatch(id: number, userId: number) {
    const report = await this.repo.findOne({
      where: { id },
      relations: ['reflection'],
    });
    if (!report) throw new NotFoundException('Không tìm thấy biên bản');
    if (report.assignedTo !== userId)
      throw new BadRequestException('Bạn không phải người được chỉ định');
    if (report.status !== DispatchReportStatus.PENDING)
      throw new BadRequestException('Biên bản không ở trạng thái chờ xác nhận');

    // Kiểm tra hết hạn
    const now = new Date();
    if (now > report.expiredAt) {
      report.status = DispatchReportStatus.EXPIRED;
      await this.repo.save(report);
      throw new BadRequestException(
        'Đã quá thời hạn xác nhận (5 phút). Điều chuyển đã bị hủy.',
      );
    }

    report.status = DispatchReportStatus.ACCEPTED;
    report.acceptedAt = now;
    await this.repo.save(report);

    // Cập nhật reflection
    const reflection = report.reflection;
    if (report.type === DispatchReportType.MANAGER_TO_INSPECTOR) {
      reflection.inspectorAcceptedAt = now;
    } else {
      reflection.patrolAcceptedAt = now;
    }
    await this.reflectionRepo.save(reflection);

    // Thông báo người giao
    await this.notificationsService.create({
      userId: report.assignedBy,
      title: 'Điều chuyển đã được xác nhận',
      content: `Cán bộ đã xác nhận điều chuyển phản ánh "${reflection.title}".`,
      type: 'DISPATCH_ACCEPTED',
      referenceId: reflection.id,
    });

    return {
      statusCode: 200,
      message: 'Đã xác nhận nhận việc',
      data: report,
    };
  }

  // ══════════════════════════════════════════════════════════════════════
  // CẬP NHẬT BÁO CÁO
  // ══════════════════════════════════════════════════════════════════════

  async updateReport(id: number, dto: UpdateDispatchReportDto, userId: number) {
    const report = await this.repo.findOne({
      where: { id },
      relations: ['reflection'],
    });
    if (!report) throw new NotFoundException('Không tìm thấy biên bản');

    // Chỉ người nhận hoặc người giao mới được cập nhật
    if (report.assignedTo !== userId && report.assignedBy !== userId) {
      throw new BadRequestException('Bạn không có quyền cập nhật biên bản này');
    }

    // Cập nhật các trường
    if (dto.reportContent !== undefined)
      report.reportContent = dto.reportContent;
    if (dto.reflectionStatusUpdate !== undefined)
      report.reflectionStatusUpdate = dto.reflectionStatusUpdate;
    if (dto.rejectReason !== undefined) report.rejectReason = dto.rejectReason;
    if (dto.attachments !== undefined) report.attachments = dto.attachments;
    if (dto.title !== undefined) report.title = dto.title;
    if (dto.description !== undefined) report.description = dto.description;

    if (dto.status) {
      report.status = dto.status;
      if (dto.status === DispatchReportStatus.COMPLETED) {
        report.completedAt = new Date();
      }
    }

    report.updatedBy = userId;
    const saved = await this.repo.save(report);

    // Nếu hoàn thành, thông báo người giao
    if (dto.status === DispatchReportStatus.COMPLETED) {
      await this.notificationsService.create({
        userId: report.assignedBy,
        title: 'Biên bản báo cáo hoàn thành',
        content: `Cán bộ đã hoàn thành báo cáo cho phản ánh "${report.reflection?.title}".`,
        type: 'DISPATCH_COMPLETED',
        referenceId: report.reflectionId,
      });
    }

    return {
      statusCode: 200,
      message: 'Cập nhật biên bản thành công',
      data: saved,
    };
  }

  // ══════════════════════════════════════════════════════════════════════
  // DANH SÁCH & CHI TIẾT
  // ══════════════════════════════════════════════════════════════════════

  async findAll(
    page = 1,
    limit = 10,
    filters?: {
      status?: DispatchReportStatus;
      type?: DispatchReportType;
      reflectionId?: number;
      assignedTo?: number;
      assignedBy?: number;
    },
  ) {
    const qb = this.repo
      .createQueryBuilder('dr')
      .leftJoinAndSelect('dr.reflection', 'reflection')
      .leftJoinAndSelect('dr.assigner', 'assigner')
      .leftJoinAndSelect('dr.assignee', 'assignee')
      .leftJoinAndSelect('reflection.user', 'reflectionUser');

    if (filters?.status) {
      qb.andWhere('dr.status = :status', { status: filters.status });
    }
    if (filters?.type) {
      qb.andWhere('dr.type = :type', { type: filters.type });
    }
    if (filters?.reflectionId) {
      qb.andWhere('dr.reflectionId = :reflectionId', {
        reflectionId: filters.reflectionId,
      });
    }
    if (filters?.assignedTo) {
      qb.andWhere('dr.assignedTo = :assignedTo', {
        assignedTo: filters.assignedTo,
      });
    }
    if (filters?.assignedBy) {
      qb.andWhere('dr.assignedBy = :assignedBy', {
        assignedBy: filters.assignedBy,
      });
    }

    // Auto-expire: cập nhật các record pending đã quá hạn
    await this.repo
      .createQueryBuilder()
      .update(DispatchReport)
      .set({ status: DispatchReportStatus.EXPIRED })
      .where('status = :status', { status: DispatchReportStatus.PENDING })
      .andWhere('expired_at < :now', { now: new Date() })
      .execute();

    qb.orderBy('dr.createdAt', 'DESC')
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

  async findOne(id: number) {
    const report = await this.repo.findOne({
      where: { id },
      relations: ['reflection', 'assigner', 'assignee', 'reflection.user'],
    });
    if (!report) throw new NotFoundException('Không tìm thấy biên bản');
    return { statusCode: 200, message: 'Thành công', data: report };
  }

  async findByReflection(reflectionId: number) {
    const reports = await this.repo.find({
      where: { reflectionId },
      relations: ['assigner', 'assignee'],
      order: { createdAt: 'DESC' },
    });
    return { statusCode: 200, message: 'Thành công', data: reports };
  }

  async remove(id: number) {
    const report = await this.repo.findOne({ where: { id } });
    if (!report) throw new NotFoundException('Không tìm thấy biên bản');
    await this.repo.softDelete(id);
    return { statusCode: 200, message: 'Xóa thành công' };
  }
}
