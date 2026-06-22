import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { DispatchReportStatus } from '../enums/dispatch-report.enum';

export class CreateDispatchReportDto {
  @IsNumber()
  reflectionId: number;

  @IsOptional()
  @IsNumber()
  assignedTo?: number;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  note?: string;

  @IsOptional()
  @IsString()
  customHandler?: string;

  @IsOptional()
  expectedTime?: Date;
}

export class UpdateDispatchReportDto {
  @IsOptional()
  @IsEnum(DispatchReportStatus)
  status?: DispatchReportStatus;

  @IsOptional()
  @IsString()
  reportContent?: string;

  @IsOptional()
  @IsString()
  reflectionStatusUpdate?: string;

  @IsOptional()
  @IsString()
  rejectReason?: string;

  @IsOptional()
  attachments?: string[];

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  expectedTime?: Date;
}
