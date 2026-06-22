import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RoleCode } from 'src/common/enums/role-code.enum';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { CreateFloodDamageDto } from './dto/create-flood-damage.dto';
import { FilterFloodDamageDto } from './dto/filter-flood-damage.dto';
import { UpdateFloodDamageDto } from './dto/update-flood-damage.dto';
import { DamageStatus } from './enums/damage-status.enum';
import { FloodDamagesService } from './floodDamages.service';

@ApiTags('Flood Damages')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('flood-damages')
export class FloodDamagesController {
  constructor(private readonly floodDamagesService: FloodDamagesService) {}

  // ➕ Tạo thiệt hại mới
  @Post()
  @ApiOperation({ summary: 'Tạo thiệt hại mới' })
  async create(@Body() dto: CreateFloodDamageDto, @Request() req) {
    const userId = req.user?.sub;
    const damage = await this.floodDamagesService.create(dto, userId);
    return { statusCode: 201, data: damage };
  }

  // 📋 Lấy danh sách thiệt hại
  @Get()
  @ApiOperation({ summary: 'Lấy danh sách thiệt hại (có filter, pagination)' })
  findAll(@Query() dto: FilterFloodDamageDto, @Request() req) {
    return this.floodDamagesService.findAll(dto, req.user);
  }

  // 🔍 Chi tiết thiệt hại
  @Get(':id')
  @ApiOperation({ summary: 'Lấy chi tiết thiệt hại theo ID' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const damage = await this.floodDamagesService.findOne(id);
    return { statusCode: 200, data: damage };
  }

  // ✏️ Cập nhật thiệt hại
  @Put(':id')
  @ApiOperation({ summary: 'Cập nhật thiệt hại' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateFloodDamageDto,
  ) {
    return this.floodDamagesService.update(id, dto);
  }

  // 🗑️ Xóa thiệt hại
  @Delete(':id')
  @ApiOperation({ summary: 'Xóa thiệt hại' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.floodDamagesService.remove(id);
  }

  // 📊 Thống kê theo reflection
  @Get('stats/by-reflection/:reflectionId')
  @ApiOperation({ summary: 'Thống kê thiệt hại theo phản ánh' })
  getStatsByReflection(
    @Param('reflectionId', ParseIntPipe) reflectionId: number,
  ) {
    return this.floodDamagesService.getStatsByReflection(reflectionId);
  }

  // 🔄 Cập nhật trạng thái thiệt hại
  @Put('status/:id')
  @Roles(RoleCode.ADMIN, RoleCode.MANAGER, RoleCode.OFFICER)
  @ApiOperation({ summary: 'Cập nhật trạng thái thiệt hại' })
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('status') status: DamageStatus,
    @Request() req,
  ) {
    const reviewerId = req.user?.sub;
    return this.floodDamagesService.updateStatus(id, status, reviewerId);
  }
}
