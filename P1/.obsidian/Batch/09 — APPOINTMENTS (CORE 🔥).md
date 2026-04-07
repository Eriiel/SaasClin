# 🧩 Citas

## 🎯 Objetivo
Crear citas médicas

## 📋 Requisitos
- Paciente
- Especialista
- Servicio
- Fecha

## ⚙️ Especificación técnica
- Tabla appointments
- Validar disponibilidad
- Evitar solapamientos

## 📡 Endpoints
POST /appointments  
GET /appointments  

## 📥 Input
{
  "patientId": "uuid",
  "specialistId": "uuid",
  "serviceId": "uuid",
  "date": "2026-04-10T10:00:00"
}

## 🔒 Validaciones
- No doble reserva
- Horario válido