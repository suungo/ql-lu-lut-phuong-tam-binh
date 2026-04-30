import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { Role } from 'src/modules/roles/entities/role.entity';
import { Device } from 'src/modules/users/entities/device.entity';
import { User } from 'src/modules/users/entities/user.entity';
import { MailModule } from '../mail/mail.module';
import { Verification } from '../verifications/entities/verification.entity';
import { AuthsController } from './auths.controller';
import { AuthsService } from './auths.service';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Role, Verification, Device]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '1d' },
      }),
    }),
    MailModule
  ],
  controllers: [AuthsController],
  providers: [AuthsService, JwtStrategy, JwtAuthGuard],
  exports: [JwtModule, AuthsService, JwtAuthGuard, PassportModule],
})

export class AuthsModule {}
