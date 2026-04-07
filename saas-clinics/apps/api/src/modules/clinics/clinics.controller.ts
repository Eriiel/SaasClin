import { Controller, Get, Post, Patch, Body, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ClinicsService } from './clinics.service';
import { CreateClinicDto } from './dto/create-clinic.dto';
import { UpdateClinicDto } from './dto/update-clinic.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CurrentClinic } from '../../common/decorators/current-clinic.decorator';
import { JwtPayload } from '@saas-clinics/shared';

@UseGuards(AuthGuard('jwt'))
@Controller('clinics')
export class ClinicsController {
  constructor(private clinics: ClinicsService) {}

  @Post()
  create(@Body() dto: CreateClinicDto, @CurrentUser() user: JwtPayload) {
    return this.clinics.create(dto, user.sub);
  }

  @Get('me')
  findOne(@CurrentClinic() clinicId: string) {
    return this.clinics.findOne(clinicId);
  }

  @Patch('me')
  update(@CurrentClinic() clinicId: string, @Body() dto: UpdateClinicDto) {
    return this.clinics.update(clinicId, dto);
  }
}
