# Innovatech Solutions

Innovatech Solutions es una plataforma web para la gestión integral de proyectos tecnológicos. La solución integra frontend, servicios backend por dominio y una capa de persistencia basada en Supabase/PostgreSQL para centralizar autenticación, proyectos, tareas, recursos y analítica.

## Objetivo

El objetivo del proyecto es presentar una solución defendible para Desarrollo Fullstack III, con separación de responsabilidades entre interfaz, servicios y base de datos, y con una estructura suficiente para escalar por módulos funcionales.

## Tecnologías reales usadas

- Next.js 16
- React 19
- TypeScript
- NestJS 11
- Supabase
- PostgreSQL
- Tailwind CSS 4
- Jest
- ESLint
- class-validator y class-transformer
- Nodemailer en el servicio principal de backend

## Estructura real del proyecto

```txt
innovatech/
├── frontend/
├── services/
│   ├── project-service/
│   ├── resource-service/
│   └── analytics-service/
├── docs/
└── README.md
```

## Resumen de la arquitectura

- El frontend está desarrollado con Next.js y concentra la interfaz de usuario.
- El project-service expone la API principal para autenticación, usuarios, proyectos, tareas y correo.
- El resource-service gestiona recursos y asignaciones operativas.
- El analytics-service calcula indicadores generales a partir de datos del sistema.
- Supabase actúa como base de autenticación y persistencia para los servicios.

## Cómo ejecutar el proyecto

La solución se ejecuta por partes. Instala y levanta cada aplicación desde su carpeta correspondiente.

```bash
cd frontend
npm install
npm run dev
```

```bash
cd services/project-service
npm install
npm run start:dev
```

```bash
cd services/resource-service
npm install
npm run start:dev
```

```bash
cd services/analytics-service
npm install
npm run start:dev
```

Si se ejecutan al mismo tiempo, ajusta los puertos para evitar colisiones entre el frontend y los servicios backend.

## Variables de entorno generales

Valores de referencia sin credenciales reales:

```env
# Frontend
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_RESOURCE_SERVICE_URL=http://localhost:3003
NEXT_PUBLIC_ANALYTICS_SERVICE_URL=http://localhost:3004

# Backend
PORT=3001
FRONTEND_URL=http://localhost:3000
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=valor_de_servicio

# Correo en project-service
SMTP_HOST=smtp.ejemplo.com
SMTP_PORT=587
SMTP_USER=usuario
SMTP_PASS=clave
MAIL_FROM=no-reply@innovatech.com
```

## Documentación adicional

- [Arquitectura](docs/arquitectura.md)
- [Patrones](docs/patrones.md)
- [Integración](docs/integracion.md)
- [Pruebas](docs/pruebas.md)
- [Branching](docs/branching.md)

## Estado actual y mejoras futuras

Estado actual: el frontend y los tres servicios documentados están implementados con alcance funcional real, pero con cobertura de pruebas desigual entre módulos.

Mejoras futuras: ampliar pruebas automatizadas, consolidar una estrategia de ramas más formal, endurecer la protección de rutas en frontend, revisar observabilidad y completar la integración de recursos y analítica con flujos más robustos.