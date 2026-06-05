import { ApiProperty, PartialType } from '@nestjs/swagger';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import {
  Category,
  EventType,
  Priority,
  ReflectionStatus,
} from '../enums/reflection.enum';

export class CreateReflectionDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  title: string; // Tiêu đề
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  content: string; // Nội dung
  @ApiProperty()
  @IsEnum(Category)
  @IsNotEmpty()
  category: Category; // Danh mục
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  description?: string; // Mô tả

  @ApiProperty()
  @IsNotEmpty()
  lat: number; // Vĩ độ
  @ApiProperty()
  @IsNotEmpty()
  lng: number; // Kinh độ
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  address: string; // Địa chỉ
  @ApiProperty()
  @IsArray()
  @IsNotEmpty()
  imageUrl: string[]; // Ảnh
  @ApiProperty()
  @IsEnum(Priority)
  @IsNotEmpty()
  priority: Priority; // Mức độ
  // Loại sự cố
  @ApiProperty()
  @IsEnum(EventType)
  @IsNotEmpty()
  typeOfIncident: EventType;
}

export class UpdateReflectionDto extends PartialType(CreateReflectionDto) {
  @ApiProperty()
  @IsString()
  @IsOptional()
  title?: string;
  @ApiProperty()
  @IsString()
  @IsOptional()
  content?: string;
  @ApiProperty()
  @IsEnum(Category)
  @IsOptional()
  category?: Category;
  @ApiProperty()
  @IsString()
  @IsOptional()
  description?: string;
  @ApiProperty()
  @IsOptional()
  lat?: number;
  @ApiProperty()
  @IsOptional()
  lng?: number;
  @ApiProperty()
  @IsString()
  @IsOptional()
  address?: string;
  @ApiProperty()
  @IsArray()
  @IsOptional()
  imageUrl?: string[];
  @ApiProperty()
  @IsEnum(Priority)
  @IsOptional()
  priority?: Priority;
  @ApiProperty()
  @IsEnum(EventType)
  @IsOptional()
  typeOfIncident?: EventType;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  response?: string;
}

export class ResponseReflectionDto {
  @ApiProperty()
  @IsString()
  @IsOptional()
  title?: string;
  @ApiProperty()
  @IsString()
  @IsOptional()
  content?: string;
  @ApiProperty()
  @IsEnum(Category)
  @IsOptional()
  category?: Category;
  @ApiProperty()
  @IsString()
  @IsOptional()
  description?: string;
  @ApiProperty()
  @IsOptional()
  lat?: number;
  @ApiProperty()
  @IsOptional()
  lng?: number;
  @ApiProperty()
  @IsString()
  @IsOptional()
  address?: string;
  @ApiProperty()
  @IsArray()
  @IsOptional()
  imageUrl?: string[];
  @ApiProperty()
  @IsEnum(Priority)
  @IsOptional()
  priority?: Priority;
  @ApiProperty()
  @IsEnum(EventType)
  @IsOptional()
  typeOfIncident?: EventType;
  @ApiProperty({ enum: ReflectionStatus, required: false })
  @IsEnum(ReflectionStatus)
  @IsOptional()
  status?: ReflectionStatus;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  response?: string;
}
