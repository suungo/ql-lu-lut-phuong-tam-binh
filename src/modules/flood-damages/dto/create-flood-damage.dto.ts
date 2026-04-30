import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { DamageCategory } from '../enums/damage-category.enum';

export class CreateFloodDamageDto {
  @ApiProperty({ enum: DamageCategory, example: DamageCategory.PROPERTY })
  @IsEnum(DamageCategory)
  @IsNotEmpty()
  damageCategory: DamageCategory;

  @ApiProperty({ example: 'Nhà bị ngập nước, tường loang lổ' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ example: 50000000 })
  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  estimatedValue: number;

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

  @ApiProperty({ example: 1 })
  @IsNumber()
  @IsNotEmpty()
  reflectionId: number;

  @ApiProperty({ example: 101, required: false })
  @IsNumber()
  @IsOptional()
  householdId?: number;
}
