import { Body, Controller, Get, Post, Req, UnauthorizedException, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { AuthsService } from './auths.service';
import { ChangePasswordDto } from './dto/changePassword.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RegisterDto } from './dto/register.dto';
import { ResetPasswordDto } from './dto/resetPassword.dto';

@ApiTags('Xác thực (Auth)')
@Controller()
export class AuthsController {
  constructor(private readonly authsService: AuthsService) {}

  // POST /api/auth/register
  @Post('register')
  @ApiOperation({ summary: 'Đăng ký tài khoản' })
  @ApiBody({ type: RegisterDto })
  register(@Body() dto: RegisterDto) {
    return this.authsService.register(dto);
  }

  // POST /api/auth/login
  @Post('login')
  @ApiOperation({ summary: 'Đăng nhập' })
  @ApiBody({ type: LoginDto })
  login(@Body() dto: LoginDto) {
    return this.authsService.login(dto);
  }

  // POST /api/auth/refresh-token
  @Post('refresh-token')
  @ApiOperation({ summary: 'Làm mới access token' })
  refreshToken(@Body() dto: RefreshTokenDto) {
    return this.authsService.refreshToken(dto);
  }

  // GET /api/auth/me
  @Get('me')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Lấy thông tin người dùng hiện tại' })
  getMe(@CurrentUser() user: any) {
    return this.authsService.sendOtpResetPassword(user.id);
  }

  // POST /api/auth/send-otp-reset-password
@Post('send-otp-reset-password')
@ApiOperation({ summary: 'Gửi OTP về email để reset mật khẩu' })
@ApiBody({
  schema: {
    example: {
      phoneNumber: '0123456789',
    },
  },
})
sendOtpResetPassword(@Body('phoneNumber') phoneNumber: string) {
  return this.authsService.sendOtpResetPassword(phoneNumber);
}

// POST /api/auth/reset-password
@Post('reset-password')
@ApiOperation({ summary: 'Xác thực OTP và reset mật khẩu' })
@ApiBody({ type: ResetPasswordDto })
resetPassword(@Body() dto: ResetPasswordDto) {
  return this.authsService.resetPasswordWithOtp(dto);
}


  // POST /api/auth/change-password
  @Post('change-password')
  @UseGuards(JwtAuthGuard)                    // ← Phải có guard này
  async changePassword(
    @Req() req: any,                          // ← Lấy req để debug
    @Body() dto: ChangePasswordDto,
  ) {
    const userId = req.user?.sub || req.user?.id;   // Một số người đặt là id thay vì sub

    console.log('🔄 User từ JWT:', req.user);       // ← Log này rất quan trọng

    if (!userId) {
      throw new UnauthorizedException('Không tìm thấy thông tin người dùng từ token');
    }

    return this.authsService.changePassword(userId, dto);
  }

  // POST /api/auth/logout
  @Post('logout')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Đăng xuất và xóa thiết bị' })
  @ApiBody({
    schema: {
      example: {
        deviceId: '550e8400-e29b-41d4-a716-446655440000',
      },
    },
  })
  async logout(
    @Req() req: any,
    @Body('deviceId') deviceId?: string,
  ) {
    const userId = req.user?.sub || req.user?.id;

    if (!userId) {
      throw new UnauthorizedException('Không tìm thấy thông tin người dùng từ token');
    }

    return this.authsService.logout(userId, deviceId);
  }

  // GET /api/auth/devices
  @Get('devices')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Lấy danh sách thiết bị đang active' })
  async getUserDevices(@Req() req: any) {
    const userId = req.user?.sub || req.user?.id;

    if (!userId) {
      throw new UnauthorizedException('Không tìm thấy thông tin người dùng từ token');
    }

    return this.authsService.getUserActiveDevices(userId);
  }
}
