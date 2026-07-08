# Integración

El flujo principal de Innovatech Solutions conecta frontend, backend y Supabase/PostgreSQL de forma directa y controlada.

## Flujo general

1. El usuario inicia sesión desde el frontend.
2. El frontend envía las credenciales al project-service.
3. El backend valida contra Supabase Auth y devuelve un token.
4. El frontend guarda el token en el navegador y lo adjunta en las peticiones posteriores.
5. Los servicios backend validan la solicitud y aplican sus reglas de negocio.
6. El backend consulta Supabase/PostgreSQL según el dominio requerido.
7. La respuesta vuelve al frontend para renderizar la vista correspondiente.

## Comunicación entre componentes

- El frontend usa `NEXT_PUBLIC_API_URL` para el service principal.
- Usa `NEXT_PUBLIC_RESOURCE_SERVICE_URL` para recursos.
- Usa `NEXT_PUBLIC_ANALYTICS_SERVICE_URL` para analítica.
- Los servicios NestJS usan `SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY` para consultar datos.
- `FRONTEND_URL` se usa para CORS y permitir la comunicación del frontend con los servicios.

## Integración actual

- Project-service: autenticación, usuarios, proyectos, tareas y correo.
- Resource-service: recursos y asignaciones operativas.
- Analytics-service: métricas agregadas del sistema.

## Limitaciones actuales

- La integración depende de variables de entorno correctas; no hay una capa adicional tipo API Gateway o BFF.
- La sincronización entre servicios todavía es directa en algunos puntos.

## Mejora futura

- Añadir contratos más formales entre frontend y servicios.
- Reducir dependencias directas entre dominios si el sistema crece.
- Incorporar más pruebas de integración entre capas.