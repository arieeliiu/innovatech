# Patrones

Esta documentación solo registra patrones que se observan en la implementación actual.

## Patrones aplicados

- Arquitectura por servicios o microservicios: el sistema se divide en frontend y servicios backend por dominio.
- Modularización por dominio: cada backend agrupa auth, projects, users, resources o analytics en módulos separados.
- Component Pattern en frontend: la interfaz reutiliza componentes para evitar duplicación visual.
- Service Layer en backend: la lógica de negocio vive en servicios NestJS y no en los controladores.
- DTOs y validación: existen DTOs y uso de class-validator/class-transformer en el backend principal.
- Guards de autenticación y autorización: el project-service incluye guards para proteger rutas sensibles.
- Centralización de peticiones HTTP en frontend: `src/lib/api.ts` concentra la comunicación con la API principal.

## Patrones presentes de forma parcial

- Normalización de roles en frontend y backend: ya existe, pero todavía puede unificarse mejor entre módulos.
- Separación de configuración por entorno: está implementada, aunque depende de variables correctas en cada servicio.

## Mejora futura

- Repository Pattern, Factory Method, Circuit Breaker y API Gateway no están implementados de forma clara en este repositorio; deben considerarse solo como evolución futura si el proyecto lo requiere.
- El BFF tampoco está presente como capa diferenciada.