import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateClinicDto } from './dto/create-clinic.dto';
import { UpdateClinicDto } from './dto/update-clinic.dto';

@Injectable()
export class ClinicsService {
  constructor(private prisma: PrismaService) {}

  create(dto: CreateClinicDto, userId: string) {
    return this.prisma.clinic.create({
      data: {
        ...dto,
        users: {
          create: { userId, role: 'ADMIN' },
        },
      },
    });
  }

  findOne(clinicId: string) {
    return this.prisma.clinic.findUnique({ where: { id: clinicId } });
  }

  update(clinicId: string, dto: UpdateClinicDto) {
    return this.prisma.clinic.update({ where: { id: clinicId }, data: dto });
  }
}
