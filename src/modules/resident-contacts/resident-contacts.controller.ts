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
import { Roles } from 'src/common/decorators/roles.decorator';
import { RoleCode } from 'src/common/enums/role-code.enum';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import {
  BulkCreateResidentContactDto,
  CreateResidentContactDto,
  UpdateResidentContactDto,
} from './dto/resident-contact.dto';
import { ResidentContactsService } from './resident-contacts.service';

@ApiTags('Thông tin liên hệ (Resident Contacts)')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller()
export class ResidentContactsController {
  constructor(private readonly service: ResidentContactsService) {}

  /** Nhập hàng loạt từ Excel */
  @Post('bulk')
  @Roles(RoleCode.ADMIN, RoleCode.MANAGER, RoleCode.STAFF)
  @ApiOperation({ summary: 'Nhập hàng loạt thông tin liên hệ từ Excel' })
  bulkCreate(@Body() dto: BulkCreateResidentContactDto) {
    return this.service.bulkCreate(dto);
  }

  @Post()
  @Roles(RoleCode.ADMIN, RoleCode.MANAGER, RoleCode.STAFF)
  @ApiOperation({ summary: 'Thêm một thông tin liên hệ' })
  create(@Body() dto: CreateResidentContactDto) {
    return this.service.create(dto);
  }

  @Get()
  @Roles(RoleCode.ADMIN, RoleCode.MANAGER, RoleCode.STAFF)
  @ApiOperation({ summary: 'Danh sách thông tin liên hệ' })
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

  @Get('check/:cccd')
  @Roles(RoleCode.ADMIN, RoleCode.MANAGER, RoleCode.STAFF)
  @ApiOperation({ summary: 'Kiểm tra CCCD có trong danh sách liên hệ không' })
  async checkCccd(@Param('cccd') cccd: string) {
    const contact = await this.service.findByCccd(cccd);
    return {
      statusCode: 200,
      message: contact ? 'Tìm thấy' : 'Không tìm thấy',
      data: contact,
      isMatched: !!contact,
    };
  }

  @Patch(':id')
  @Roles(RoleCode.ADMIN, RoleCode.MANAGER)
  @ApiOperation({ summary: 'Cập nhật thông tin liên hệ' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateResidentContactDto,
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @Roles(RoleCode.ADMIN, RoleCode.MANAGER)
  @ApiOperation({ summary: 'Xóa thông tin liên hệ' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
