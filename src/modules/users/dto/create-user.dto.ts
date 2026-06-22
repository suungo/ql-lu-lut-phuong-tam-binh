import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
  IsEnum,
  ValidateIf,
} from 'class-validator';
import { RoleCode } from 'src/common/enums/role-code.enum';

export class CreateUserDto {
  @ApiProperty({ example: 'Nguyễn Văn A' })
  @IsString()
  @IsNotEmpty({ message: 'Họ tên không được để trống' })
  fullName: string;

  @ApiProperty({ example: '0898987871' })
  @IsString()
  @IsNotEmpty({ message: 'Số điện thoại không được để trống' })
  phoneNumber: string;

  @ApiProperty({ example: 'example@gmail.com', required: false })
  @IsEmail({}, { message: 'Email không hợp lệ' })
  @IsOptional()
  email?: string;

  @ApiProperty({ example: 'Password@123', required: false })
  @ValidateIf((o) => o.roleCode !== RoleCode.RESIDENT)
  @IsString()
  @IsNotEmpty({ message: 'Mật khẩu không được để trống' })
  @MinLength(6, { message: 'Mật khẩu phải có ít nhất 6 ký tự' })
  password?: string;

  @ApiProperty({ example: 'MANAGER', enum: RoleCode })
  @IsEnum(RoleCode, { message: 'Vai trò không hợp lệ' })
  @IsNotEmpty({ message: 'Vai trò không được để trống' })
  roleCode: RoleCode;
}
