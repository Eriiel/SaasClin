import { IsEmail, IsEnum, IsString, MinLength } from 'class-validator';
import { Role } from '@saas-clinics/shared';

export class CreateUserDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsEnum(['ADMIN', 'RECEPTIONIST', 'SPECIALIST'])
  role: Role;
}
