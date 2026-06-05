import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from './entities/comment.entity';
import { Reflection } from './entities/reflection.entity';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
    @InjectRepository(Reflection)
    private readonly reflectionRepository: Repository<Reflection>,
  ) {}

  // Tạo comment
  async create(
    reflectionId: number,
    userId: number,
    content: string,
    parentId?: number,
  ) {
    // Kiểm tra phản ánh tồn tại
    const reflection = await this.reflectionRepository.findOne({
      where: { id: reflectionId },
    });
    if (!reflection) {
      throw new NotFoundException('Không tìm thấy phản ánh');
    }

    // Kiểm tra parent comment nếu có
    if (parentId) {
      const parentComment = await this.commentRepository.findOne({
        where: { id: parentId, reflectionId },
      });
      if (!parentComment) {
        throw new BadRequestException('Không tìm thấy bình luận cha');
      }
    }

    const comment = this.commentRepository.create({
      reflectionId,
      userId,
      content,
      parentId,
    });

    const saved = await this.commentRepository.save(comment);

    // Load thông tin user
    const commentWithUser = await this.commentRepository.findOne({
      where: { id: saved.id },
      relations: ['user'],
    });

    return {
      statusCode: 201,
      message: 'Bình luận thành công',
      data: commentWithUser,
    };
  }

  // Lấy danh sách comments
  async findAll(reflectionId: number, page = 1, limit = 20) {
    // Kiểm tra phản ánh tồn tại
    const reflection = await this.reflectionRepository.findOne({
      where: { id: reflectionId },
    });
    if (!reflection) {
      throw new NotFoundException('Không tìm thấy phản ánh');
    }

    // Lấy comments gốc (không có parentId)
    const [data, total] = await this.commentRepository.findAndCount({
      where: { reflectionId, parentId: null },
      relations: ['user', 'replies', 'replies.user'],
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

  // Cập nhật comment
  async update(commentId: number, userId: number, content: string) {
    const comment = await this.commentRepository.findOne({
      where: { id: commentId },
    });

    if (!comment) {
      throw new NotFoundException('Không tìm thấy bình luận');
    }

    // Chỉ chủ sở hữu mới được sửa
    if (comment.userId !== userId) {
      throw new BadRequestException('Bạn không có quyền sửa bình luận này');
    }

    comment.content = content;
    const saved = await this.commentRepository.save(comment);

    return {
      statusCode: 200,
      message: 'Cập nhật thành công',
      data: saved,
    };
  }

  // Xóa comment
  async remove(commentId: number, userId: number, isAdmin = false) {
    const comment = await this.commentRepository.findOne({
      where: { id: commentId },
    });

    if (!comment) {
      throw new NotFoundException('Không tìm thấy bình luận');
    }

    // Chỉ chủ sở hữu hoặc admin mới được xóa
    if (comment.userId !== userId && !isAdmin) {
      throw new BadRequestException('Bạn không có quyền xóa bình luận này');
    }

    await this.commentRepository.softDelete(commentId);

    return {
      statusCode: 200,
      message: 'Xóa bình luận thành công',
    };
  }

  // Đếm tổng số comments
  async getCommentCount(reflectionId: number): Promise<number> {
    return await this.commentRepository.count({
      where: { reflectionId },
    });
  }
}
