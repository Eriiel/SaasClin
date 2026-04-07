import { IsUUID, IsDateString, IsOptional, IsString, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateAppointmentDto {
  @IsUUID()
  patientId: string;

  @IsUUID()
  specialistId: string;

  @IsUUID()
  serviceId: string;

  @IsDateString()
  date: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  paymentAmount?: number;
}
