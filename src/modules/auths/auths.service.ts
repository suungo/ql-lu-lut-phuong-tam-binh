import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { RoleCode } from 'src/common/enums/role-code.enum';
import { Role } from 'src/modules/roles/entities/role.entity';
import { Device } from 'src/modules/users/entities/device.entity';
import { User } from 'src/modules/users/entities/user.entity';
import { Repository } from 'typeorm';
import { MailService } from '../mail/mail.service';
import { Verification } from '../verifications/entities/verification.entity';
import { ChangePasswordDto } from './dto/changePassword.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RegisterDto } from './dto/register.dto';
import { ResetPasswordDto } from './dto/resetPassword.dto';

@Injectable()
export class AuthsService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(Device)
    private readonly deviceRepository: Repository<Device>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private mailService: MailService,
    @InjectRepository(Verification)
    private verificationRepository: Repository<Verification>,
  ) {}
 

  async register(dto: RegisterDto) {
    const existing = await this.userRepository.findOne({
      where: { phoneNumber: dto.phoneNumber },
    });
    if (existing) {
      throw new BadRequestException('Số điện thoại đã được sử dụng');
    }

    const residentRole = await this.roleRepository.findOne({
      where: { roleCode: RoleCode.MANAGER },
    });

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = this.userRepository.create({
      fullName: dto.fullName,
      phoneNumber: dto.phoneNumber,
      email: dto.email,
      password: hashedPassword,
      roleId: residentRole?.id,
    });

    const saved = await this.userRepository.save(user);

    const { password: _p, ...result } = saved;
    return {
      statusCode: 201,
      message: 'Đăng ký thành công',
      data: result,
    };
  }

  async createAccount(data: {
    fullName: string;
    phoneNumber: string;
    email: string;
    roleCode: RoleCode;
  }) {
    // Kiểm tra xem số điện thoại hoặc email đã tồn tại chưa
    const existing = await this.userRepository.findOne({
      where: [{ phoneNumber: data.phoneNumber }, { email: data.email }],
    });
    if (existing) {
      throw new BadRequestException(
        'Số điện thoại hoặc Email đã được sử dụng cho một tài khoản khác',
      );
    }

    const role = await this.roleRepository.findOne({
      where: { roleCode: data.roleCode },
    });
    if (!role) throw new NotFoundException('Vai trò không tồn tại');

    // Tạo mật khẩu ngẫu nhiên phức tạp (8 ký tự: chữ thường, số, chữ hoa, ký tự đặc biệt)
    const generateRandomPassword = (length = 8) => {
      const lowercase = 'abcdefghijklmnopqrstuvwxyz';
      const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      const numbers = '0123456789';
      const symbols = '!@#$%^&*()_+~`|}{[]:;?><,./-=';

      const allChars = lowercase + uppercase + numbers + symbols;

      // Đảm bảo ít nhất mỗi loại có 1 ký tự
      let password = '';
      password += lowercase[Math.floor(Math.random() * lowercase.length)];
      password += uppercase[Math.floor(Math.random() * uppercase.length)];
      password += numbers[Math.floor(Math.random() * numbers.length)];
      password += symbols[Math.floor(Math.random() * symbols.length)];

      for (let i = password.length; i < length; i++) {
        password += allChars[Math.floor(Math.random() * allChars.length)];
      }

      // Trộn ngẫu nhiên chuỗi mật khẩu
      return password
        .split('')
        .sort(() => 0.5 - Math.random())
        .join('');
    };

    const rawPassword = generateRandomPassword(8);
    const hashedPassword = await bcrypt.hash(rawPassword, 10);

    const user = this.userRepository.create({
      fullName: data.fullName,
      phoneNumber: data.phoneNumber,
      email: data.email,
      password: hashedPassword,
      roleId: role.id,
    });

    const saved = await this.userRepository.save(user);

    // Gửi email mật khẩu cho người dùng
    this.mailService
      .sendMail({
        to: data.email,
        subject: 'Thông tin tài khoản truy cập hệ thống',
        text: `Chào ${data.fullName},\n\nTài khoản của bạn đã được khởi tạo thành công trên hệ thống.\n\nThông tin đăng nhập:\n- Số điện thoại: ${data.phoneNumber}\n- Mật khẩu: ${rawPassword}\n\nVui lòng đăng nhập và đổi mật khẩu để đảm bảo an toàn.\n\nTrân trọng.`,
      })
      .catch((err) => console.error('❌ Gửi email tài khoản thất bại:', err));

    return saved;
  }

  async login(dto: LoginDto) {
    const user = await this.userRepository.findOne({
      where: { phoneNumber: dto.phoneNumber },
      relations: ['role'],
    });

    if (!user) {
      throw new UnauthorizedException('Số điện thoại hoặc mật khẩu không đúng');
    }

    const isMatch = await bcrypt.compare(dto.password, user.password ?? '');
    if (!isMatch) {
      throw new UnauthorizedException('Số điện thoại hoặc mật khẩu không đúng');
    }

    // 🔥 Xử lý deviceId nếu được gửi từ frontend
    if (dto.deviceId) {
      // Tìm device đã tồn tại
      let device = await this.deviceRepository.findOne({
        where: { deviceId: dto.deviceId },
      });

      if (device) {
        // Nếu device này thuộc về user khác, deactivate device cũ
        if (device.userId !== user.id) {
          await this.deviceRepository.update(
            { deviceId: dto.deviceId },
            { userId: user.id, isActive: true, lastActiveAt: new Date() }
          );
          console.log(`🔄 Device ${dto.deviceId} đã chuyển sang user ${user.id}`);
        } else {
          // Cập nhật thời gian hoạt động
          await this.deviceRepository.update(
            { deviceId: dto.deviceId },
            { isActive: true, lastActiveAt: new Date() }
          );
        }
      } else {
        // Tạo device mới
        device = this.deviceRepository.create({
          deviceId: dto.deviceId,
          userId: user.id,
          deviceName: dto.deviceName || 'Unknown Device',
          deviceType: dto.deviceType || 'web',
          isActive: true,
          lastActiveAt: new Date(),
        });
        await this.deviceRepository.save(device);
        console.log(`✅ Tạo device mới: ${dto.deviceId} cho user ${user.id}`);
      }
    }

    const payload = {
      sub: user.id,
      phoneNumber: user.phoneNumber,
      roleCode: user.role?.roleCode,
      deviceId: dto.deviceId, // Thêm deviceId vào payload để sử dụng khi logout
    };

    const accessToken = this.jwtService.sign(payload, { expiresIn: '1d' });
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

    const { password: _p, ...userData } = user;

    return {
      statusCode: 200,
      message: 'Đăng nhập thành công',
      data: {
        accessToken,
        refreshToken,
        user: userData,
        deviceId: dto.deviceId, // Trả về deviceId để frontend lưu
      },
    };
  }

  // ====================== LOGOUT VÀ XÓA DEVICE ======================
  async logout(userId: number, deviceId?: string) {
    console.log(`🔄 Logout userId: ${userId}, deviceId: ${deviceId}`);

    if (deviceId) {
      // Deactivate device cụ thể
      await this.deviceRepository.update(
        { deviceId, userId },
        { isActive: false }
      );
      console.log(`✅ Đã deactivate device: ${deviceId}`);
    } else {
      // Deactivate tất cả devices của user
      await this.deviceRepository.update(
        { userId },
        { isActive: false }
      );
      console.log(`✅ Đã deactivate tất cả devices của user: ${userId}`);
    }

    return {
      statusCode: 200,
      message: 'Đăng xuất thành công',
    };
  }

  // Lấy danh sách active devices của user
  async getUserActiveDevices(userId: number) {
    const devices = await this.deviceRepository.find({
      where: { userId, isActive: true },
      order: { lastActiveAt: 'DESC' },
    });

    return {
      statusCode: 200,
      message: 'Lấy danh sách thiết bị thành công',
      data: devices,
    };
  }

  async refreshToken(dto: RefreshTokenDto) {
    try {
      const payload = this.jwtService.verify(dto.refreshToken, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });

      const user = await this.userRepository.findOne({
        where: { id: payload.sub },
        relations: ['role'],
      });

      if (!user) throw new NotFoundException('Người dùng không tồn tại');

      const newPayload = {
        sub: user.id,
        phoneNumber: user.phoneNumber,
        roleCode: user.role?.roleCode,
      };

      return {
        statusCode: 200,
        message: 'Làm mới token thành công',
        data: {
          accessToken: this.jwtService.sign(newPayload, { expiresIn: '1d' }),
          refreshToken: this.jwtService.sign(newPayload, { expiresIn: '7d' }),
        },
      };
    } catch {
      throw new UnauthorizedException('Refresh token không hợp lệ hoặc đã hết hạn');
    }
  }

 async sendOtpResetPassword(phoneNumber: string) {
  const user = await this.userRepository.findOne({
    where: { phoneNumber },
  });

  if (!user) throw new NotFoundException('Không tìm thấy người dùng');

  // 🔥 lấy OTP gần nhất
  const recentOtps = await this.verificationRepository.find({
    where: {
      user_id: user.id,
    },
    order: { createdAt: 'DESC' },
    take: 3,
  });

  const now = Date.now();

  // 🚨 1. Kiểm tra nếu đã gửi trong 180s
  if (recentOtps.length > 0) {
    const lastOtp = recentOtps[0];
    const diff = now - new Date(lastOtp.createdAt).getTime();

    if (diff < 180000) {
      throw new BadRequestException(
        `Vui lòng chờ ${Math.ceil((180000 - diff) / 1000)}s để gửi lại OTP`
      );
    }
  }

  // 🚨 2. Kiểm tra tối đa 3 lần trong 180s
  const countIn3Minutes = recentOtps.filter((otp) => {
    const diff = now - new Date(otp.createdAt).getTime();
    return diff < 180000;
  }).length;

  if (countIn3Minutes >= 3) {
    throw new BadRequestException(
      'Bạn đã gửi OTP quá nhiều lần, vui lòng thử lại sau'
    );
  }

  // 🔥 tạo OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  // 🔥 xoá OTP cũ (đảm bảo chỉ có 1 OTP active)
  await this.verificationRepository.delete({
    user_id: user.id,
  });

  // 🔥 lưu OTP mới
  await this.verificationRepository.save({
    user_id: user.id,
    code: otp,
    expiredAt: new Date(Date.now() + 5 * 60 * 1000),
    title: 'OTP Reset Password',
    description: 'Mã OTP dùng để đặt lại mật khẩu',
  });

  // 🔥 gửi email
  this.mailService.sendMail({
    to: user.email,
    subject: 'Mã OTP đặt lại mật khẩu',
    text: `Mã OTP của bạn là: ${otp}`,
  }).catch((err) => {
    console.error('❌ Gửi email OTP thất bại:', err);
    // Không throw lỗi để tránh làm hỏng flow gửi OTP
  });

  return { statusCode: 201, message: 'Đã gửi OTP về email' };
}
  // Reset mật khẩu bằng OTP
  async resetPasswordWithOtp(dto: ResetPasswordDto) {
    console.log('📥 Dữ liệu nhận được từ frontend:', dto);   // ← Quan trọng để debug

    // Kiểm tra dữ liệu đầu vào
    if (!dto.newPassword || typeof dto.newPassword !== 'string' || dto.newPassword.trim() === '') {
      throw new BadRequestException('Mật khẩu mới không được để trống');
    }

    const user = await this.userRepository.findOne({
      where: { phoneNumber: dto.phoneNumber },
    });

    if (!user) throw new NotFoundException('Không tìm thấy người dùng');

    const otpRecord = await this.verificationRepository.findOne({
      where: {
        user_id: user.id,
        code: dto.otp,
      },
      order: { expiredAt: 'DESC' },
    });

    if (!otpRecord)
      throw new BadRequestException('OTP không hợp lệ');

    const now = new Date();
  const expiredTime = new Date(otpRecord.expiredAt);   // Ép về Date object

  console.log('🕒 Thời gian hiện tại:', now.toISOString());
  console.log('⏰ Thời gian hết hạn trong DB:', expiredTime.toISOString());
  console.log('⏳ Còn lại (giây):', Math.floor((expiredTime.getTime() - now.getTime()) / 1000));

  if (expiredTime < now) {
    throw new BadRequestException('OTP đã hết hạn');
  }

    // 🔥 Hash password an toàn
    const hashedPassword = await bcrypt.hash(dto.newPassword.trim(), 10);

    user.password = hashedPassword;
    await this.userRepository.save(user);

    // 🔥 xoá OTP sau khi dùng
    await this.verificationRepository.delete({ id: otpRecord.id });

    console.log(`✅ Reset password thành công cho user: ${user.phoneNumber}`);

    return { 
      statusCode: 200, 
      message: 'Đổi mật khẩu thành công' 
    };
  }

  // Thay đổi mật khẩu
  // ====================== THAY ĐỔI MẬT KHẨU ======================
async changePassword(userId: number, dto: ChangePasswordDto) {
  console.log(`🔄 Yêu cầu đổi mật khẩu cho userId: ${userId}`);

  // Tìm user hiện tại
  const user = await this.userRepository.findOne({
    where: { id: userId },
    select: ['id', 'password'],   // chỉ lấy password để so sánh
  });

  if (!user) {
    throw new NotFoundException('Không tìm thấy người dùng');
  }

  // Kiểm tra mật khẩu cũ có đúng không
  const isOldPasswordCorrect = await bcrypt.compare(dto.oldPassword, user.password ?? '');

  if (!isOldPasswordCorrect) {
    throw new BadRequestException('Mật khẩu cũ không chính xác');
  }

  // Kiểm tra mật khẩu mới có giống mật khẩu cũ không
  const isSameAsOld = await bcrypt.compare(dto.newPassword, user.password ?? '');
  if (isSameAsOld) {
    throw new BadRequestException('Mật khẩu mới không được trùng với mật khẩu cũ');
  }

  // Hash mật khẩu mới
  const hashedNewPassword = await bcrypt.hash(dto.newPassword.trim(), 10);

  // Cập nhật mật khẩu
  await this.userRepository.update(
    { id: userId },
    { password: hashedNewPassword }
  );

  console.log(`✅ Đổi mật khẩu thành công cho userId: ${userId}`);

  return {
    statusCode: 200,
    message: 'Đổi mật khẩu thành công',
  };
}
}
