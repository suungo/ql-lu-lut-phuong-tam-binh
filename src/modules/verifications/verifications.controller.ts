import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RoleCode } from 'src/common/enums/role-code.enum';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import {
  CreateVerificationDto,
  UpdateVerificationDto,
} from './dto/verification.dto';
import { VerificationStatus } from './enums/verification.enum';
import { VerificationsService } from './verifications.service';
import { User } from '../users/entities/user.entity';

@ApiTags('Xác minh (Verifications)')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class VerificationsController {
  constructor(private readonly service: VerificationsService) {}

  @Post()
  @ApiOperation({ summary: 'Gửi yêu cầu xác minh' })
  create(@Body() dto: CreateVerificationDto, @CurrentUser() user: User) {
    return this.service.create(dto, user.id);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(RoleCode.ADMIN, RoleCode.STAFF, RoleCode.MANAGER)
  @ApiOperation({ summary: 'Danh sách yêu cầu xác minh' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'status', enum: VerificationStatus, required: false })
  findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('status') status?: VerificationStatus,
    @CurrentUser() user?: User,
  ) {
    // Nếu là STAFF, chỉ cho phép xem các yêu cầu đã được xác minh xong (APPROVED)
    // Ngăn chặn việc STAFF xem các yêu cầu đang chờ (PENDING)
    if (user?.role?.roleCode === RoleCode.STAFF) {
      if (!status || status === VerificationStatus.PENDING) {
        status = VerificationStatus.APPROVED;
      }
    }

    return this.service.findAll(+page, +limit, status);
  }

  @Get('my')
  @ApiOperation({ summary: 'Yêu cầu xác minh của tôi' })
  findMy(
    @CurrentUser() user: User,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    return this.service.findMyVerifications(user.id, +page, +limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Chi tiết yêu cầu xác minh' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(RoleCode.ADMIN, RoleCode.MANAGER)
  @ApiOperation({ summary: 'Duyệt / Từ chối / Hoàn thành yêu cầu xác minh' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateVerificationDto,
    @CurrentUser() user: any,
  ) {
    return this.service.update(id, dto, user.id);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(RoleCode.ADMIN)
  @ApiOperation({ summary: 'Xóa yêu cầu xác minh' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
