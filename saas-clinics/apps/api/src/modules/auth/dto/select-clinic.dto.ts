import { IsUUID } from 'class-validator';

export class SelectClinicDto {
  @IsUUID()
  userId: string;

  @IsUUID()
  clinicId: string;
}
