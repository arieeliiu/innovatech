# Analytics Service - Innovatech Solutions

Servicio NestJS para analítica general. Consolida datos de proyectos, tareas, miembros y usuarios profesionales para entregar métricas resumidas al frontend.

## Rol dentro del sistema

Este servicio transforma datos operativos en indicadores de gestión. Su salida está pensada para paneles de resumen y toma de decisiones, no para edición de datos.

## Tecnologías usadas

- NestJS 11
- TypeScript
- Supabase
- Jest

## Estructura principal

```txt
services/analytics-service/
├── src/
│   ├── analytics/
│   ├── supabase/
│   ├── app.module.ts
│   └── main.ts
├── test/
├── package.json
└── README.md
```

## Funcionalidades principales

- Cálculo de resumen general.
- Conteo de proyectos activos y completados.
- Conteo de tareas por estado.
- Cálculo de disponibilidad de recursos profesionales.
- Exposición de un endpoint de overview para el frontend.

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
PORT=3004
FRONTEND_URL=http://localhost:3000
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=valor_de_servicio
```

## Limitaciones actuales

- La documentación original de NestJS fue reemplazada porque no describía Innovatech.
- Las pruebas existentes son básicas y no validan escenarios funcionales completos.

## Mejoras futuras

- Añadir más casos de prueba para métricas y errores.
- Publicar métricas adicionales si el sistema las necesita.
- Integrar estas salidas con un panel de visualización más robusto.

## Nota técnica

La analítica se calcula a partir de consultas directas a Supabase. Esto mantiene la lógica simple y alineada con el estado actual del proyecto.
