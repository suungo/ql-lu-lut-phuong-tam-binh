import { ApiProperty } from '@nestjs/swagger';
import { PartialType } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { DamageCategory } from '../enums/damage-category.enum';
import { DamageStatus } from '../enums/damage-status.enum';

export class UpdateFloodDamageDto {
  @ApiProperty({
    enum: DamageCategory,
    example: DamageCategory.PROPERTY,
    required: false,
  })
  @IsEnum(DamageCategory)
  @IsOptional()
  damageCategory?: DamageCategory;

  @ApiProperty({ example: 'Nhà bị ngập nước', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 50000000, required: false })
  @IsNumber()
  @Min(0)
  @IsOptional()
  estimatedValue?: number;

  @ApiProperty({ example: 0, required: false })
  @IsNumber()
  @Min(0)
  @IsOptional()
  injuredCount?: number;

  @ApiProperty({ example: 0, required: false })
  @IsNumber()
  @Min(0)
  @IsOptional()
  deathCount?: number;

  @ApiProperty({
    enum: DamageStatus,
    example: DamageStatus.APPROVED,
    required: false,
  })
  @IsEnum(DamageStatus)
  @IsOptional()
  status?: DamageStatus;

  @ApiProperty({ example: 101, required: false })
  @IsNumber()
  @IsOptional()
  householdId?: number;
}
