import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';

@Injectable()
export class PatientsService {
  constructor(private prisma: PrismaService) {}

  create(clinicId: string, dto: CreatePatientDto) {
    return this.prisma.patient.create({ data: { ...dto, clinicId } });
  }

  findAll(clinicId: string) {
    return this.prisma.patient.findMany({
      where: { clinicId },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(clinicId: string, id: string) {
    const patient = await this.prisma.patient.findFirst({ where: { id, clinicId } });
    if (!patient) throw new NotFoundException('Patient not found');
    return patient;
  }

  async update(clinicId: string, id: string, dto: UpdatePatientDto) {
    await this.findOne(clinicId, id);
    return this.prisma.patient.update({ where: { id }, data: dto });
  }

  async remove(clinicId: string, id: string) {
    await this.findOne(clinicId, id);
    return this.prisma.patient.delete({ where: { id } });
  }
}
