import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RoleCode } from 'src/common/enums/role-code.enum';
import { Repository } from 'typeorm';
import { NotificationsService } from '../notifications/notifications.service';
import { Reflection } from '../reflections/entities/reflection.entity';
import { ReflectionStatus } from '../reflections/enums/reflection.enum';
import { UsersService } from '../users/users.service';
import { CreateVerificationDto, UpdateVerificationDto } from './dto/verification.dto';
import { Verification } from './entities/verification.entity';
import { VerificationStatus, VerificationType } from './enums/verification.enum';

@Injectable()
export class VerificationsService {
  constructor(
    @InjectRepository(Verification)
    private readonly repo: Repository<Verification>,
    @InjectRepository(Reflection)
    private readonly reflectionRepo: Repository<Reflection>,
    private readonly notificationsService: NotificationsService,
    private readonly usersService: UsersService,
  ) {}

  async create(dto: CreateVerificationDto, user_id: number) {
    const code = `VR-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const saved = await this.repo.save(this.repo.create({ ...dto, user_id, code }));
    return { statusCode: 201, message: 'Gửi yêu cầu xác minh thành công', data: saved };
  }

  async findAll(page = 1, limit = 10, status?: VerificationStatus) {
    const qb = this.repo.createQueryBuilder('v').leftJoinAndSelect('v.user', 'user');
    if (status) qb.andWhere('v.status = :status', { status });
    qb.orderBy('v.createdAt', 'DESC').skip((page - 1) * limit).take(limit);
    const [data, total] = await qb.getManyAndCount();
    return { statusCode: 200, message: 'Thành công', data, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async findMyVerifications(userId: number, page = 1, limit = 10) {
    const [data, total] = await this.repo.findAndCount({
      where: { user_id: userId },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { statusCode: 200, message: 'Thành công', data, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async findOne(id: number) {
    const v = await this.repo.findOne({ where: { id }, relations: ['user'] });
    if (!v) throw new NotFoundException('Không tìm thấy yêu cầu xác minh');
    return { statusCode: 200, message: 'Thành công', data: v };
  }

  async update(id: number, dto: UpdateVerificationDto, reviewerId: number) {
    const v = await this.repo.findOne({ where: { id } });
    if (!v) throw new NotFoundException('Không tìm thấy yêu cầu xác minh');
    if (dto.status && [VerificationStatus.APPROVED, VerificationStatus.REJECTED, VerificationStatus.COMPLETED].includes(dto.status)) {
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
            reflection.status = ReflectionStatus.IN_PROGRESS; // Được duyệt thì bắt đầu xử lý
            reflection.managedBy = reviewerId; // Gắn định danh người quản lý duyệt báo cáo này

            // 1. Thông báo cho người gửi phản ánh (Owner)
            await this.notificationsService.create({
              userId: reflection.userId,
              title: 'Phản ánh đang được xử lý',
              content: `Chào ${reflection.user?.fullName || 'bạn'}, phản ánh "${reflection.title}" của bạn đã được tình nguyện viên xác minh và đang trong quá trình xử lý.`,
              type: 'REFLECTION_UPDATE',
              referenceId: reflection.id,
            });

            // 2. Thông báo cho Quản lý phường (MANAGER)
            const residentName = reflection.user?.fullName || 'Người dân';
            const managers = await this.usersService.findByRoleCode(RoleCode.MANAGER);
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
    }
    Object.assign(v, dto);
    return { statusCode: 200, message: 'Cập nhật thành công', data: await this.repo.save(v) };
  }

  async remove(id: number) {
    const v = await this.repo.findOne({ where: { id } });
    if (!v) throw new NotFoundException('Không tìm thấy yêu cầu xác minh');
    await this.repo.softDelete(id);
    return { statusCode: 200, message: 'Xóa thành công' };
  }
}
