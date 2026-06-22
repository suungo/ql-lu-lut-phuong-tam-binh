import {
  Injectable,
  NotFoundException,
  OnModuleInit,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository, In } from 'typeorm';
import { User } from './entities/user.entity';
import { RoleCode } from 'src/common/enums/role-code.enum';
import { ReputationHistory } from './entities/reputation-history.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { Role } from 'src/modules/roles/entities/role.entity';
import { HumanResource } from 'src/modules/human-resources/entities/human-resource.entity';
import { Resident } from 'src/modules/residents/entities/resident.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService implements OnModuleInit {
  constructor(
    @InjectRepository(User)
    private readonly repo: Repository<User>,
  ) {}

  async create(dto: CreateUserDto) {
    const existing = await this.repo.findOne({
      where: [
        { phoneNumber: dto.phoneNumber },
        ...(dto.email ? [{ email: dto.email }] : []),
      ],
      withDeleted: true,
    });
    if (existing) {
      if (existing.deletedAt) {
        throw new BadRequestException(
          'Số điện thoại hoặc Email đã tồn tại trong hệ thống (đã bị xóa tạm thời)',
        );
      }
      throw new BadRequestException('Số điện thoại hoặc Email đã được sử dụng');
    }

    const role = await this.repo.manager.getRepository(Role).findOne({
      where: { roleCode: dto.roleCode },
    });
    if (!role) {
      throw new NotFoundException('Vai trò không tồn tại');
    }

    const hashedPassword = dto.password
      ? await bcrypt.hash(dto.password, 10)
      : null;

    const user = this.repo.create({
      fullName: dto.fullName,
      phoneNumber: dto.phoneNumber,
      email: dto.email,
      password: hashedPassword,
      roleId: role.id,
    });

    const saved = await this.repo.save(user);
    const { password: _p, ...result } = saved;
    return {
      statusCode: 201,
      message: 'Tạo người dùng thành công',
      data: result,
    };
  }

  async onModuleInit() {
    // Tự động kiểm tra và reset điểm uy tín về 10 khi qua năm mới khi khởi động ứng dụng
    await this.checkAndResetReputationForNewYear().catch((err) => {
      console.error(
        'Lỗi khi kiểm tra reset điểm uy tín đầu năm lúc khởi động:',
        err?.message,
      );
    });

    // Cài đặt kiểm tra định kỳ mỗi giờ
    setInterval(
      async () => {
        try {
          await this.checkAndResetReputationForNewYear();
        } catch (err) {
          console.error(
            'Lỗi khi kiểm tra định kỳ reset điểm uy tín đầu năm:',
            err?.message,
          );
        }
      },
      60 * 60 * 1000,
    );
  }

  async checkAndResetReputationForNewYear() {
    const currentYear = new Date().getFullYear();
    const historyRepo = this.repo.manager.getRepository(ReputationHistory);

    // Kiểm tra xem đã có bản ghi reset của năm nay chưa
    const hasReset = await historyRepo.findOne({
      where: {
        reason: `Hệ thống tự động reset điểm uy tín về 10 khi qua năm mới ${currentYear}`,
      },
    });

    if (hasReset) {
      return;
    }

    console.log(
      `[NewYearReset] Bắt đầu tự động reset điểm uy tín về 10 cho toàn bộ người dùng trong năm mới ${currentYear}...`,
    );

    const users = await this.repo.find();
    if (users.length === 0) return;

    const usersToSave: User[] = [];
    const historiesToSave: ReputationHistory[] = [];

    for (const user of users) {
      const oldPoints = user.reputationPoints ?? 10;
      const wasBlocked = !!user.reputationBlockedUntil;

      if (oldPoints !== 10 || wasBlocked) {
        user.reputationPoints = 10;
        user.reputationBlockedUntil = null;
        usersToSave.push(user);
      }

      const history = historyRepo.create({
        userId: user.id,
        amount: 10 - oldPoints,
        reason: `Hệ thống tự động reset điểm uy tín về 10 khi qua năm mới ${currentYear}`,
      });
      historiesToSave.push(history);
    }

    // Lưu hàng loạt để tối ưu hiệu năng
    if (usersToSave.length > 0) {
      await this.repo.save(usersToSave);
    }
    if (historiesToSave.length > 0) {
      await historyRepo.save(historiesToSave);
    }

    console.log(
      `[NewYearReset] Hoàn thành tự động reset điểm uy tín cho năm mới ${currentYear}.`,
    );
  }

  async findAll(page = 1, limit = 10, keyword?: string, roleCode?: RoleCode) {
    const baseWhere: any = {};
    if (roleCode) {
      baseWhere.role = { roleCode };
    }

    let where: any = baseWhere;
    if (keyword) {
      where = [
        { ...baseWhere, fullName: Like(`%${keyword}%`) },
        { ...baseWhere, phoneNumber: Like(`%${keyword}%`) },
      ];
    }
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
        'reputationPoints',
        'reputationBlockedUntil',
        'createdAt',
      ],
      relations: ['role'],
      order: { createdAt: 'DESC' },
    });
    const userIds = data.map((u) => u.id);
    const phoneNumbers = data.map((u) => u.phoneNumber).filter(Boolean);
    const emails = data.map((u) => u.email).filter(Boolean);

    if (userIds.length > 0) {
      const residentRepo = this.repo.manager.getRepository(Resident);
      const residents = await residentRepo.find({
        where: [
          { userId: In(userIds) },
          ...(phoneNumbers.length > 0
            ? [{ phoneNumber: In(phoneNumbers) }]
            : []),
          ...(emails.length > 0 ? [{ email: In(emails) }] : []),
        ],
      });

      const residentsToSave: Resident[] = [];

      for (const user of data) {
        let resident = residents.find((r) => r.userId === user.id);
        if (!resident && user.phoneNumber) {
          resident = residents.find((r) => r.phoneNumber === user.phoneNumber);
        }
        if (!resident && user.email) {
          resident = residents.find((r) => r.email === user.email);
        }

        if (resident) {
          if (!resident.userId) {
            resident.userId = user.id;
            residentsToSave.push(resident);
          }
          (user as any).resident = resident;
        } else if (user.role?.roleCode === RoleCode.RESIDENT) {
          // Lưu ngay để lấy ID từ DB trước khi gán vào user
          const newResident = residentRepo.create({
            residentCode: `CH-${user.phoneNumber || user.id}`,
            fullName: user.fullName || 'Chưa cập nhật',
            phoneNumber: user.phoneNumber,
            email: user.email,
            address: user.address || 'Chưa cập nhật',
            userId: user.id,
          });
          try {
            const savedResident = await residentRepo.save(newResident);
            (user as any).resident = savedResident;
          } catch (err) {
            console.error(
              'Lỗi khi tự động tạo Resident trong findAll:',
              err?.message,
            );
            (user as any).resident = null;
          }
        } else {
          (user as any).resident = null;
        }
      }

      // Lưu các resident cần update userId (liên kết lại)
      if (residentsToSave.length > 0) {
        await residentRepo.save(residentsToSave).catch((err) => {
          console.error('Lỗi khi tự động lưu/liên kết Resident:', err?.message);
        });
      }
    }

    return {
      statusCode: 200,
      message: 'Thành công',
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async getStaffWorkQuality(page = 1, limit = 10, keyword?: string) {
    const qb = this.repo
      .createQueryBuilder('u')
      .leftJoinAndSelect('u.role', 'role')
      .where('role.roleCode NOT IN (:...excludedRoles)', {
        excludedRoles: [RoleCode.ADMIN, RoleCode.MANAGER, RoleCode.RESIDENT],
      });

    if (keyword) {
      qb.andWhere('(u.fullName LIKE :kw OR u.phoneNumber LIKE :kw)', {
        kw: `%${keyword}%`,
      });
    }

    const [users, total] = await qb
      .orderBy('u.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    const data = await Promise.all(
      users.map(async (user) => {
        if (user.role?.roleCode === RoleCode.OFFICER) {
          // Cán bộ tăng cường: Dựa vào tiêu chí thời gian xác minh
          const reflections = await this.repo.manager
            .getRepository(
              require('../reflections/entities/reflection.entity').Reflection,
            )
            .find({
              where: { officerId: user.id },
              select: ['createdAt', 'verifiedAt'],
            });

          const verifiedReflections = reflections.filter((r) => r.verifiedAt);
          const ratingCount = verifiedReflections.length;

          let totalRating = 0;
          verifiedReflections.forEach((r) => {
            const diffMin =
              (new Date(r.verifiedAt).getTime() -
                new Date(r.createdAt).getTime()) /
              (60 * 1000);
            let rating = 1;
            if (diffMin <= 15) rating = 5;
            else if (diffMin <= 30) rating = 4;
            else if (diffMin <= 60) rating = 3;
            else if (diffMin <= 120) rating = 2;
            totalRating += rating;
          });

          const averageRating =
            ratingCount > 0
              ? parseFloat((totalRating / ratingCount).toFixed(1))
              : 0;

          return {
            ...user,
            averageRating,
            ratingCount,
          };
        } else {
          // Cán bộ tuần tra hoặc các vai trò khác: Dựa vào mức độ hài lòng khi người dân đánh giá
          const roleCode = user.role?.roleCode;
          let whereClause = '';
          if (roleCode === RoleCode.PATROL) {
            whereClause = 'r.patrolId = :uid';
          } else if (roleCode === RoleCode.INSPECTOR) {
            whereClause = 'r.inspectorId = :uid';
          } else {
            whereClause =
              '(r.patrolId = :uid OR r.officerId = :uid OR r.inspectorId = :uid)';
          }

          const ratingData = await this.repo.manager
            .getRepository(
              require('../reflections/entities/reflection.entity').Reflection,
            )
            .createQueryBuilder('r')
            .select('AVG(r.rating)', 'avgRating')
            .addSelect('COUNT(r.rating)', 'ratingCount')
            .where(whereClause, { uid: user.id })
            .andWhere('r.rating IS NOT NULL')
            .getRawOne();

          return {
            ...user,
            averageRating: ratingData?.avgRating
              ? parseFloat(parseFloat(ratingData.avgRating).toFixed(1))
              : 0,
            ratingCount: ratingData?.ratingCount
              ? parseInt(ratingData.ratingCount)
              : 0,
          };
        }
      }),
    );

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
        'reputationPoints',
        'reputationBlockedUntil',
        'createdAt',
      ],
      relations: ['role'],
    });
    if (!user) throw new NotFoundException('Không tìm thấy người dùng');

    // Attach humanResource info
    const hr = await this.repo.manager.findOne(HumanResource, {
      where: { userId: id },
    });
    (user as any).humanResource = hr;

    // Attach resident info
    let resident = await this.repo.manager.findOne(Resident, {
      where: { userId: id },
    });
    if (!resident && user.role?.roleCode === RoleCode.RESIDENT) {
      resident = this.repo.manager.getRepository(Resident).create({
        residentCode: `CH-${user.phoneNumber || user.id}`,
        fullName: user.fullName || 'Chưa cập nhật',
        phoneNumber: user.phoneNumber,
        email: user.email,
        address: user.address || 'Chưa cập nhật',
        userId: user.id,
      });
      await this.repo.manager
        .getRepository(Resident)
        .save(resident)
        .catch((err) => {
          console.error('Lỗi tự động tạo Resident trong findOne:', err);
        });
    }
    (user as any).resident = resident;

    // Tự động kiểm tra mở khóa điểm uy tín sau 15 ngày
    if (
      user.reputationPoints === 0 &&
      user.reputationBlockedUntil &&
      new Date() > new Date(user.reputationBlockedUntil)
    ) {
      user.reputationPoints = 10;
      user.reputationBlockedUntil = null;
      await this.repo.save(user);

      // Ghi nhận lịch sử tự động mở khóa
      const historyRepo = this.repo.manager.getRepository(ReputationHistory);
      const history = historyRepo.create({
        userId: user.id,
        amount: 10,
        reason:
          'Hệ thống tự động mở khóa và khôi phục điểm uy tín về 10 sau 15 ngày tạm khóa',
      });
      await historyRepo
        .save(history)
        .catch((err) => console.error('Lỗi lưu lịch sử tự động mở khóa:', err));
    }

    // Tự động sửa lỗi dữ liệu nếu điểm uy tín lớn hơn 10 (do thang điểm cũ)
    if (user.reputationPoints > 10) {
      user.reputationPoints = 10;
      await this.repo.save(user);
    }

    return { statusCode: 200, message: 'Thành công', data: user };
  }

  async updateProfile(id: number, dto: Partial<User>) {
    const user = await this.repo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('Không tìm thấy người dùng');
    const { password: _, ...safeDto } = dto as any;
    Object.assign(user, safeDto);
    const saved = await this.repo.save(user);
    const { password: _p, ...result } = saved;

    // Attach humanResource info
    const hr = await this.repo.manager.findOne(HumanResource, {
      where: { userId: id },
    });
    (result as any).humanResource = hr;

    // Attach resident info
    let resident = await this.repo.manager.findOne(Resident, {
      where: { userId: id },
    });
    if (!resident) {
      const userWithRole = await this.repo.findOne({
        where: { id },
        relations: ['role'],
      });
      if (userWithRole?.role?.roleCode === RoleCode.RESIDENT) {
        resident = this.repo.manager.getRepository(Resident).create({
          residentCode: `CH-${userWithRole.phoneNumber || userWithRole.id}`,
          fullName: userWithRole.fullName || 'Chưa cập nhật',
          phoneNumber: userWithRole.phoneNumber,
          email: userWithRole.email,
          address: userWithRole.address || 'Chưa cập nhật',
          userId: userWithRole.id,
        });
        await this.repo.manager
          .getRepository(Resident)
          .save(resident)
          .catch((err) => {
            console.error('Lỗi tự động tạo Resident trong updateProfile:', err);
          });
      }
    }
    (result as any).resident = resident;

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

  async updateReputation(id: number, points: number) {
    const user = await this.repo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('Không tìm thấy người dùng');

    let cappedPoints = points;
    if (cappedPoints > 10) cappedPoints = 10;
    if (cappedPoints < 0) cappedPoints = 0;

    user.reputationPoints = cappedPoints;

    if (cappedPoints === 0) {
      if (!user.reputationBlockedUntil) {
        const blockedUntil = new Date();
        blockedUntil.setDate(blockedUntil.getDate() + 15);
        user.reputationBlockedUntil = blockedUntil;
      }
    } else {
      user.reputationBlockedUntil = null;
    }

    await this.repo.save(user);
    return {
      statusCode: 200,
      message: 'Cập nhật điểm uy tín thành công',
      data: { reputationPoints: cappedPoints },
    };
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

  async adjustReputation(
    userId: number,
    amount: number,
    reason: string,
    reflectionId?: number,
  ) {
    const user = await this.repo.findOne({ where: { id: userId } });
    if (!user) return;

    const historyRepo = this.repo.manager.getRepository(ReputationHistory);
    if (reflectionId) {
      const existing = await historyRepo.findOne({
        where: {
          userId,
          reflectionId,
          amount,
        },
      });
      if (existing) {
        console.log(
          `[adjustReputation] Lịch sử uy tín cho phản ánh #${reflectionId} với lượng thay đổi ${amount} đã tồn tại. Bỏ qua.`,
        );
        return;
      }
    }

    const currentPoints = user.reputationPoints ?? 10;
    let newPoints = currentPoints + amount;

    if (newPoints > 10) newPoints = 10;
    if (newPoints < 0) newPoints = 0;

    user.reputationPoints = newPoints;

    // Nếu điểm về 0, đặt hạn khóa 15 ngày
    if (newPoints === 0) {
      if (!user.reputationBlockedUntil) {
        const blockedUntil = new Date();
        blockedUntil.setDate(blockedUntil.getDate() + 15);
        user.reputationBlockedUntil = blockedUntil;
      }
    } else {
      user.reputationBlockedUntil = null;
    }

    await this.repo.save(user);

    const history = historyRepo.create({
      userId,
      amount,
      reason,
      reflectionId,
    });
    await historyRepo.save(history);
  }

  async getReputationHistory(userId: number) {
    try {
      const history = await this.repo.manager
        .getRepository(ReputationHistory)
        .find({
          where: { userId },
          order: { createdAt: 'DESC' },
        });
      return { statusCode: 200, message: 'Thành công', data: history };
    } catch (err) {
      console.error(
        '[getReputationHistory] Lỗi truy vấn lịch sử uy tín:',
        err?.message,
      );
      // Trả về mảng rỗng thay vì crash 500 (bảng có thể chưa tồn tại trên production)
      return { statusCode: 200, message: 'Thành công', data: [] };
    }
  }

  async countAllUsers(): Promise<number> {
    return await this.repo.count();
  }

  async findDeleted(page = 1, limit = 10, keyword?: string) {
    const qb = this.repo
      .createQueryBuilder('u')
      .leftJoinAndSelect('u.role', 'role')
      .withDeleted()
      .where('u.deletedAt IS NOT NULL')
      .andWhere('role.roleCode != :adminRole', { adminRole: RoleCode.ADMIN });

    if (keyword) {
      qb.andWhere('(u.fullName LIKE :kw OR u.phoneNumber LIKE :kw)', {
        kw: `%${keyword}%`,
      });
    }

    const [data, total] = await qb
      .orderBy('u.deletedAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      statusCode: 200,
      message: 'Thành công',
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async restoreDeleted(id: number) {
    const user = await this.repo.findOne({
      where: { id },
      withDeleted: true,
    });
    if (!user) throw new NotFoundException('Không tìm thấy người dùng');
    if (!user.deletedAt)
      throw new BadRequestException('Người dùng không ở trạng thái bị xóa');
    await this.repo.restore(id);
    return { statusCode: 200, message: 'Khôi phục tài khoản thành công' };
  }

  async suspendUser(id: number) {
    const user = await this.repo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('Không tìm thấy người dùng');
    user.status = require('./enums/user-status.enum').UserStatus.INACTIVE;
    await this.repo.save(user);
    return {
      statusCode: 200,
      message: 'Tạm ngừng hoạt động tài khoản thành công',
    };
  }

  async activateUser(id: number) {
    const user = await this.repo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('Không tìm thấy người dùng');
    user.status = require('./enums/user-status.enum').UserStatus.ACTIVE;
    await this.repo.save(user);
    return { statusCode: 200, message: 'Kích hoạt tài khoản thành công' };
  }
}
