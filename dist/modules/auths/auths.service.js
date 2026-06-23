"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthsService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const jwt_1 = require("@nestjs/jwt");
const typeorm_1 = require("@nestjs/typeorm");
const bcrypt = require("bcrypt");
const role_code_enum_1 = require("../../common/enums/role-code.enum");
const role_entity_1 = require("../roles/entities/role.entity");
const device_entity_1 = require("../users/entities/device.entity");
const user_entity_1 = require("../users/entities/user.entity");
const typeorm_2 = require("typeorm");
const mail_service_1 = require("../mail/mail.service");
const verification_entity_1 = require("../verifications/entities/verification.entity");
let AuthsService = class AuthsService {
    constructor(userRepository, roleRepository, deviceRepository, jwtService, configService, mailService, verificationRepository) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.deviceRepository = deviceRepository;
        this.jwtService = jwtService;
        this.configService = configService;
        this.mailService = mailService;
        this.verificationRepository = verificationRepository;
    }
    async register(dto) {
        const existing = await this.userRepository.findOne({
            where: { phoneNumber: dto.phoneNumber },
            withDeleted: true,
        });
        if (existing) {
            if (existing.deletedAt) {
                throw new common_1.BadRequestException('Số điện thoại đã tồn tại trong hệ thống (đã bị xóa tạm thời)');
            }
            throw new common_1.BadRequestException('Số điện thoại đã được sử dụng');
        }
        const residentRole = await this.roleRepository.findOne({
            where: { roleCode: role_code_enum_1.RoleCode.RESIDENT },
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
    async createAccount(data) {
        const existing = await this.userRepository.findOne({
            where: [{ phoneNumber: data.phoneNumber }, { email: data.email }],
            withDeleted: true,
        });
        if (existing) {
            if (existing.deletedAt) {
                throw new common_1.BadRequestException('Số điện thoại hoặc Email đã tồn tại trong hệ thống (đã bị xóa tạm thời)');
            }
            throw new common_1.BadRequestException('Số điện thoại hoặc Email đã được sử dụng cho một tài khoản khác');
        }
        const role = await this.roleRepository.findOne({
            where: { roleCode: data.roleCode },
        });
        if (!role)
            throw new common_1.NotFoundException('Vai trò không tồn tại');
        const generateRandomPassword = (length = 8) => {
            const lowercase = 'abcdefghijklmnopqrstuvwxyz';
            const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
            const numbers = '0123456789';
            const allChars = lowercase + uppercase + numbers;
            let password = '';
            password += lowercase[Math.floor(Math.random() * lowercase.length)];
            password += uppercase[Math.floor(Math.random() * uppercase.length)];
            password += numbers[Math.floor(Math.random() * numbers.length)];
            const randomLength = length - 1;
            for (let i = password.length; i < randomLength; i++) {
                password += allChars[Math.floor(Math.random() * allChars.length)];
            }
            const shuffled = password
                .split('')
                .sort(() => 0.5 - Math.random())
                .join('');
            return '@' + shuffled;
        };
        const rawPassword = generateRandomPassword(8);
        const hashedPassword = await bcrypt.hash(rawPassword, 10);
        const user = this.userRepository.create({
            fullName: data.fullName,
            phoneNumber: data.phoneNumber,
            email: data.email,
            password: hashedPassword,
            roleId: role.id,
            ...(data.address ? { address: data.address } : {}),
        });
        const saved = await this.userRepository.save(user);
        this.mailService
            .sendMail({
            to: data.email,
            subject: 'Thông tin tài khoản truy cập hệ thống',
            text: `Chào ${data.fullName},\n\nTài khoản của bạn đã được khởi tạo thành công trên hệ thống.\n\nThông tin đăng nhập:\n- Số điện thoại: ${data.phoneNumber}\n- Mật khẩu: ${rawPassword}\n\nVui lòng đăng nhập và đổi mật khẩu để đảm bảo an toàn.\n\nTrân trọng.`,
        })
            .catch((err) => console.error('❌ Gửi email tài khoản thất bại:', err));
        return saved;
    }
    async login(dto) {
        const user = await this.userRepository.findOne({
            where: { phoneNumber: dto.phoneNumber },
            relations: ['role'],
        });
        if (!user) {
            try {
                const isProd = this.configService.get('NODE_ENV') === 'production';
                const verificationBaseUrl = isProd
                    ? 'https://ql-vunglu.site/api-dancu/v1'
                    : 'http://localhost:3002/v1';
                const response = await fetch(`${verificationBaseUrl}/verifications?phoneNumber=${dto.phoneNumber}`);
                if (response.ok) {
                    const result = (await response.json());
                    if (result && result.data && result.data.length > 0) {
                        const latestReg = result.data[0];
                        if (latestReg.status === 'PENDING') {
                            throw new common_1.BadRequestException('Tài khoản của bạn đang chờ Ban quản trị phê duyệt. Vui lòng quay lại sau.');
                        }
                        else if (latestReg.status === 'REJECTED') {
                            throw new common_1.BadRequestException('Yêu cầu đăng ký tài khoản của bạn đã bị từ chối phê duyệt.');
                        }
                    }
                }
            }
            catch (err) {
                if (err instanceof common_1.BadRequestException) {
                    throw err;
                }
                console.error('Lỗi khi check status verifications:', err.message || err);
            }
            throw new common_1.UnauthorizedException('Số điện thoại hoặc mật khẩu không đúng');
        }
        if (user.status === 'INACTIVE') {
            throw new common_1.BadRequestException('Tài khoản của bạn đã bị khóa vui lòng liên hệ quản lý phường để xử lý');
        }
        if (user.role?.roleCode !== role_code_enum_1.RoleCode.RESIDENT) {
            if (!dto.password) {
                throw new common_1.BadRequestException('Mật khẩu không được để trống');
            }
            const isMatch = await bcrypt.compare(dto.password, user.password ?? '');
            if (!isMatch) {
                throw new common_1.UnauthorizedException('Số điện thoại hoặc mật khẩu không đúng');
            }
        }
        if (dto.deviceId) {
            let device = await this.deviceRepository.findOne({
                where: { deviceId: dto.deviceId },
            });
            if (device) {
                const updateData = {
                    isActive: true,
                    lastActiveAt: new Date(),
                };
                if (device.userId !== user.id) {
                    updateData.userId = user.id;
                    console.log(`🔄 Device ${dto.deviceId} đã chuyển sang user ${user.id}`);
                }
                if (dto.expoPushToken) {
                    updateData.expoPushToken = dto.expoPushToken;
                }
                if (dto.webPushSub) {
                    updateData.webPushSub = dto.webPushSub;
                }
                await this.deviceRepository.update({ deviceId: dto.deviceId }, updateData);
            }
            else {
                device = this.deviceRepository.create({
                    deviceId: dto.deviceId,
                    userId: user.id,
                    deviceName: dto.deviceName || 'Unknown Device',
                    deviceType: dto.deviceType || 'web',
                    expoPushToken: dto.expoPushToken,
                    webPushSub: dto.webPushSub,
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
            deviceId: dto.deviceId,
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
                deviceId: dto.deviceId,
            },
        };
    }
    async subscribePush(userId, dto) {
        let device = await this.deviceRepository.findOne({
            where: { deviceId: dto.deviceId },
        });
        if (device) {
            const updateData = {
                userId,
                isActive: true,
                lastActiveAt: new Date(),
            };
            if (dto.expoPushToken)
                updateData.expoPushToken = dto.expoPushToken;
            if (dto.webPushSub)
                updateData.webPushSub = dto.webPushSub;
            await this.deviceRepository.update({ deviceId: dto.deviceId }, updateData);
            console.log(`✅ Cập nhật push subscription cho device: ${dto.deviceId}`);
        }
        else {
            device = this.deviceRepository.create({
                deviceId: dto.deviceId,
                userId,
                deviceName: 'Unknown Device',
                deviceType: dto.expoPushToken ? 'mobile' : 'web',
                expoPushToken: dto.expoPushToken,
                webPushSub: dto.webPushSub,
                isActive: true,
                lastActiveAt: new Date(),
            });
            await this.deviceRepository.save(device);
            console.log(`✅ Tạo và đăng ký push cho device mới: ${dto.deviceId}`);
        }
        return {
            statusCode: 200,
            message: 'Đăng ký nhận thông báo thành công',
        };
    }
    async logout(userId, deviceId) {
        console.log(`🔄 Logout userId: ${userId}, deviceId: ${deviceId}`);
        if (deviceId) {
            await this.deviceRepository.update({ deviceId, userId }, { isActive: false });
            console.log(`✅ Đã deactivate device: ${deviceId}`);
        }
        else {
            await this.deviceRepository.update({ userId }, { isActive: false });
            console.log(`✅ Đã deactivate tất cả devices của user: ${userId}`);
        }
        return {
            statusCode: 200,
            message: 'Đăng xuất thành công',
        };
    }
    async getUserActiveDevices(userId) {
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
    async refreshToken(dto) {
        try {
            const payload = this.jwtService.verify(dto.refreshToken, {
                secret: this.configService.get('JWT_SECRET'),
            });
            const user = await this.userRepository.findOne({
                where: { id: payload.sub },
                relations: ['role'],
            });
            if (!user)
                throw new common_1.NotFoundException('Người dùng không tồn tại');
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
        }
        catch {
            throw new common_1.UnauthorizedException('Refresh token không hợp lệ hoặc đã hết hạn');
        }
    }
    async sendOtpResetPassword(phoneNumber) {
        const user = await this.userRepository.findOne({
            where: { phoneNumber },
        });
        if (!user)
            throw new common_1.NotFoundException('Không tìm thấy người dùng');
        const recentOtps = await this.verificationRepository.find({
            where: {
                user_id: user.id,
            },
            order: { createdAt: 'DESC' },
            take: 3,
        });
        const now = Date.now();
        if (recentOtps.length > 0) {
            const lastOtp = recentOtps[0];
            const diff = now - new Date(lastOtp.createdAt).getTime();
            if (diff < 180000) {
                throw new common_1.BadRequestException(`Vui lòng chờ ${Math.ceil((180000 - diff) / 1000)}s để gửi lại OTP`);
            }
        }
        const countIn3Minutes = recentOtps.filter((otp) => {
            const diff = now - new Date(otp.createdAt).getTime();
            return diff < 180000;
        }).length;
        if (countIn3Minutes >= 3) {
            throw new common_1.BadRequestException('Bạn đã gửi OTP quá nhiều lần, vui lòng thử lại sau');
        }
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        await this.verificationRepository.delete({
            user_id: user.id,
        });
        await this.verificationRepository.save({
            user_id: user.id,
            code: otp,
            expiredAt: new Date(Date.now() + 5 * 60 * 1000),
            title: 'OTP Reset Password',
            description: 'Mã OTP dùng để đặt lại mật khẩu',
        });
        this.mailService
            .sendMail({
            to: user.email,
            subject: 'Mã OTP đặt lại mật khẩu',
            text: `Mã OTP của bạn là: ${otp}`,
        })
            .catch((err) => {
            console.error('❌ Gửi email OTP thất bại:', err);
        });
        return { statusCode: 201, message: 'Đã gửi OTP về email' };
    }
    async resetPasswordWithOtp(dto) {
        console.log('📥 Dữ liệu nhận được từ frontend:', dto);
        if (!dto.newPassword ||
            typeof dto.newPassword !== 'string' ||
            dto.newPassword.trim() === '') {
            throw new common_1.BadRequestException('Mật khẩu mới không được để trống');
        }
        const user = await this.userRepository.findOne({
            where: { phoneNumber: dto.phoneNumber },
        });
        if (!user)
            throw new common_1.NotFoundException('Không tìm thấy người dùng');
        const otpRecord = await this.verificationRepository.findOne({
            where: {
                user_id: user.id,
                code: dto.otp,
            },
            order: { expiredAt: 'DESC' },
        });
        if (!otpRecord)
            throw new common_1.BadRequestException('OTP không hợp lệ');
        const now = new Date();
        const expiredTime = new Date(otpRecord.expiredAt);
        console.log('🕒 Thời gian hiện tại:', now.toISOString());
        console.log('⏰ Thời gian hết hạn trong DB:', expiredTime.toISOString());
        console.log('⏳ Còn lại (giây):', Math.floor((expiredTime.getTime() - now.getTime()) / 1000));
        if (expiredTime < now) {
            throw new common_1.BadRequestException('OTP đã hết hạn');
        }
        const hashedPassword = await bcrypt.hash(dto.newPassword.trim(), 10);
        user.password = hashedPassword;
        await this.userRepository.save(user);
        await this.verificationRepository.delete({ id: otpRecord.id });
        console.log(`✅ Reset password thành công cho user: ${user.phoneNumber}`);
        return {
            statusCode: 200,
            message: 'Đổi mật khẩu thành công',
        };
    }
    async changePassword(userId, dto) {
        console.log(`🔄 Yêu cầu đổi mật khẩu cho userId: ${userId}`);
        const user = await this.userRepository.findOne({
            where: { id: userId },
            select: ['id', 'password'],
        });
        if (!user) {
            throw new common_1.NotFoundException('Không tìm thấy người dùng');
        }
        const isOldPasswordCorrect = await bcrypt.compare(dto.oldPassword, user.password ?? '');
        if (!isOldPasswordCorrect) {
            throw new common_1.BadRequestException('Mật khẩu cũ không chính xác');
        }
        const isSameAsOld = await bcrypt.compare(dto.newPassword, user.password ?? '');
        if (isSameAsOld) {
            throw new common_1.BadRequestException('Mật khẩu mới không được trùng với mật khẩu cũ');
        }
        const hashedNewPassword = await bcrypt.hash(dto.newPassword.trim(), 10);
        await this.userRepository.update({ id: userId }, { password: hashedNewPassword });
        console.log(`✅ Đổi mật khẩu thành công cho userId: ${userId}`);
        return {
            statusCode: 200,
            message: 'Đổi mật khẩu thành công',
        };
    }
    async findUserByPhoneNumber(phoneNumber) {
        if (!phoneNumber)
            return null;
        return this.userRepository.findOne({
            where: { phoneNumber },
            select: [
                'id',
                'fullName',
                'email',
                'phoneNumber',
                'roleId',
                'address',
                'status',
            ],
            relations: ['role'],
        });
    }
    async findUserById(id) {
        if (!id)
            return null;
        return this.userRepository.findOne({
            where: { id },
            select: [
                'id',
                'fullName',
                'email',
                'phoneNumber',
                'roleId',
                'address',
                'status',
            ],
            relations: ['role'],
        });
    }
};
exports.AuthsService = AuthsService;
exports.AuthsService = AuthsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(role_entity_1.Role)),
    __param(2, (0, typeorm_1.InjectRepository)(device_entity_1.Device)),
    __param(6, (0, typeorm_1.InjectRepository)(verification_entity_1.Verification)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        jwt_1.JwtService,
        config_1.ConfigService,
        mail_service_1.MailService,
        typeorm_2.Repository])
], AuthsService);
//# sourceMappingURL=auths.service.js.map