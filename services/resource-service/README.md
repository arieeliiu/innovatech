# Resource Service

Microservicio NestJS independiente para asignar profesionales a proyectos y calcular su disponibilidad automáticamente según proyectos activos.

## Resumen

- Puerto: `3003`
- Prefijo global: `/api`
- Esquema principal: `resource_service`
- Disponibilidad calculada por cantidad de proyectos activos
- Límite: `3` proyectos activos por profesional

## Endpoints

- `GET /api/resources`
- `GET /api/resources/project/:projectId`
- `GET /api/resources/:userId`
- `POST /api/assignments`
- `GET /api/assignments/user/:userId`

## Variables de entorno

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `PORT` opcional, por defecto `3003`

## Comandos

```bash
npm install
npm run start:dev
npm run build
npm run test
```
