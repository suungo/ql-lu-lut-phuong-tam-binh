import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Query,
  UseGuards,
  Post,
  Body,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RoleCode } from 'src/common/enums/role-code.enum';

@ApiTags('Thông báo (Notifications)')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class NotificationsController {
  constructor(private readonly service: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'Danh sách thông báo của tôi' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  findAll(
    @CurrentUser() user: any,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    return this.service.findByUser(user.id, +page, +limit);
  }

  @Get('vapid-public-key')
  @ApiOperation({ summary: 'Lấy khóa công khai VAPID cho Web Push' })
  getVapidPublicKey() {
    return this.service.getVapidPublicKey();
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Số thông báo chưa đọc' })
  countUnread(@CurrentUser() user: any) {
    return this.service.countUnread(user.id);
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Đánh dấu thông báo đã đọc' })
  markRead(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: any) {
    return this.service.markRead(id, user.id);
  }

  @Patch('read-all')
  @ApiOperation({ summary: 'Đánh dấu tất cả đã đọc' })
  markAllRead(@CurrentUser() user: any) {
    return this.service.markAllRead(user.id);
  }

  @Get('admin-list')
  @UseGuards(RolesGuard)
  @Roles(RoleCode.ADMIN, RoleCode.MANAGER)
  @ApiOperation({
    summary: 'Danh sách tất cả thông báo hệ thống (Admin/Manager)',
  })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  findAdminList(@Query('page') page = 1, @Query('limit') limit = 10) {
    return this.service.findAllSystem(+page, +limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Chi tiết thông báo' })
  findOne(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: any) {
    return this.service.findOne(id, user.id);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(RoleCode.ADMIN, RoleCode.MANAGER)
  @ApiOperation({ summary: 'Gửi thông báo mới (Admin/Manager)' })
  createNotification(
    @Body()
    dto: {
      userId?: number;
      roleCode?: string;
      title: string;
      content: string;
    },
  ) {
    return this.service.createBulkOrSingle(dto);
  }
}
