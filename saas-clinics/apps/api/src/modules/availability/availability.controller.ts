import { Controller, Get, Post, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AvailabilityService } from './availability.service';
import { SetAvailabilityDto } from './dto/set-availability.dto';

@UseGuards(AuthGuard('jwt'))
@Controller('specialists/:specialistId/availability')
export class AvailabilityController {
  constructor(private availability: AvailabilityService) {}

  @Post()
  upsert(@Param('specialistId') specialistId: string, @Body() dto: SetAvailabilityDto) {
    return this.availability.upsert(specialistId, dto);
  }

  @Get()
  findAll(@Param('specialistId') specialistId: string) {
    return this.availability.findBySpecialist(specialistId);
  }

  @Delete(':day')
  remove(@Param('specialistId') specialistId: string, @Param('day') day: string) {
    return this.availability.remove(specialistId, day);
  }
}
