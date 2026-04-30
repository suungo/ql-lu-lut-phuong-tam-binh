import { PartialType, ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { VerificationStatus, VerificationType } from '../enums/verification.enum';

export class CreateVerificationDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ enum: VerificationType, default: VerificationType.OTHER })
  @IsEnum(VerificationType)
  @IsOptional()
  verificationType?: VerificationType;

  @ApiProperty({ required: false, type: [String] })
  @IsArray()
  @IsOptional()
  attachments?: string[];

  @ApiProperty({ required: false })
  @IsOptional()
  referenceId?: number;
}

export class UpdateVerificationDto extends PartialType(CreateVerificationDto) {
  @ApiProperty({ enum: VerificationStatus, required: false })
  @IsEnum(VerificationStatus)
  @IsOptional()
  status?: VerificationStatus;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  reviewNote?: string;
}
