import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../common/prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { SelectClinicDto } from './dto/select-clinic.dto';
import { JwtPayload } from '@saas-clinics/shared';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const exists = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (exists) throw new BadRequestException('Email already in use');

    const hashed = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: { email: dto.email, password: hashed, name: dto.name },
    });

    return { id: user.id, email: user.email, name: user.name };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      include: { clinics: { include: { clinic: true } } },
    });

    if (!user) throw new UnauthorizedException('Invalid credentials');

    const valid = await bcrypt.compare(dto.password, user.password);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    // No clinic yet → return setup token for onboarding
    if (user.clinics.length === 0) {
      const setupToken = this.jwt.sign({ sub: user.id, email: user.email, setup: true });
      return { requiresClinicSetup: true, setupToken };
    }

    // Single clinic → issue JWT directly
    if (user.clinics.length === 1) {
      const cu = user.clinics[0];
      return this.issueToken({ sub: user.id, email: user.email, clinic_id: cu.clinicId, role: cu.role as any });
    }

    // Multiple clinics → return list for selection
    return {
      requiresClinicSelection: true,
      clinics: user.clinics.map((cu) => ({
        id: cu.clinicId,
        name: cu.clinic.name,
        role: cu.role,
      })),
      userId: user.id,
    };
  }

  async selectClinic(dto: SelectClinicDto) {
    const cu = await this.prisma.clinicUser.findFirst({
      where: { userId: dto.userId, clinicId: dto.clinicId },
    });
    if (!cu) throw new UnauthorizedException('Access denied');

    const user = await this.prisma.user.findUnique({ where: { id: dto.userId } });
    return this.issueToken({ sub: user.id, email: user.email, clinic_id: cu.clinicId, role: cu.role as any });
  }

  async refreshAfterSetup(userId: string) {
    const cu = await this.prisma.clinicUser.findFirst({ where: { userId } });
    if (!cu) throw new UnauthorizedException('No clinic found for user');
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    return this.issueToken({ sub: user.id, email: user.email, clinic_id: cu.clinicId, role: cu.role as any });
  }

  private issueToken(payload: JwtPayload) {
    return { access_token: this.jwt.sign(payload) };
  }
}
