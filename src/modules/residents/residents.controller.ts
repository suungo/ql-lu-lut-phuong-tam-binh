import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RoleCode } from 'src/common/enums/role-code.enum';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { CreateResidentDto, UpdateResidentDto } from './dto/resident.dto';
import { HasBusiness, HasChildren, HasElderly, HasPregnant, HasSick, HouseType } from './enums/resident.enum';
import { ResidentsService } from './residents.service';

@ApiTags('Cư dân (Residents)')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller()
export class ResidentsController {
  constructor(private readonly service: ResidentsService) {}

  @Post()
  @Roles(RoleCode.ADMIN, RoleCode.MANAGER, RoleCode.STAFF)
  @ApiOperation({ summary: 'Thêm cư dân mới' })
  create(@Body() dto: CreateResidentDto, @CurrentUser() user: any) { 
    return this.service.create(dto, user); 
  }

  @Get()
  @ApiOperation({ summary: 'Danh sách cư dân' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'keyword', required: false })
  @ApiQuery({ name: 'houseType', required: false })
  @ApiQuery({ name: 'hasElderly', required: false })
  @ApiQuery({ name: 'hasChildren', required: false })
  @ApiQuery({ name: 'hasPregnantWomen', required: false })
  @ApiQuery({ name: 'hasChronicDisease', required: false })
  @ApiQuery({ name: 'hasBusiness', required: false })
  findAll(
    @CurrentUser() user: any,
    @Query('page') page = 1, 
    @Query('limit') limit = 10, 
    @Query('keyword') keyword?: string, 
    @Query('houseType') houseType?: HouseType, 
    @Query('hasElderly') hasElderly?: HasElderly, 
    @Query('hasChildren') hasChildren?: HasChildren, 
    @Query('hasPregnantWomen') hasPregnantWomen?: HasPregnant, 
    @Query('hasChronicDisease') hasChronicDisease?: HasSick, 
    @Query('hasBusiness') hasBusiness?: HasBusiness
  ) {
    return this.service.findAll(+page, +limit, user, keyword, houseType, hasElderly, hasChildren, hasPregnantWomen, hasChronicDisease, hasBusiness);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Chi tiết cư dân' })
  findOne(@Param('id', ParseIntPipe) id: number) { return this.service.findOne(id); }

  @Patch(':id')
  @Roles(RoleCode.ADMIN, RoleCode.MANAGER)
  @ApiOperation({ summary: 'Cập nhật cư dân' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateResidentDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @Roles(RoleCode.ADMIN, RoleCode.MANAGER)
  @ApiOperation({ summary: 'Xóa cư dân' })
  remove(@Param('id', ParseIntPipe) id: number) { return this.service.remove(id); }
}
