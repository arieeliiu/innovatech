# Project Service - Innovatech Solutions

Servicio principal de backend en NestJS para Innovatech Solutions. Expone la API de autenticación, usuarios, proyectos, tareas y correo; además aplica reglas de acceso por roles y validación de entrada.

## Rol dentro del sistema

Este servicio actúa como la capa central de negocio. Recibe las peticiones del frontend, valida permisos, aplica reglas operativas y consulta Supabase para persistencia y autenticación.

## Tecnologías usadas

- NestJS 11
- TypeScript
- Supabase
- class-validator y class-transformer
- Nodemailer
- Jest

## Estructura principal

```txt
services/project-service/
├── src/
│   ├── auth/
│   ├── users/
│   ├── projects/
│   ├── mail/
│   ├── bootstrap/
│   ├── app.module.ts
│   └── main.ts
├── test/
├── package.json
└── README.md
```

## Funcionalidades principales

- Inicio de sesión con Supabase Auth.
- Validación de JWT mediante guards.
- Gestión de usuarios.
- Gestión de proyectos, tareas, comentarios, historial y miembros.
- Finalización de proyectos.
- Envío de correos mediante SMTP.

## Comandos de instalación, ejecución y pruebas

```bash
npm install
npm run start:dev
npm run start
npm run build
npm run test
npm run test:e2e
npm run test:cov
npm run lint
```

## Variables de entorno necesarias

```env
PORT=3001
FRONTEND_URL=http://localhost:3000
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=valor_de_servicio
SMTP_HOST=smtp.ejemplo.com
SMTP_PORT=587
SMTP_USER=usuario
SMTP_PASS=clave
MAIL_FROM=no-reply@innovatech.com
```

## Limitaciones actuales

- No se observó una separación completa por microservicios dentro de este servicio; concentra la funcionalidad principal del dominio.
- No se localizaron pruebas unitarias adicionales más allá del e2e de reglas de negocio.
- La configuración de correo depende de variables SMTP correctas.

## Mejoras futuras

- Separar más claramente responsabilidades internas si el alcance crece.
- Añadir más pruebas unitarias y de integración.
- Completar telemetría, observabilidad y revisión de errores de infraestructura.

## Nota técnica

La validación de datos y el control de acceso están presentes en la implementación actual mediante DTOs, pipes y guards. Esto sostiene la defensa técnica del servicio como capa de negocio y no solo como proxy de datos.