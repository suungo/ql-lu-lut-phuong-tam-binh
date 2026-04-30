import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { DamageCategory } from '../enums/damage-category.enum';
import { DamageStatus } from '../enums/damage-status.enum';

export class FilterFloodDamageDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiProperty({ enum: DamageCategory, required: false })
  @IsEnum(DamageCategory)
  @IsOptional()
  category?: DamageCategory;

  @ApiProperty({ enum: DamageStatus, required: false })
  @IsEnum(DamageStatus)
  @IsOptional()
  status?: DamageStatus;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  reflectionId?: number;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  householdId?: number;

  @ApiProperty({ default: 1, required: false })
  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => parseInt(value) || 1)
  page?: number;

  @ApiProperty({ default: 10, required: false })
  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => parseInt(value) || 10)
  limit?: number;
}
