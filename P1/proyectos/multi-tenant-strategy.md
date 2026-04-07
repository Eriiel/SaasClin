---
title: Estrategia Multi-Tenant
tags: [arquitectura, multi-tenant, auth, decisión]
created: 2026-04-05
---

# Estrategia Multi-Tenant — Opción C (Inferido del usuario)

## Decisión

`clinic_id` se incrusta en el JWT después del login. El usuario selecciona clínica si pertenece a más de una.

## Flujo de autenticación

```
POST /auth/login
  → validar credenciales
  → buscar clínicas del usuario (ClinicUser)
  → ¿1 clínica?  → emitir JWT con clinic_id
  → ¿N clínicas? → retornar lista de clínicas
                 → POST /auth/select-clinic { clinicId }
                 → emitir JWT con clinic_id
```

## Payload del JWT

```json
{
  "sub": "user-uuid",
  "email": "user@mail.com",
  "clinic_id": "clinic-uuid",
  "role": "admin | receptionist | specialist"
}
```

## Modelo de base de datos

```prisma
model User {
  id       String      @id @default(uuid())
  email    String      @unique
  password String
  clinics  ClinicUser[]
}

model Clinic {
  id    String      @id @default(uuid())
  name  String
  users ClinicUser[]
}

model ClinicUser {
  id        String   @id @default(uuid())
  userId    String
  clinicId  String
  role      Role
  user      User     @relation(fields: [userId], references: [id])
  clinic    Clinic   @relation(fields: [clinicId], references: [id])

  @@unique([userId, clinicId])
}

enum Role {
  SUPER_ADMIN
  ADMIN
  RECEPTIONIST
  SPECIALIST
}
```

## Implementación en NestJS

### Decorator personalizado

```ts
// @CurrentUser() → extrae payload del JWT
// @CurrentClinic() → extrae clinic_id del JWT
```

### Guard de clínica

```ts
// ClinicGuard valida que clinic_id en JWT coincida con el recurso solicitado
```

### Filtrado en servicios

```ts
// Todos los servicios reciben clinicId como parámetro obligatorio
findAll(clinicId: string) {
  return this.prisma.specialist.findMany({
    where: { clinicId }
  })
}
```

## Regla de oro

> Todo recurso (specialists, services, availability, patients, appointments)
> tiene `clinicId` como campo obligatorio y SIEMPRE se filtra por él.

## Trade-offs aceptados

- Un usuario con múltiples clínicas debe hacer un paso extra al login.
- El JWT queda inválido si el usuario es removido de la clínica (mitigable con refresh tokens o blacklist).
