import { IsString, IsOptional, IsEmail } from 'class-validator';

export class CreatePatientDto {
  @IsString()
  name: string;

  @IsString()
  phone: string;

  @IsOptional()
  @IsEmail()
  email?: string;
}
