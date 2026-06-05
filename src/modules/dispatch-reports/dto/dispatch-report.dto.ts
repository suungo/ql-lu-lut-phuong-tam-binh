import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { DispatchReportStatus } from '../enums/dispatch-report.enum';

export class CreateDispatchReportDto {
  @IsNumber()
  reflectionId: number;

  @IsNumber()
  assignedTo: number;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  note?: string;
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
}
