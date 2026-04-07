import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { AvailabilityService } from '../availability/availability.service';
import { ServicesService } from '../services/services.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentStatusDto } from './dto/update-appointment-status.dto';

@Injectable()
export class AppointmentsService {
  constructor(
    private prisma: PrismaService,
    private availabilityService: AvailabilityService,
    private servicesService: ServicesService,
  ) {}

  async create(clinicId: string, dto: CreateAppointmentDto) {
    const appointmentDate = new Date(dto.date);
    const dayOfWeek = this.getDayOfWeek(appointmentDate);
    const timeStr = this.getTimeString(appointmentDate);

    // Check specialist availability for that day
    const availability = await this.prisma.availability.findUnique({
      where: { specialistId_day: { specialistId: dto.specialistId, day: dayOfWeek as any } },
    });

    if (!availability) {
      throw new BadRequestException(`Specialist has no availability on ${dayOfWeek}`);
    }

    // Get service duration
    const service = await this.servicesService.findOne(clinicId, dto.serviceId);
    const duration = service.duration;

    // Check if within working hours
    const withinHours = this.availabilityService.isWithinAvailability(
      availability.startTime,
      availability.endTime,
      timeStr,
      duration,
    );

    if (!withinHours) {
      throw new BadRequestException(
        `Appointment time is outside specialist working hours (${availability.startTime} - ${availability.endTime})`,
      );
    }

    // Check for overlapping appointments
    const endDate = new Date(appointmentDate.getTime() + duration * 60000);

    const overlap = await this.prisma.appointment.findFirst({
      where: {
        specialistId: dto.specialistId,
        status: { not: 'CANCELLED' },
        AND: [
          { date: { lt: endDate } },
          {
            date: {
              gt: new Date(appointmentDate.getTime() - duration * 60000),
            },
          },
        ],
      },
      include: { service: true },
    });

    if (overlap) {
      const overlapEnd = new Date(overlap.date.getTime() + overlap.service.duration * 60000);
      if (appointmentDate < overlapEnd) {
        throw new BadRequestException('Time slot is already taken');
      }
    }

    return this.prisma.appointment.create({
      data: {
        clinicId,
        patientId: dto.patientId,
        specialistId: dto.specialistId,
        serviceId: dto.serviceId,
        date: appointmentDate,
        notes: dto.notes,
        paymentAmount: dto.paymentAmount,
        status: 'CONFIRMED',
      },
      include: {
        patient: true,
        specialist: true,
        service: true,
      },
    });
  }

  findAll(clinicId: string, filters?: { specialistId?: string; date?: string }) {
    const where: any = { clinicId };

    if (filters?.specialistId) where.specialistId = filters.specialistId;

    if (filters?.date) {
      const day = new Date(filters.date);
      const nextDay = new Date(day);
      nextDay.setDate(nextDay.getDate() + 1);
      where.date = { gte: day, lt: nextDay };
    }

    return this.prisma.appointment.findMany({
      where,
      include: { patient: true, specialist: true, service: true },
      orderBy: { date: 'asc' },
    });
  }

  async findOne(clinicId: string, id: string) {
    const appt = await this.prisma.appointment.findFirst({
      where: { id, clinicId },
      include: { patient: true, specialist: true, service: true },
    });
    if (!appt) throw new NotFoundException('Appointment not found');
    return appt;
  }

  async updateStatus(clinicId: string, id: string, dto: UpdateAppointmentStatusDto) {
    await this.findOne(clinicId, id);
    return this.prisma.appointment.update({
      where: { id },
      data: { status: dto.status, paymentAmount: dto.paymentAmount },
      include: { patient: true, specialist: true, service: true },
    });
  }

  async remove(clinicId: string, id: string) {
    await this.findOne(clinicId, id);
    return this.prisma.appointment.delete({ where: { id } });
  }

  private getDayOfWeek(date: Date): string {
    const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
    return days[date.getDay()];
  }

  private getTimeString(date: Date): string {
    return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  }
}
