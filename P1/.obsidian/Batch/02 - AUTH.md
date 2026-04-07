# 🧩 Autenticación

## 🎯 Objetivo
Sistema de registro y login

## 📋 Requisitos
- Registro
- Login
- JWT

## ⚙️ Especificación técnica
- Módulo auth en NestJS
- Hash de password (bcrypt)
- Generación de JWT

## 📡 Endpoints
POST /auth/register  
POST /auth/login  

## 📥 Input
{
  "email": "test@mail.com",
  "password": "123456"
}

## 🔒 Validaciones
- Email único
- Password mínima 6 caracteres