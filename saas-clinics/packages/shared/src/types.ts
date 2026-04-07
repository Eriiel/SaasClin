export type Role = 'SUPER_ADMIN' | 'ADMIN' | 'RECEPTIONIST' | 'SPECIALIST';

export type AppointmentStatus = 'CONFIRMED' | 'PENDING' | 'CANCELLED';

export type DayOfWeek =
  | 'MONDAY'
  | 'TUESDAY'
  | 'WEDNESDAY'
  | 'THURSDAY'
  | 'FRIDAY'
  | 'SATURDAY'
  | 'SUNDAY';

export interface JwtPayload {
  sub: string;
  email: string;
  clinic_id: string;
  role: Role;
}
