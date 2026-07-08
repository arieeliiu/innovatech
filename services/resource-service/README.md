# Resource Service - Innovatech Solutions

Servicio NestJS para recursos y asignaciones. Calcula disponibilidad de profesionales, consulta asignaciones activas y cruza datos entre la tabla de recursos y los miembros de proyecto.

## Rol dentro del sistema

Este servicio cubre la gestión operativa de recursos humanos. Su foco es mostrar disponibilidad, consultar asignaciones y mantener una visión consistente del uso de profesionales por proyecto.

## Tecnologías usadas

- NestJS 11
- TypeScript
- Supabase
- Jest

## Estructura principal

```txt
services/resource-service/
├── src/
│   ├── resources/
│   ├── assignments/
│   ├── common/
│   ├── supabase/
│   ├── app.module.ts
│   └── main.ts
├── test/
├── package.json
└── README.md
```

## Funcionalidades principales

- Consulta de recursos generales.
- Consulta de recursos por proyecto o por usuario.
- Creación y desactivación de asignaciones.
- Cálculo de disponibilidad según proyectos activos.
- Lectura de miembros de proyecto para consolidar la vista operativa.

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
PORT=3003
FRONTEND_URL=http://localhost:3000
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=valor_de_servicio
```

## Limitaciones actuales

- La sincronización con `public.project_members` todavía es directa y corresponde a un enfoque MVP.
- No se localizaron pruebas automatizadas en este servicio.
- No hay validación completa de autenticación/autorización expuesta en los endpoints actuales.

## Mejoras futuras

- Sustituir la sincronización directa por integración HTTP o por eventos.
- Añadir autenticación y control por rol en todos los endpoints.
- Incorporar pruebas automáticas.

## Nota técnica

El servicio ya aplica una regla operativa clara: hasta tres proyectos activos mantienen al profesional como disponible. Esa lógica debe conservarse como referencia para la defensa del examen.
