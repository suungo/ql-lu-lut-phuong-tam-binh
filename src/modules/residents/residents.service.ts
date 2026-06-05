import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RoleCode } from 'src/common/enums/role-code.enum';
import { Like, Repository } from 'typeorm';
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
      // Nếu đã có tài khoản liên kết rồi thì báo trùng lỗi
      if (existingResident.userId) {
        throw new BadRequestException(
          'Số điện thoại hoặc Email đã tồn tại và đã được liên kết với tài khoản',
        );
      }

      // Nếu chưa có tài khoản liên kết (do quản lý thêm trước đó mà chọn không tạo tài khoản)
      // Và lần này yêu cầu có tạo tài khoản (đăng ký từ app di động hoặc webhook duyệt đơn)
      if (dto.createAccount !== false) {
        try {
          const user = await this.authsService.createAccount({
            fullName: dto.fullName || existingResident.fullName,
            phoneNumber: dto.phoneNumber || existingResident.phoneNumber,
            email: dto.email || existingResident.email,
            roleCode: RoleCode.RESIDENT,
            address: dto.address || existingResident.address,
          });

          // Liên kết tài khoản mới với cư dân hiện tại
          existingResident.userId = user.id;

          // Cập nhật tọa độ chính xác và các thông số bổ sung nếu có
          if (dto.latitude) existingResident.latitude = dto.latitude;
          if (dto.longitude) existingResident.longitude = dto.longitude;
          if (dto.numberOfMembers)
            existingResident.numberOfMembers = dto.numberOfMembers;
          if (dto.address) existingResident.address = dto.address;

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

    // Tự động tạo tài khoản người dùng cho hộ dân nếu được yêu cầu
    if (dto.createAccount !== false) {
      try {
        const user = await this.authsService.createAccount({
          fullName: dto.fullName,
          phoneNumber: dto.phoneNumber,
          email: dto.email,
          roleCode: RoleCode.RESIDENT,
          address: dto.address,
        });

        // Cập nhật userId cho hộ dân
        saved.userId = user.id;
        await this.repo.save(saved);
      } catch (error) {
        console.error(
          '❌ Tự động tạo tài khoản cho hộ dân thất bại:',
          error.message,
        );
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

    // Nếu là MANAGER thì chỉ xem dữ liệu mình tạo
    if (currentUser?.roleCode === RoleCode.MANAGER) {
      baseWhere.createdBy = currentUser.id;
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
    });
    if (!r) throw new NotFoundException('Không tìm thấy cư dân');
    return { statusCode: 200, message: 'Thành công', data: r };
  }

  async update(id: number, dto: UpdateResidentDto) {
    const r = await this.repo.findOne({ where: { id } });
    if (!r) throw new NotFoundException('Không tìm thấy cư dân');
    Object.assign(r, dto);
    return {
      statusCode: 200,
      message: 'Cập nhật thành công',
      data: await this.repo.save(r),
    };
  }

  async remove(id: number) {
    const r = await this.repo.findOne({ where: { id } });
    if (!r) throw new NotFoundException('Không tìm thấy cư dân');
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
        'Không tìm thấy thông tin cư dân cho tài khoản này',
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
