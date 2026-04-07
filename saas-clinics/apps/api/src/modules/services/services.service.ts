import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';

@Injectable()
export class ServicesService {
  constructor(private prisma: PrismaService) {}

  create(clinicId: string, dto: CreateServiceDto) {
    return this.prisma.service.create({ data: { ...dto, clinicId } });
  }

  findAll(clinicId: string) {
    return this.prisma.service.findMany({
      where: { clinicId },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(clinicId: string, id: string) {
    const service = await this.prisma.service.findFirst({ where: { id, clinicId } });
    if (!service) throw new NotFoundException('Service not found');
    return service;
  }

  async update(clinicId: string, id: string, dto: UpdateServiceDto) {
    await this.findOne(clinicId, id);
    return this.prisma.service.update({ where: { id }, data: dto });
  }

  async remove(clinicId: string, id: string) {
    await this.findOne(clinicId, id);
    return this.prisma.service.delete({ where: { id } });
  }
}
