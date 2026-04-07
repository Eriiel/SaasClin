import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentStatusDto } from './dto/update-appointment-status.dto';
import { CurrentClinic } from '../../common/decorators/current-clinic.decorator';

@UseGuards(AuthGuard('jwt'))
@Controller('appointments')
export class AppointmentsController {
  constructor(private appointments: AppointmentsService) {}

  @Post()
  create(@CurrentClinic() clinicId: string, @Body() dto: CreateAppointmentDto) {
    return this.appointments.create(clinicId, dto);
  }

  @Get()
  findAll(
    @CurrentClinic() clinicId: string,
    @Query('specialistId') specialistId?: string,
    @Query('date') date?: string,
  ) {
    return this.appointments.findAll(clinicId, { specialistId, date });
  }

  @Get(':id')
  findOne(@CurrentClinic() clinicId: string, @Param('id') id: string) {
    return this.appointments.findOne(clinicId, id);
  }

  @Patch(':id/status')
  updateStatus(
    @CurrentClinic() clinicId: string,
    @Param('id') id: string,
    @Body() dto: UpdateAppointmentStatusDto,
  ) {
    return this.appointments.updateStatus(clinicId, id, dto);
  }

  @Delete(':id')
  remove(@CurrentClinic() clinicId: string, @Param('id') id: string) {
    return this.appointments.remove(clinicId, id);
  }
}
