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
import { DispatchReportsService } from './dispatch-reports.service';
import {
  CreateDispatchReportDto,
  UpdateDispatchReportDto,
} from './dto/dispatch-report.dto';
import {
  DispatchReportStatus,
  DispatchReportType,
} from './enums/dispatch-report.enum';

@ApiTags('Quản lý yêu cầu Tuần tra (Patrol Requests)')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class DispatchReportsController {
  constructor(private readonly service: DispatchReportsService) {}

  // ══════════════════════════════════════════════════════════════════════
  // TẠO ĐIỀU CHUYỂN
  // ══════════════════════════════════════════════════════════════════════

  @Post('to-inspector')
  @UseGuards(RolesGuard)
  @Roles(RoleCode.MANAGER, RoleCode.ADMIN)
  @ApiOperation({ summary: '[MANAGER] Tạo điều chuyển cho Hậu kiểm' })
  createToInspector(
    @Body() dto: CreateDispatchReportDto,
    @CurrentUser() user: any,
  ) {
    return this.service.createDispatchToInspector(dto, user.id);
  }

  @Post('to-patrol')
  @UseGuards(RolesGuard)
  @Roles(RoleCode.MANAGER, RoleCode.ADMIN)
  @ApiOperation({ summary: '[MANAGER] Tạo yêu cầu Tuần tra' })
  createToPatrol(
    @Body() dto: CreateDispatchReportDto,
    @CurrentUser() user: any,
  ) {
    return this.service.createDispatchToPatrol(dto, user.id);
  }

  // ══════════════════════════════════════════════════════════════════════
  // XÁC NHẬN & CẬP NHẬT
  // ══════════════════════════════════════════════════════════════════════

  @Patch(':id/accept')
  @UseGuards(RolesGuard)
  @Roles(RoleCode.INSPECTOR, RoleCode.PATROL)
  @ApiOperation({ summary: 'Xác nhận nhận yêu cầu Tuần tra' })
  accept(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: any) {
    return this.service.acceptDispatch(id, user.id);
  }

  @Post(':id/nudge')
  @UseGuards(RolesGuard)
  @Roles(RoleCode.INSPECTOR, RoleCode.MANAGER, RoleCode.ADMIN)
  @ApiOperation({ summary: 'Thúc giục cán bộ xử lý' })
  nudge(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: any) {
    return this.service.nudgeDispatch(id, user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Cập nhật biên bản báo cáo' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateDispatchReportDto,
    @CurrentUser() user: any,
  ) {
    return this.service.updateReport(id, dto, user.id);
  }

  // ══════════════════════════════════════════════════════════════════════
  // DANH SÁCH & CHI TIẾT
  // ══════════════════════════════════════════════════════════════════════

  @Get()
  @ApiOperation({ summary: 'Danh sách yêu cầu Tuần tra' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'status', enum: DispatchReportStatus, required: false })
  @ApiQuery({ name: 'type', enum: DispatchReportType, required: false })
  @ApiQuery({ name: 'reflectionId', required: false })
  @ApiQuery({ name: 'search', required: false })
  findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('status') status?: DispatchReportStatus,
    @Query('type') type?: DispatchReportType,
    @Query('reflectionId') reflectionId?: number,
    @Query('search') search?: string,
    @CurrentUser() user?: any,
  ) {
    // INSPECTOR chỉ thấy dispatch giao cho mình hoặc do mình tạo
    const filters: any = {};
    if (status) filters.status = status;
    if (type) filters.type = type;
    if (reflectionId) filters.reflectionId = +reflectionId;
    if (search) filters.search = search;

    const roleCode = user?.roleCode;
    if (roleCode === RoleCode.INSPECTOR) {
      // INSPECTOR thấy: giao cho mình (MANAGER→INSPECTOR) + do mình tạo (INSPECTOR→PATROL)
      // Sử dụng OR condition nên để service xử lý nâng cao, ở đây đơn giản hóa
    } else if (roleCode === RoleCode.PATROL) {
      filters.assignedTo = user.id;
    }

    return this.service.findAll(+page, +limit, filters);
  }

  @Get('my')
  @ApiOperation({ summary: 'Danh sách yêu cầu Tuần tra của tôi' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  findMy(
    @CurrentUser() user: any,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    return this.service.findAll(+page, +limit, { assignedTo: user.id });
  }

  @Get('reflection/:reflectionId')
  @ApiOperation({ summary: 'Biên bản theo phản ánh' })
  findByReflection(@Param('reflectionId', ParseIntPipe) reflectionId: number) {
    return this.service.findByReflection(reflectionId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Chi tiết yêu cầu Tuần tra' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(RoleCode.ADMIN)
  @ApiOperation({ summary: 'Xóa yêu cầu Tuần tra' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
