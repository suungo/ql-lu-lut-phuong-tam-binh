import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RoleCode } from 'src/common/enums/role-code.enum';
import { In, Like, Repository } from 'typeorm';
import { AuthsService } from '../auths/auths.service';
import { CreateResidentDto, UpdateResidentDto } from './dto/resident.dto';
import { Resident } from './entities/resident.entity';
import {
  HasBusiness,
  HasChildren,
  HasElderly,
  HasPregnant,
  HasSick,
  HouseType,
} from './enums/resident.enum';

@Injectable()
export class ResidentsService {
  constructor(
    @InjectRepository(Resident)
    private readonly repo: Repository<Resident>,
    private readonly authsService: AuthsService,
  ) {}

  async create(dto: CreateResidentDto, currentUser: any) {
    // 1. Tìm kiếm xem cư dân đã tồn tại theo Số điện thoại hoặc Email hay chưa
    let existingResident: Resident | null = null;

    if (dto.phoneNumber) {
      existingResident = await this.repo.findOne({
        where: { phoneNumber: dto.phoneNumber },
      });
    }

    if (!existingResident && dto.email) {
      existingResident = await this.repo.findOne({
        where: { email: dto.email },
      });
    }

    if (existingResident) {
      const existingUser = dto.phoneNumber
        ? await this.authsService.findUserByPhoneNumber(dto.phoneNumber)
        : null;

      // 1. Nếu đã có tài khoản liên kết rồi
      if (existingResident.userId) {
        const targetUserId = dto.userId || (existingUser ? existingUser.id : null);
        
        if (targetUserId && existingResident.userId === targetUserId) {
          // Cập nhật thông tin nếu có thay đổi
          if (dto.fullName) existingResident.fullName = dto.fullName;
          if (dto.address) existingResident.address = dto.address;
          if (dto.latitude) existingResident.latitude = dto.latitude;
          if (dto.longitude) existingResident.longitude = dto.longitude;
          if (dto.numberOfMembers) existingResident.numberOfMembers = dto.numberOfMembers;
          if (dto.hasElderly) existingResident.hasElderly = dto.hasElderly;
          if (dto.hasChildren) existingResident.hasChildren = dto.hasChildren;
          if (dto.hasPregnantWomen) existingResident.hasPregnantWomen = dto.hasPregnantWomen;
          if (dto.hasChronicDisease) existingResident.hasChronicDisease = dto.hasChronicDisease;
          if (dto.houseType) existingResident.houseType = dto.houseType;
          if (dto.hasBusiness) existingResident.hasBusiness = dto.hasBusiness;
          
          const saved = await this.repo.save(existingResident);
          return {
            statusCode: 201,
            message: 'Liên kết tài khoản với hộ dân thành công (đã liên kết trước đó)',
            data: saved,
          };
        }

        throw new BadRequestException(
          'Số điện thoại hoặc Email đã tồn tại và đã được liên kết với tài khoản khác',
        );
      }

      // 2. Nếu chưa có tài khoản liên kết
      if (dto.createAccount !== false) {
        try {
          const targetUserId = dto.userId || (existingUser ? existingUser.id : null);
          let linkedUserId = targetUserId;

          if (!linkedUserId) {
            const user = await this.authsService.createAccount({
              fullName: dto.fullName || existingResident.fullName,
              phoneNumber: dto.phoneNumber || existingResident.phoneNumber,
              email: dto.email || existingResident.email,
              roleCode: RoleCode.RESIDENT,
              address: dto.address || existingResident.address,
            });
            linkedUserId = user.id;
          }

          // Liên kết tài khoản với cư dân hiện tại
          existingResident.userId = linkedUserId;

          // Cập nhật các thông số bổ sung nếu có
          if (dto.latitude) existingResident.latitude = dto.latitude;
          if (dto.longitude) existingResident.longitude = dto.longitude;
          if (dto.numberOfMembers)
            existingResident.numberOfMembers = dto.numberOfMembers;
          if (dto.address) existingResident.address = dto.address;
          if (dto.hasElderly) existingResident.hasElderly = dto.hasElderly;
          if (dto.hasChildren) existingResident.hasChildren = dto.hasChildren;
          if (dto.hasPregnantWomen) existingResident.hasPregnantWomen = dto.hasPregnantWomen;
          if (dto.hasChronicDisease) existingResident.hasChronicDisease = dto.hasChronicDisease;
          if (dto.houseType) existingResident.houseType = dto.houseType;
          if (dto.hasBusiness) existingResident.hasBusiness = dto.hasBusiness;

          const saved = await this.repo.save(existingResident);
          return {
            statusCode: 201,
            message: 'Liên kết tài khoản với hộ dân thành công',
            data: saved,
          };
        } catch (error) {
          console.error(
            '❌ Liên kết tài khoản cho hộ dân thất bại:',
            error.message,
          );
          throw new BadRequestException(
            'Tạo tài khoản liên kết thất bại: ' + error.message,
          );
        }
      } else {
        throw new BadRequestException(
          'Hộ dân với số điện thoại hoặc email này đã tồn tại',
        );
      }
    }

    // Luồng tạo hộ dân hoàn toàn mới
    const existingCode = await this.repo.findOne({
      where: { residentCode: dto.residentCode },
    });
    if (existingCode) throw new BadRequestException('Mã hộ dân đã tồn tại');

    const hr = this.repo.create({ ...dto, createdBy: currentUser.id });
    const saved = await this.repo.save(hr);

    // Tự động tạo hoặc liên kết tài khoản người dùng cho hộ dân
    if (dto.userId) {
      saved.userId = dto.userId;
      await this.repo.save(saved);
    } else if (dto.createAccount !== false) {
      try {
        // Kiểm tra xem số điện thoại đã có tài khoản trên hệ thống chưa
        const existingUser = dto.phoneNumber
          ? await this.authsService.findUserByPhoneNumber(dto.phoneNumber)
          : null;

        if (existingUser) {
          saved.userId = existingUser.id;
          await this.repo.save(saved);
        } else {
          const user = await this.authsService.createAccount({
            fullName: dto.fullName,
            phoneNumber: dto.phoneNumber,
            email: dto.email || '',
            roleCode: RoleCode.RESIDENT,
            address: dto.address,
          });

          // Cập nhật userId cho hộ dân
          saved.userId = user.id;
          await this.repo.save(saved);
        }
      } catch (error) {
        console.error(
          '❌ Tự động tạo/liên kết tài khoản cho hộ dân thất bại:',
          error.message,
        );
      }
    } else {
      // Trường hợp createAccount === false nhưng vẫn thử tự động liên kết nếu trùng số điện thoại
      try {
        const existingUser = dto.phoneNumber
          ? await this.authsService.findUserByPhoneNumber(dto.phoneNumber)
          : null;
        if (existingUser) {
          saved.userId = existingUser.id;
          await this.repo.save(saved);
        }
      } catch (error) {
        console.error('❌ Tự động liên kết tài khoản cũ thất bại:', error.message);
      }
    }

    return { statusCode: 201, message: 'Thêm hộ dân thành công', data: saved };
  }

  async findAll(
    page = 1,
    limit = 10,
    currentUser?: any,
    keyword?: string,
    houseType?: HouseType,
    hasElderly?: HasElderly,
    hasChildren?: HasChildren,
    hasPregnantWomen?: HasPregnant,
    hasChronicDisease?: HasSick,
    hasBusiness?: HasBusiness,
  ) {
    const baseWhere: any = {};

    // Nếu là MANAGER thì xem dữ liệu mình tạo hoặc hệ thống tạo (createdBy = 1)
    if (currentUser?.roleCode === RoleCode.MANAGER) {
      baseWhere.createdBy = In([currentUser.id, 1]);
    }
    if (houseType) {
      baseWhere.houseType = houseType;
    }
    if (hasElderly) {
      baseWhere.hasElderly = hasElderly;
    }
    if (hasChildren) {
      baseWhere.hasChildren = hasChildren;
    }
    if (hasPregnantWomen) {
      baseWhere.hasPregnantWomen = hasPregnantWomen;
    }
    if (hasChronicDisease) {
      baseWhere.hasChronicDisease = hasChronicDisease;
    }
    if (hasBusiness) {
      baseWhere.hasBusiness = hasBusiness;
    }

    let where: any = baseWhere;
    if (keyword) {
      where = [
        { ...baseWhere, fullName: Like(`%${keyword}%`) },
        { ...baseWhere, residentCode: Like(`%${keyword}%`) },
        { ...baseWhere, phoneNumber: Like(`%${keyword}%`) },
      ];
    }

    const [data, total] = await this.repo.findAndCount({
      where,
      skip: (page - 1) * limit,
      take: limit,
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
    const r = await this.repo.findOne({
      where: { id },
      relations: ['floodDamages'],
    }) as any;
    if (!r) throw new NotFoundException('Không tìm thấy người dân');

    if (r.userId) {
      try {
        r.user = await this.authsService.findUserById(r.userId);

        // Lấy danh sách phản ánh của người dùng
        const reflectionRepo = this.repo.manager.getRepository(
          require('../reflections/entities/reflection.entity').Reflection,
        );
        r.reflections = await reflectionRepo.find({
          where: { userId: r.userId },
          order: { createdAt: 'DESC' },
        });

        // Lấy danh sách thiệt hại liên quan (thuộc hộ dân hoặc thuộc phản ánh của người dùng)
        const floodDamageRepo = this.repo.manager.getRepository(
          require('../flood-damages/entities/flood-damage.entity').FloodDamage,
        );
        const extraDamages = await floodDamageRepo
          .createQueryBuilder('fd')
          .leftJoinAndSelect('fd.reflection', 'reflection')
          .leftJoinAndSelect('fd.household', 'household')
          .leftJoinAndSelect('fd.creator', 'creator')
          .where(
            'fd.householdId = :householdId OR reflection.userId = :userId OR fd.createdBy = :userId',
            { householdId: r.id, userId: r.userId },
          )
          .orderBy('fd.createdAt', 'DESC')
          .getMany();

        r.floodDamages = extraDamages;
      } catch (err) {
        console.error('Lỗi khi lấy dữ liệu liên kết tài khoản:', err);
      }
    } else {
      r.reflections = [];
    }
    return { statusCode: 200, message: 'Thành công', data: r };
  }

  async update(id: number, dto: UpdateResidentDto) {
    const r = await this.repo.findOne({ where: { id } });
    if (!r) throw new NotFoundException('Không tìm thấy người dân');
    Object.assign(r, dto);
    return {
      statusCode: 200,
      message: 'Cập nhật thành công',
      data: await this.repo.save(r),
    };
  }

  async remove(id: number) {
    const r = await this.repo.findOne({ where: { id } });
    if (!r) throw new NotFoundException('Không tìm thấy người dân');
    await this.repo.softDelete(id);
    return { statusCode: 200, message: 'Xóa thành công' };
  }

  async findMyResident(userId: number) {
    const r = await this.repo.findOne({
      where: { userId },
      relations: ['floodDamages'],
    });
    if (!r)
      throw new NotFoundException(
        'Không tìm thấy thông tin người dân cho tài khoản này',
      );
    return { statusCode: 200, message: 'Thành công', data: r };
  }

  async findNearby(lat: number, lng: number, radiusInMeters: number) {
    return await this.repo
      .createQueryBuilder('resident')
      .where(
        `6371000 * acos(cos(radians(:lat)) * cos(radians(resident.latitude)) * cos(radians(resident.longitude) - radians(:lng)) + sin(radians(:lat)) * sin(radians(resident.latitude))) <= :radius`,
        { lat, lng, radius: radiusInMeters },
      )
      .getMany();
  }
}
