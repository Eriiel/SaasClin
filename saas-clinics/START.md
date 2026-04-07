# Guía de inicio — SaaS Clínicas

## Requisitos

| Herramienta | Versión mínima | Verificar |
|---|---|---|
| Node.js | 20+ | `node --version` |
| pnpm | 9+ | `pnpm --version` |
| Docker Desktop | cualquiera | debe estar corriendo |

## Primera vez

### 1. Variables de entorno

```bash
cp .env.example .env
```

Edita `.env` y cambia al menos:

```env
JWT_SECRET=pon_aqui_algo_largo_y_aleatorio
```

### 2. Levantar la base de datos

```bash
docker compose -f docker/docker-compose.yml up -d
```

Verifica que esté corriendo:

```bash
docker ps
# debe aparecer un contenedor postgres
```

### 3. Instalar dependencias

```bash
pnpm install
```

### 4. Crear las tablas en la base de datos

```bash
pnpm db:migrate
```

Si te pide nombre para la migración, escribe: `init`

### 5. Correr el proyecto

```bash
pnpm dev
```

Esto levanta en paralelo:
- API: http://localhost:3001
- Frontend: http://localhost:3000

---

## Flujo de primer uso

1. Abre http://localhost:3000
2. Haz clic en **Crear cuenta** → llena nombre, email y contraseña
3. Inicia sesión con esas mismas credenciales
4. El sistema detecta que no tienes clínica → te lleva a `/onboarding`
5. Llena el nombre de tu clínica → **Crear clínica y entrar al panel**
6. Ya estás dentro del dashboard

---

## Estructura del proyecto

```
saas-clinics/
├── apps/
│   ├── web/        → Frontend Next.js (puerto 3000)
│   └── api/        → Backend NestJS (puerto 3001)
├── packages/
│   ├── db/         → Prisma schema y migraciones
│   └── shared/     → Tipos compartidos (JwtPayload, roles, etc.)
├── docker/
│   └── docker-compose.yml  → PostgreSQL
├── .env            → Variables de entorno (no subir a git)
└── .env.example    → Plantilla de variables
```

---

## Comandos útiles

```bash
# Correr todo
pnpm dev

# Solo el backend
pnpm --filter @saas-clinics/api dev

# Solo el frontend
pnpm --filter @saas-clinics/web dev

# Ver y editar la base de datos visualmente
pnpm db:studio

# Crear nueva migración después de cambiar el schema
pnpm db:migrate

# Regenerar el cliente de Prisma
pnpm db:generate
```

---

## Variables de entorno

| Variable | Descripción | Ejemplo |
|---|---|---|
| `DATABASE_URL` | Conexión a PostgreSQL | `postgresql://user:pass@localhost:5432/db` |
| `JWT_SECRET` | Clave secreta para tokens | string largo y aleatorio |
| `JWT_EXPIRES_IN` | Duración del token | `7d` |
| `PORT` | Puerto del backend | `3001` |
| `FRONTEND_URL` | URL del frontend (CORS) | `http://localhost:3000` |
| `NEXT_PUBLIC_API_URL` | URL del API desde el browser | `http://localhost:3001/api` |

---

## Flujo de autenticación

```
Registro → Login
  └─ Sin clínica → Onboarding → crear clínica → JWT completo → Dashboard
  └─ 1 clínica   → JWT directo → Dashboard
  └─ N clínicas  → Seleccionar clínica → JWT → Dashboard
```

El JWT contiene:
```json
{ "sub": "user-id", "email": "...", "clinic_id": "...", "role": "ADMIN" }
```

Todos los endpoints protegidos extraen `clinic_id` del token automáticamente. Nunca hay que enviarlo en el body.

---

## Solución de problemas

**`Cannot find module '@saas-clinics/shared'`**
```bash
pnpm install
pnpm db:generate
```

**Error de conexión a la base de datos**
```bash
docker compose -f docker/docker-compose.yml up -d
# espera 5 segundos y reintenta
```

**Puerto 3001 ya en uso**
```bash
# Windows
netstat -ano | findstr :3001
taskkill /PID <pid> /F
```

**Prisma: tabla no existe**
```bash
pnpm db:migrate
```
