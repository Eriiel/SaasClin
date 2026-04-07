import { IsString } from 'class-validator';

export class CreateSpecialistDto {
  @IsString()
  name: string;

  @IsString()
  specialty: string;
}
