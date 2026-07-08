# Pruebas

El repositorio incluye pruebas, pero con cobertura desigual según el módulo.

## Estado real de pruebas

- Project-service: existe `test/project-business-rules.e2e-spec.ts`, centrado en reglas de negocio.
- Analytics-service: existen pruebas base en `src/app.controller.spec.ts`, `src/analytics/analytics.controller.spec.ts` y `src/analytics/analytics.service.spec.ts`.
- Frontend: no se localizaron pruebas automatizadas.
- Resource-service: no se localizaron pruebas automatizadas.

## Framework usado

- Jest.

## Comandos disponibles

```bash
npm run test
npm run test:cov
```

## Reglas de negocio probadas

- Límite de proyectos activos por profesional en el project-service.
- Bloqueo de asignaciones a proyectos finalizados.
- Validación de pertenencia del responsable al proyecto.
- Finalización de tareas con progreso al 100%.

## Limitaciones actuales

- La cobertura no está documentada como completa.
- No se observa una integración formal de CI/CD para ejecutar las pruebas automáticamente.
- No se usa SonarQube en esta revisión.

## Mejora futura

- Ampliar cobertura de unit tests y e2e.
- Automatizar la ejecución en CI/CD.
- Incorporar análisis estático y métricas de calidad si el proyecto lo requiere.