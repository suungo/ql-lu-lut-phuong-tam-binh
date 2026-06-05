import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Conversation } from './entities/conversation.entity';
import { Message } from './entities/message.entity';

@Injectable()
export class ChatsService {
  constructor(
    @InjectRepository(Conversation)
    private readonly convRepo: Repository<Conversation>,
    @InjectRepository(Message)
    private readonly msgRepo: Repository<Message>,
  ) {}

  async getOrCreateConversation(user1Id: number, user2Id: number) {
    // Tìm conversation 1-1 giữa 2 user
    const existing = await this.convRepo
      .createQueryBuilder('c')
      .innerJoin(
        'conversation_participants',
        'cp1',
        'cp1.conversation_id = c.id AND cp1.user_id = :u1',
        { u1: user1Id },
      )
      .innerJoin(
        'conversation_participants',
        'cp2',
        'cp2.conversation_id = c.id AND cp2.user_id = :u2',
        { u2: user2Id },
      )
      .where('c.isGroup = false')
      .getOne();

    if (existing)
      return { statusCode: 200, message: 'Thành công', data: existing };

    const conv = await this.convRepo.save(
      this.convRepo.create({ isGroup: false, creatorId: user1Id }),
    );
    return {
      statusCode: 201,
      message: 'Tạo cuộc trò chuyện thành công',
      data: conv,
    };
  }

  async getMyConversations(userId: number) {
    const convs = await this.convRepo.find({
      where: { creatorId: userId },
      relations: ['messages', 'creator'],
      order: { updatedAt: 'DESC' },
    });
    return { statusCode: 200, message: 'Thành công', data: convs };
  }

  async getMessages(conversationId: number, page = 1, limit = 20) {
    const [data, total] = await this.msgRepo.findAndCount({
      where: { conversationId },
      relations: ['sender'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return {
      statusCode: 200,
      message: 'Thành công',
      data: data.reverse(),
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async sendMessage(conversationId: number, senderId: number, content: string) {
    const conv = await this.convRepo.findOne({ where: { id: conversationId } });
    if (!conv) throw new NotFoundException('Không tìm thấy cuộc trò chuyện');
    const msg = await this.msgRepo.save(
      this.msgRepo.create({ conversationId, senderId, content }),
    );
    return msg;
  }
}
