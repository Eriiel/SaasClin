import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PatientsService } from './patients.service';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { CurrentClinic } from '../../common/decorators/current-clinic.decorator';

@UseGuards(AuthGuard('jwt'))
@Controller('patients')
export class PatientsController {
  constructor(private patients: PatientsService) {}

  @Post()
  create(@CurrentClinic() clinicId: string, @Body() dto: CreatePatientDto) {
    return this.patients.create(clinicId, dto);
  }

  @Get()
  findAll(@CurrentClinic() clinicId: string) {
    return this.patients.findAll(clinicId);
  }

  @Get(':id')
  findOne(@CurrentClinic() clinicId: string, @Param('id') id: string) {
    return this.patients.findOne(clinicId, id);
  }

  @Patch(':id')
  update(@CurrentClinic() clinicId: string, @Param('id') id: string, @Body() dto: UpdatePatientDto) {
    return this.patients.update(clinicId, id, dto);
  }

  @Delete(':id')
  remove(@CurrentClinic() clinicId: string, @Param('id') id: string) {
    return this.patients.remove(clinicId, id);
  }
}
