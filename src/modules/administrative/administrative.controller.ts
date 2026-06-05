import { Controller, Get, Query } from '@nestjs/common';
import { AdministrativeService } from './administrative.service';
import { Public } from 'src/common/decorators/public.decorator';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';

@ApiTags('Địa chính (Administrative)')
@Public() // Đăng ký không cần token
@Controller()
export class AdministrativeController {
  constructor(private readonly service: AdministrativeService) {}

  @Get('provinces')
  @ApiOperation({ summary: 'Danh sách Tỉnh/Thành phố' })
  getProvinces() {
    return this.service.getProvinces();
  }

  @Get('seed-wards')
  @ApiOperation({ summary: 'Tự động đồng bộ xã/phường cho 34 tỉnh của bạn' })
  seedWards() {
    return this.service.seedWards();
  }

  @Get('wards')
  @ApiOperation({ summary: 'Danh sách Phường/Xã theo Tỉnh/Thành' })
  @ApiQuery({ name: 'provinceCode', type: Number })
  getWards(@Query('provinceCode') provinceCode: string) {
    return this.service.getWards(+provinceCode);
  }
}
