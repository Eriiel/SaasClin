import { IsString, IsInt, IsOptional, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateServiceDto {
  @IsString()
  name: string;

  @IsInt()
  @Min(1)
  @Type(() => Number)
  duration: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  price?: number;
}
