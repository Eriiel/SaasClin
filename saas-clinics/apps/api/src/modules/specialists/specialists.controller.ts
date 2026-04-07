import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { SpecialistsService } from './specialists.service';
import { CreateSpecialistDto } from './dto/create-specialist.dto';
import { UpdateSpecialistDto } from './dto/update-specialist.dto';
import { CurrentClinic } from '../../common/decorators/current-clinic.decorator';

@UseGuards(AuthGuard('jwt'))
@Controller('specialists')
export class SpecialistsController {
  constructor(private specialists: SpecialistsService) {}

  @Post()
  create(@CurrentClinic() clinicId: string, @Body() dto: CreateSpecialistDto) {
    return this.specialists.create(clinicId, dto);
  }

  @Get()
  findAll(@CurrentClinic() clinicId: string) {
    return this.specialists.findAll(clinicId);
  }

  @Get(':id')
  findOne(@CurrentClinic() clinicId: string, @Param('id') id: string) {
    return this.specialists.findOne(clinicId, id);
  }

  @Patch(':id')
  update(@CurrentClinic() clinicId: string, @Param('id') id: string, @Body() dto: UpdateSpecialistDto) {
    return this.specialists.update(clinicId, id, dto);
  }

  @Delete(':id')
  remove(@CurrentClinic() clinicId: string, @Param('id') id: string) {
    return this.specialists.remove(clinicId, id);
  }
}
