import { ApiProperty, PartialType } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import {
  HasBusiness,
  HasChildren,
  HasElderly,
  HasPregnant,
  HasSick,
  HouseType,
} from '../enums/resident.enum';

export class CreateResidentDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  residentCode: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  phoneNumber?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  email?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  address?: string; // Địa chỉ

  @ApiProperty({ required: false })
  @IsOptional()
  latitude: number; // Vĩ độ

  @ApiProperty()
  @IsNotEmpty()
  longitude: number; // Kinh độ

  @ApiProperty({ required: false })
  @IsOptional()
  floor?: number; // Số tầng

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  numberOfMembers: number; // Số thành viên trong hộ

  @ApiProperty({ enum: HasElderly, default: HasElderly.NO })
  @IsEnum(HasElderly)
  @IsOptional()
  hasElderly: HasElderly; // Có người già

  @ApiProperty({ enum: HasChildren, default: HasChildren.NO })
  @IsEnum(HasChildren)
  @IsOptional()
  hasChildren: HasChildren; // Có trẻ em

  @ApiProperty({ enum: HasPregnant, default: HasPregnant.NO })
  @IsEnum(HasPregnant)
  @IsOptional()
  hasPregnantWomen: HasPregnant; // Có phụ nữ mang thai

  @ApiProperty({ enum: HasSick, default: HasSick.NO })
  @IsEnum(HasSick)
  @IsOptional()
  hasChronicDisease: HasSick; // Có người bị bệnh nền

  @ApiProperty({ enum: HouseType, default: HouseType.HOUSE_LEVEL_4 })
  @IsEnum(HouseType)
  @IsOptional()
  houseType: HouseType; // Loại nhà

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  numberOfFloors: number; // Số tầng

  @ApiProperty({ enum: HasBusiness, default: HasBusiness.NO })
  @IsEnum(HasBusiness)
  @IsOptional()
  hasBusiness: HasBusiness; // Có kinh doanh

  @ApiProperty({ required: false, default: true })
  @IsOptional()
  createAccount?: boolean; // Tự động tạo tài khoản người dùng cho hộ dân

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  userId?: number; // ID người dùng liên kết
}

export class UpdateResidentDto extends PartialType(CreateResidentDto) {}

