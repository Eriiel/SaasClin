import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ServicesService } from './services.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { CurrentClinic } from '../../common/decorators/current-clinic.decorator';

@UseGuards(AuthGuard('jwt'))
@Controller('services')
export class ServicesController {
  constructor(private services: ServicesService) {}

  @Post()
  create(@CurrentClinic() clinicId: string, @Body() dto: CreateServiceDto) {
    return this.services.create(clinicId, dto);
  }

  @Get()
  findAll(@CurrentClinic() clinicId: string) {
    return this.services.findAll(clinicId);
  }

  @Get(':id')
  findOne(@CurrentClinic() clinicId: string, @Param('id') id: string) {
    return this.services.findOne(clinicId, id);
  }

  @Patch(':id')
  update(@CurrentClinic() clinicId: string, @Param('id') id: string, @Body() dto: UpdateServiceDto) {
    return this.services.update(clinicId, id, dto);
  }

  @Delete(':id')
  remove(@CurrentClinic() clinicId: string, @Param('id') id: string) {
    return this.services.remove(clinicId, id);
  }
}
