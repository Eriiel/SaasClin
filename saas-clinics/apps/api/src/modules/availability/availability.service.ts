import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { SetAvailabilityDto } from './dto/set-availability.dto';

@Injectable()
export class AvailabilityService {
  constructor(private prisma: PrismaService) {}

  async upsert(specialistId: string, dto: SetAvailabilityDto) {
    return this.prisma.availability.upsert({
      where: { specialistId_day: { specialistId, day: dto.day } },
      update: { startTime: dto.startTime, endTime: dto.endTime },
      create: { specialistId, day: dto.day, startTime: dto.startTime, endTime: dto.endTime },
    });
  }

  findBySpecialist(specialistId: string) {
    return this.prisma.availability.findMany({
      where: { specialistId },
      orderBy: { day: 'asc' },
    });
  }

  remove(specialistId: string, day: string) {
    return this.prisma.availability.delete({
      where: { specialistId_day: { specialistId, day: day as any } },
    });
  }

  isWithinAvailability(startTime: string, endTime: string, appointmentTime: string, durationMinutes: number): boolean {
    const toMinutes = (t: string) => {
      const [h, m] = t.split(':').map(Number);
      return h * 60 + m;
    };
    const start = toMinutes(startTime);
    const end = toMinutes(endTime);
    const appt = toMinutes(appointmentTime);
    return appt >= start && appt + durationMinutes <= end;
  }
}
