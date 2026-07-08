# Arquitectura

Innovatech Solutions sigue una arquitectura por capas con separación entre presentación, servicios y persistencia.

```txt
Usuario -> Frontend Next.js -> Servicios NestJS -> Supabase/PostgreSQL
```

## Componentes principales

- El frontend en Next.js concentra la experiencia de usuario y el consumo de APIs.
- El project-service maneja autenticación, usuarios, proyectos, tareas, comentarios, miembros y correo.
- El resource-service gestiona recursos, asignaciones y disponibilidad de profesionales.
- El analytics-service resume información operativa para paneles de gestión.
- Supabase aporta autenticación y persistencia sobre PostgreSQL.

## Justificación técnica

- Escalabilidad: cada servicio puede ampliarse por dominio sin afectar toda la interfaz.
- Mantenibilidad: las reglas quedan separadas por responsabilidad y es más fácil localizar cambios.
- Seguridad básica: la autenticación se centraliza en backend y los accesos se controlan con guards y roles donde ya existen.
- Privacidad: el frontend no accede directamente a la base de datos; pasa por servicios controlados.
- Separación de responsabilidades: presentación, lógica de negocio y persistencia no se mezclan en una sola capa.

## Estado actual

La arquitectura está implementada de forma funcional, aunque no completa en todas las áreas. El núcleo de proyectos está más desarrollado que recursos y analítica.

## Mejora futura

- Separar más claramente los flujos entre servicios si el sistema crece.
- Añadir observabilidad y trazabilidad más formal.
- Consolidar contratos de integración entre frontend y backend.