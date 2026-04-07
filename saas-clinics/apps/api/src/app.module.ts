import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './common/prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { ClinicsModule } from './modules/clinics/clinics.module';
import { UsersModule } from './modules/users/users.module';
import { SpecialistsModule } from './modules/specialists/specialists.module';
import { ServicesModule } from './modules/services/services.module';
import { AvailabilityModule } from './modules/availability/availability.module';
import { PatientsModule } from './modules/patients/patients.module';
import { AppointmentsModule } from './modules/appointments/appointments.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    ClinicsModule,
    UsersModule,
    SpecialistsModule,
    ServicesModule,
    AvailabilityModule,
    PatientsModule,
    AppointmentsModule,
  ],
})
export class AppModule {}
