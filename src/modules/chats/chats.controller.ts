import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ChatsService } from './chats.service';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

class SendMessageDto {
  @ApiProperty() @IsString() @IsNotEmpty() content: string;
}

@ApiTags('Chat (Chats)')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class ChatsController {
  constructor(private readonly service: ChatsService) {}

  @Post('conversation/:userId')
  @ApiOperation({ summary: 'Tạo hoặc lấy cuộc trò chuyện với user khác' })
  getOrCreate(
    @Param('userId', ParseIntPipe) userId: number,
    @CurrentUser() user: any,
  ) {
    return this.service.getOrCreateConversation(user.id, userId);
  }

  @Get('conversations')
  @ApiOperation({ summary: 'Danh sách cuộc trò chuyện của tôi' })
  getMyConversations(@CurrentUser() user: any) {
    return this.service.getMyConversations(user.id);
  }

  @Get(':conversationId/messages')
  @ApiOperation({ summary: 'Tin nhắn trong cuộc trò chuyện' })
  getMessages(
    @Param('conversationId', ParseIntPipe) conversationId: number,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    return this.service.getMessages(conversationId, +page, +limit);
  }

  @Post(':conversationId/messages')
  @ApiOperation({ summary: 'Gửi tin nhắn (REST fallback)' })
  @ApiBody({ type: SendMessageDto })
  sendMessage(
    @Param('conversationId', ParseIntPipe) conversationId: number,
    @Body() dto: SendMessageDto,
    @CurrentUser() user: any,
  ) {
    return this.service.sendMessage(conversationId, user.id, dto.content);
  }
}
