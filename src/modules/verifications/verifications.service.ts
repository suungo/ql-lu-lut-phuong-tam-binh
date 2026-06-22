import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RoleCode } from 'src/common/enums/role-code.enum';
import { Repository } from 'typeorm';
import { AuthsService } from '../auths/auths.service';
import { NotificationsService } from '../notifications/notifications.service';
import { Reflection } from '../reflections/entities/reflection.entity';
import { ReflectionStatus } from '../reflections/enums/reflection.enum';
import { ResidentContactsService } from '../resident-contacts/resident-contacts.service';
import { UsersService } from '../users/users.service';
import {
  CreateVerificationDto,
  UpdateVerificationDto,
} from './dto/verification.dto';
import { Verification } from './entities/verification.entity';
import {
  VerificationStatus,
  VerificationType,
} from './enums/verification.enum';

@Injectable()
export class VerificationsService {
  constructor(
    @InjectRepository(Verification)
    private readonly repo: Repository<Verification>,
    @InjectRepository(Reflection)
    private readonly reflectionRepo: Repository<Reflection>,
    private readonly notificationsService: NotificationsService,
    private readonly usersService: UsersService,
    private readonly residentContactsService: ResidentContactsService,
    private readonly authsService: AuthsService,
  ) {}

  async create(dto: CreateVerificationDto, user_id: number) {
    const code = `VR-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // Đối chiếu CCCD nếu là đăng ký người dân
    let isMatchedContact: boolean | null = null;
    if (
      dto.verificationType === VerificationType.RESIDENT_REGISTRATION &&
      dto.cccd
    ) {
      const contact = await this.residentContactsService.findByCccd(dto.cccd);
      isMatchedContact = !!contact;
    }

    const saved = await this.repo.save(
      this.repo.create({ ...dto, user_id, code, isMatchedContact }),
    );
    return {
      statusCode: 201,
      message: 'Gửi yêu cầu xác minh thành công',
      data: { ...saved, isMatchedContact },
    };
  }

  async findAll(page = 1, limit = 10, status?: VerificationStatus) {
    const qb = this.repo
      .createQueryBuilder('v')
      .leftJoinAndSelect('v.user', 'user');
    if (status) qb.andWhere('v.status = :status', { status });
    qb.orderBy('v.createdAt', 'DESC')
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

  async findMyVerifications(userId: number, page = 1, limit = 10) {
    const [data, total] = await this.repo.findAndCount({
      where: { user_id: userId },
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
    const v = await this.repo.findOne({ where: { id }, relations: ['user'] });
    if (!v) throw new NotFoundException('Không tìm thấy yêu cầu xác minh');
    return { statusCode: 200, message: 'Thành công', data: v };
  }

  async update(id: number, dto: UpdateVerificationDto, reviewerId: number) {
    const v = await this.repo.findOne({ where: { id } });
    if (!v) throw new NotFoundException('Không tìm thấy yêu cầu xác minh');
    if (
      dto.status &&
      [
        VerificationStatus.APPROVED,
        VerificationStatus.REJECTED,
        VerificationStatus.COMPLETED,
      ].includes(dto.status)
    ) {
      v.reviewedAt = new Date();
      v.reviewedBy = reviewerId;

      const reviewerResponse = await this.usersService.findOne(reviewerId);
      const reviewer = reviewerResponse.data;

      // Đồng bộ trạng thái về phản ánh gốc
      if (v.verificationType === VerificationType.REFLECTION && v.referenceId) {
        const reflection = await this.reflectionRepo.findOne({
          where: { id: v.referenceId },
          relations: ['user'],
        });
        if (reflection) {
          if (dto.status === VerificationStatus.APPROVED) {
            reflection.status = ReflectionStatus.VERIFIED; // Được duyệt thì chuyển sang trạng thái đã xác minh
            reflection.managedBy = reviewerId; // Gắn định danh người quản lý duyệt báo cáo này

            // 1. Thông báo cho người gửi phản ánh (Owner)
            await this.notificationsService.create({
              userId: reflection.userId,
              title: 'Phản ánh đang được xử lý',
              content: `Chào ${reflection.user?.fullName || 'bạn'}, phản ánh "${reflection.title}" của bạn đã được tình nguyện viên xác minh và đang trong quá trình xử lý.`,
              type: 'REFLECTION_UPDATE',
              referenceId: reflection.id,
            });

            // 2. Thông báo cho Quản lý phường (MANAGER) và ADMIN
            const residentName = reflection.user?.fullName || 'Người dân';
            const managers = await this.usersService.findByRoleCodes([
              RoleCode.MANAGER,
              RoleCode.ADMIN,
            ]);
            for (const m of managers) {
              await this.notificationsService.create({
                userId: m.id,
                title: 'Phản ánh mới đã được xác minh',
                content: `Phản ánh "${reflection.title}" từ ${residentName} đã được xác minh bởi ${reviewer.fullName} (Tình nguyện viên). Nội dung: ${reflection.content}`,
                type: 'NEW_REFLECTION',
                referenceId: reflection.id,
              });
            }
          } else if (dto.status === VerificationStatus.REJECTED) {
            reflection.status = ReflectionStatus.REJECTED;

            // Thông báo cho người gửi phản ánh (Owner) về việc bị từ chối
            await this.notificationsService.create({
              userId: reflection.userId,
              title: 'Phản ánh bị từ chối',
              content: `Phản ánh "${reflection.title}" của bạn đã bị từ chối xác minh.`,
              type: 'REFLECTION_UPDATE',
              referenceId: reflection.id,
            });
          } else if (dto.status === VerificationStatus.COMPLETED) {
            reflection.status = ReflectionStatus.RESOLVED;

            // Thông báo cho người gửi phản ánh (Owner) về việc hoàn thành
            await this.notificationsService.create({
              userId: reflection.userId,
              title: 'Sự cố đã xử lý xong',
              content: `Chào ${reflection.user?.fullName || 'bạn'}, sự cố "${reflection.title}" mà bạn phản ánh đã được xử lý hoàn tất. Cảm ơn bạn đã đóng góp! Vui lòng truy cập vào phần quản lý thiệt hại để cập nhật thiệt hại do sự cố gây ra nếu có (Lưu ý: Đây là tiền đề để giúp cơ quan chức năng khắc phục sự cố)`,
              type: 'REFLECTION_RESOLVED',
              referenceId: reflection.id,
            });
          }
          await this.reflectionRepo.save(reflection);
        }
      }

      // ============ XỬ LÝ ĐĂNG KÝ NGƯỜI DÂN ============
      if (v.verificationType === VerificationType.RESIDENT_REGISTRATION) {
        const userRes = await this.usersService.findOne(v.user_id).catch(() => null);
        const userData = userRes?.data;

        if (dto.status === VerificationStatus.APPROVED) {
          if (userData) {
            this.notificationsService.create({
              userId: v.user_id,
              title: 'Tài khoản đã được phê duyệt',
              content: `Chào ${userData.fullName || 'bạn'}, tài khoản đăng ký của bạn đã được Ban quản trị phê duyệt. Bạn có thể đăng nhập hệ thống ngay bây giờ.`,
              type: 'VERIFICATION_UPDATE',
              referenceId: v.id,
            }).catch(console.error);
          }
        } else if (dto.status === VerificationStatus.REJECTED) {
          if (userData) {
            this.notificationsService.create({
              userId: v.user_id,
              title: 'Yêu cầu đăng ký bị từ chối',
              content: `Chào ${userData.fullName || 'bạn'}, yêu cầu đăng ký tài khoản của bạn đã bị từ chối${dto.reviewNote ? `: ${dto.reviewNote}` : '.'}`,
              type: 'VERIFICATION_UPDATE',
              referenceId: v.id,
            }).catch(console.error);
          }
        }
      }
    }
    Object.assign(v, dto);
    return {
      statusCode: 200,
      message: 'Cập nhật thành công',
      data: await this.repo.save(v),
    };
  }


  async remove(id: number) {
    const v = await this.repo.findOne({ where: { id } });
    if (!v) throw new NotFoundException('Không tìm thấy yêu cầu xác minh');
    await this.repo.softDelete(id);
    return { statusCode: 200, message: 'Xóa thành công' };
  }
}
