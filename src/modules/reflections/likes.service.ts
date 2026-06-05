import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Like } from './entities/like.entity';
import { Reflection } from './entities/reflection.entity';

@Injectable()
export class LikesService {
  constructor(
    @InjectRepository(Like)
    private readonly likeRepository: Repository<Like>,
    @InjectRepository(Reflection)
    private readonly reflectionRepository: Repository<Reflection>,
  ) {}

  // Like/unlike phản ánh (toggle)
  async toggleLike(reflectionId: number, userId: number) {
    // Kiểm tra phản ánh tồn tại
    const reflection = await this.reflectionRepository.findOne({
      where: { id: reflectionId },
    });
    if (!reflection) {
      throw new NotFoundException('Không tìm thấy phản ánh');
    }

    // Kiểm tra đã like chưa
    const existingLike = await this.likeRepository.findOne({
      where: { reflectionId, userId },
    });

    if (existingLike) {
      // Unlike: Xóa like
      await this.likeRepository.remove(existingLike);
      const totalLikes = await this.getLikeCount(reflectionId);
      return {
        statusCode: 200,
        message: 'Đã bỏ thích',
        data: { liked: false, totalLikes },
      };
    }

    // Like: Tạo mới
    const like = this.likeRepository.create({
      reflectionId,
      userId,
    });
    await this.likeRepository.save(like);

    const totalLikes = await this.getLikeCount(reflectionId);
    return {
      statusCode: 201,
      message: 'Đã thích',
      data: { liked: true, totalLikes },
    };
  }

  // Kiểm tra user đã like chưa
  async checkLiked(reflectionId: number, userId: number) {
    const like = await this.likeRepository.findOne({
      where: { reflectionId, userId },
    });
    return { liked: !!like };
  }

  // Đếm tổng số like
  async getLikeCount(reflectionId: number): Promise<number> {
    return await this.likeRepository.count({
      where: { reflectionId },
    });
  }

  // Lấy danh sách users đã like
  async getLikes(reflectionId: number, page = 1, limit = 20) {
    const [data, total] = await this.likeRepository.findAndCount({
      where: { reflectionId },
      relations: ['user'],
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
}
