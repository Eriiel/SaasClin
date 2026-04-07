import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(clinicId: string, dto: CreateUserDto) {
    const exists = await this.prisma.user.findUnique({ where: { email: dto.email } });

    if (exists) {
      // User exists: add to clinic if not already there
      const alreadyInClinic = await this.prisma.clinicUser.findUnique({
        where: { userId_clinicId: { userId: exists.id, clinicId } },
      });
      if (alreadyInClinic) throw new ConflictException('User already belongs to this clinic');

      return this.prisma.clinicUser.create({
        data: { userId: exists.id, clinicId, role: dto.role },
        include: { user: { select: { id: true, email: true, name: true } } },
      });
    }

    const hashed = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        name: dto.name,
        password: hashed,
        clinics: { create: { clinicId, role: dto.role } },
      },
    });

    return { id: user.id, email: user.email, name: user.name };
  }

  findAll(clinicId: string) {
    return this.prisma.clinicUser.findMany({
      where: { clinicId },
      include: { user: { select: { id: true, email: true, name: true } } },
    });
  }

  async remove(clinicId: string, userId: string) {
    const cu = await this.prisma.clinicUser.findUnique({
      where: { userId_clinicId: { userId, clinicId } },
    });
    if (!cu) throw new NotFoundException('User not found in clinic');
    return this.prisma.clinicUser.delete({ where: { userId_clinicId: { userId, clinicId } } });
  }
}
