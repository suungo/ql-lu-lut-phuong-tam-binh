import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsArray, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateResidentContactDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  email?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  phoneNumber?: string;

  @ApiProperty()
  @IsString()
  cccd: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  address?: string;
}

export class BulkCreateResidentContactDto {
  @ApiProperty({ type: [CreateResidentContactDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateResidentContactDto)
  contacts: CreateResidentContactDto[];
}

export class UpdateResidentContactDto extends PartialType(
  CreateResidentContactDto,
) {}
