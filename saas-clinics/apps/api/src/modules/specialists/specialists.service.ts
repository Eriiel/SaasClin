import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateSpecialistDto } from './dto/create-specialist.dto';
import { UpdateSpecialistDto } from './dto/update-specialist.dto';

@Injectable()
export class SpecialistsService {
  constructor(private prisma: PrismaService) {}

  create(clinicId: string, dto: CreateSpecialistDto) {
    return this.prisma.specialist.create({ data: { ...dto, clinicId } });
  }

  findAll(clinicId: string) {
    return this.prisma.specialist.findMany({
      where: { clinicId },
      include: { availability: true },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(clinicId: string, id: string) {
    const specialist = await this.prisma.specialist.findFirst({
      where: { id, clinicId },
      include: { availability: true },
    });
    if (!specialist) throw new NotFoundException('Specialist not found');
    return specialist;
  }

  async update(clinicId: string, id: string, dto: UpdateSpecialistDto) {
    await this.findOne(clinicId, id);
    return this.prisma.specialist.update({ where: { id }, data: dto });
  }

  async remove(clinicId: string, id: string) {
    await this.findOne(clinicId, id);
    return this.prisma.specialist.delete({ where: { id } });
  }
}
