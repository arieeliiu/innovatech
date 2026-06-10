# Resource Service

Microservicio NestJS independiente para gestionar recursos humanos, sincronizar asignaciones con proyectos y calcular disponibilidad automáticamente según proyectos activos.

## Resumen

- Puerto: `3003`
- Prefijo global: `/api`
- Esquema dueño del dominio: `resource_service`
- `resource_assignments` pertenece al Resource Service
- `public.projects` y `public.project_members` pertenecen al Project Service
- La sincronización directa con `project_members` es una solución MVP pendiente de reemplazo por HTTP o eventos
- Disponibilidad automática: `0`, `1` o `2` proyectos activos = `AVAILABLE`; `3` = `UNAVAILABLE`
- Límite: `3` proyectos activos por profesional

## Endpoints

- `GET /api/resources`
- `GET /api/resources/project/:projectId`
- `GET /api/resources/:userId`
- `POST /api/assignments`
- `PATCH /api/assignments/:assignmentId/deactivate`
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

## Pendiente de seguridad

En producción debe validarse el JWT del sistema y restringir operaciones según rol. La Service Role Key no debe exponerse al cliente.
