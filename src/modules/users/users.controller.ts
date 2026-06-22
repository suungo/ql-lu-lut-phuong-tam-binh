import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Query,
  UseGuards,
  Post,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UsersService } from './users.service';
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

@ApiTags('Người dùng (Users)')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class UsersController {
  constructor(private readonly service: UsersService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(RoleCode.ADMIN, RoleCode.MANAGER)
  @ApiOperation({ summary: 'Tạo người dùng mới (Admin/Manager)' })
  create(@Body() dto: CreateUserDto) {
    return this.service.create(dto);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(RoleCode.ADMIN, RoleCode.MANAGER)
  @ApiOperation({ summary: 'Danh sách người dùng' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'keyword', required: false })
  @ApiQuery({ name: 'roleCode', enum: RoleCode, required: false })
  findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('keyword') keyword?: string,
    @Query('roleCode') roleCode?: RoleCode,
  ) {
    return this.service.findAll(+page, +limit, keyword, roleCode);
  }

  @Get('work-quality')
  @UseGuards(RolesGuard)
  @Roles(RoleCode.ADMIN, RoleCode.MANAGER)
  @ApiOperation({ summary: 'Chất lượng công việc của nhân sự (trừ quản lý/người dân)' })
  getWorkQuality(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('keyword') keyword?: string,
  ) {
    return this.service.getStaffWorkQuality(+page, +limit, keyword);
  }

  @Get('role/:roleCode')
  @UseGuards(RolesGuard)
  @Roles(RoleCode.ADMIN, RoleCode.MANAGER, RoleCode.INSPECTOR)
  @ApiOperation({ summary: 'Danh sách người dùng theo Role' })
  findByRole(@Param('roleCode') roleCode: RoleCode) {
    return this.service.findByRoleCode(roleCode);
  }

  @Get('reputation-history')
  @ApiOperation({ summary: 'Lịch sử điểm uy tín của tôi' })
  getMyReputationHistory(@CurrentUser() user: any) {
    return this.service.getReputationHistory(user.id);
  }

  // GET /api/users/me — khớp client
  @Get('me')
  @ApiOperation({ summary: 'Thông tin hồ sơ của tôi' })
  getProfile(@CurrentUser() user: any) {
    return this.service.findOne(user.id);
  }

  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles(RoleCode.ADMIN, RoleCode.MANAGER)
  @ApiOperation({ summary: 'Chi tiết người dùng theo ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  // PATCH /api/users/me — khớp client
  @Patch('me')
  @ApiOperation({ summary: 'Cập nhật hồ sơ cá nhân' })
  updateProfile(@CurrentUser() user: any, @Body() dto: any) {
    return this.service.updateProfile(user.id, dto);
  }

  @Patch(':id/reputation')
  @UseGuards(RolesGuard)
  @Roles(RoleCode.ADMIN, RoleCode.MANAGER)
  @ApiOperation({ summary: 'Cập nhật điểm uy tín (Admin/Manager)' })
  updateReputation(
    @Param('id', ParseIntPipe) id: number,
    @Body('reputationPoints', ParseIntPipe) reputationPoints: number,
  ) {
    return this.service.updateReputation(id, reputationPoints);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(RoleCode.ADMIN)
  @ApiOperation({ summary: 'Xóa người dùng (Admin)' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }

  @Get('deleted-accounts')
  @UseGuards(RolesGuard)
  @Roles(RoleCode.ADMIN)
  @ApiOperation({ summary: 'Danh sách người dùng đã bị xóa mềm' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'keyword', required: false })
  findDeleted(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('keyword') keyword?: string,
  ) {
    return this.service.findDeleted(+page, +limit, keyword);
  }

  @Patch(':id/restore')
  @UseGuards(RolesGuard)
  @Roles(RoleCode.ADMIN)
  @ApiOperation({ summary: 'Khôi phục người dùng bị xóa mềm' })
  restore(@Param('id', ParseIntPipe) id: number) {
    return this.service.restoreDeleted(id);
  }

  @Patch(':id/suspend')
  @UseGuards(RolesGuard)
  @Roles(RoleCode.ADMIN, RoleCode.MANAGER)
  @ApiOperation({ summary: 'Tạm ngừng hoạt động người dùng' })
  suspend(@Param('id', ParseIntPipe) id: number) {
    return this.service.suspendUser(id);
  }

  @Patch(':id/unsuspend')
  @UseGuards(RolesGuard)
  @Roles(RoleCode.ADMIN, RoleCode.MANAGER)
  @ApiOperation({ summary: 'Kích hoạt lại người dùng tạm ngừng' })
  unsuspend(@Param('id', ParseIntPipe) id: number) {
    return this.service.activateUser(id);
  }
}
