import { IsEnum, IsOptional, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { AppointmentStatus } from '@saas-clinics/shared';

export class UpdateAppointmentStatusDto {
  @IsEnum(['CONFIRMED', 'PENDING', 'CANCELLED'])
  status: AppointmentStatus;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  paymentAmount?: number;
}
