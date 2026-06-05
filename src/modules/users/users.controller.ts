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
} from '@nestjs/common';
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

  @Get()
  @UseGuards(RolesGuard)
  @Roles(RoleCode.ADMIN, RoleCode.MANAGER)
  @ApiOperation({ summary: 'Danh sách người dùng' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'keyword', required: false })
  findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('keyword') keyword?: string,
  ) {
    return this.service.findAll(+page, +limit, keyword);
  }

  @Get('role/:roleCode')
  @UseGuards(RolesGuard)
  @Roles(RoleCode.ADMIN, RoleCode.MANAGER, RoleCode.INSPECTOR)
  @ApiOperation({ summary: 'Danh sách người dùng theo Role' })
  findByRole(@Param('roleCode') roleCode: RoleCode) {
    return this.service.findByRoleCode(roleCode);
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

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(RoleCode.ADMIN)
  @ApiOperation({ summary: 'Xóa người dùng (Admin)' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
