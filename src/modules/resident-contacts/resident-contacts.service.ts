import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import {
  BulkCreateResidentContactDto,
  CreateResidentContactDto,
  UpdateResidentContactDto,
} from './dto/resident-contact.dto';
import { ResidentContact } from './entities/resident-contact.entity';

@Injectable()
export class ResidentContactsService {
  constructor(
    @InjectRepository(ResidentContact)
    private readonly repo: Repository<ResidentContact>,
  ) {}

  /** Nhập hàng loạt từ Excel — bỏ qua bản ghi trùng CCCD */
  async bulkCreate(dto: BulkCreateResidentContactDto) {
    const results = { success: 0, skipped: 0, errors: [] as string[] };

    const list = Array.isArray(dto)
      ? dto
      : (dto && Array.isArray(dto.contacts) ? dto.contacts : []);

    for (const contact of list) {
      if (!contact.cccd) {
        results.skipped++;
        continue;
      }
      const existing = await this.repo.findOne({
        where: { cccd: contact.cccd },
      });
      if (existing) {
        // Cập nhật thông tin nếu đã tồn tại
        Object.assign(existing, contact);
        await this.repo.save(existing);
        results.success++;
        continue;
      }
      try {
        await this.repo.save(this.repo.create(contact));
        results.success++;
      } catch (e) {
        results.errors.push(`CCCD ${contact.cccd}: ${e.message}`);
      }
    }

    return {
      statusCode: 201,
      message: `Nhập ${results.success} liên hệ thành công${results.skipped ? `, bỏ qua ${results.skipped}` : ''}`,
      data: results,
    };
  }

  async create(dto: CreateResidentContactDto) {
    const existing = await this.repo.findOne({ where: { cccd: dto.cccd } });
    if (existing) {
      throw new BadRequestException('Số CCCD đã tồn tại trong danh sách liên hệ');
    }
    const saved = await this.repo.save(this.repo.create(dto));
    return { statusCode: 201, message: 'Thêm thành công', data: saved };
  }

  async findAll(page = 1, limit = 10, keyword?: string) {
    const where: any = keyword
      ? [
          { cccd: Like(`%${keyword}%`) },
          { phoneNumber: Like(`%${keyword}%`) },
          { email: Like(`%${keyword}%`) },
        ]
      : {};

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

  /** Dùng để đối chiếu CCCD khi người dân đăng ký */
  async findByCccd(cccd: string): Promise<ResidentContact | null> {
    if (!cccd) return null;
    return this.repo.findOne({ where: { cccd } });
  }

  async update(id: number, dto: UpdateResidentContactDto) {
    const r = await this.repo.findOne({ where: { id } });
    if (!r) throw new NotFoundException('Không tìm thấy thông tin liên hệ');
    Object.assign(r, dto);
    return {
      statusCode: 200,
      message: 'Cập nhật thành công',
      data: await this.repo.save(r),
    };
  }

  async remove(id: number) {
    const r = await this.repo.findOne({ where: { id } });
    if (!r) throw new NotFoundException('Không tìm thấy thông tin liên hệ');
    await this.repo.softDelete(id);
    return { statusCode: 200, message: 'Xóa thành công' };
  }
}
