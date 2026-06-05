import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Gender } from 'src/common/enums/gender.enum';
import {
  HumanResourcePosition,
  HumanResourceStatus,
} from '../enums/human-resource.enum';

export class CreateHumanResourceDto {
  @ApiProperty({ example: 'Nguyễn Văn A' })
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @ApiProperty({ example: 'NV001' })
  @IsString()
  @IsNotEmpty()
  employeeCode: string;

  @ApiProperty({ example: '0898987871' })
  @IsString()
  @IsNotEmpty()
  phoneNumber: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  email?: string;

  @ApiProperty({ enum: Gender, default: Gender.MALE })
  @IsEnum(Gender)
  @IsOptional()
  gender?: Gender;

  @ApiProperty({ required: false })
  @IsOptional()
  dateBirth?: Date;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiProperty({ enum: HumanResourcePosition })
  @IsEnum(HumanResourcePosition)
  @IsOptional()
  position?: HumanResourcePosition;

  @ApiProperty({ enum: HumanResourceStatus })
  @IsEnum(HumanResourceStatus)
  @IsOptional()
  status?: HumanResourceStatus;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  notes?: string;
}
