# Backend - Innovatech Solutions

> La autenticación y la administración de usuarios se trasladaron a
> `services/auth-service`. Este servicio conserva únicamente la validación de
> JWT y autorización necesarias para proteger las rutas de proyectos.

Backend desarrollado en **NestJS** para el proyecto **Innovatech Solutions**. Su objetivo es actuar como la capa de servicios de la plataforma, exponiendo una API para que el frontend pueda autenticarse, gestionar usuarios, administrar proyectos y preparar la integración futura con herramientas externas de gestión, recursos y analítica.

Este backend forma parte de una arquitectura pensada originalmente bajo un enfoque de **microservicios**, donde cada área funcional del sistema puede evolucionar de forma independiente. Para esta entrega se implementó de forma prioritaria el núcleo funcional asociado a autenticación, usuarios, proyectos y tareas, manteniendo una estructura modular que permite escalar hacia los demás servicios planificados.

---

## Rol del backend dentro del sistema

El backend cumple la función de intermediario entre el frontend de Innovatech Solutions y los servicios de datos o plataformas externas. En vez de conectar el frontend directamente con cada herramienta, el backend centraliza la lógica de negocio, las validaciones, la autenticación y la comunicación con los servicios externos.

Esto permite que el sistema sea más ordenado, seguro y mantenible, ya que las reglas principales no quedan distribuidas en la interfaz de usuario, sino concentradas en una capa de servicios.

---

## Enfoque de microservicios planificado

La solución fue diseñada considerando tres servicios funcionales:

### 1. Servicio de gestión de proyectos

Responsable de administrar proyectos, tareas, responsables, estados, progreso e historial de cambios. Este servicio representa el núcleo operativo de la plataforma, ya que permite controlar el avance del trabajo y mantener trazabilidad sobre las actividades realizadas.

En la implementación actual, este es el servicio con mayor desarrollo dentro del backend.

### 2. Servicio de gestión de recursos

Servicio proyectado para administrar información relacionada con personas, equipos de trabajo, disponibilidad, carga laboral y recursos asociados a los proyectos. Su propósito es apoyar la asignación de responsabilidades y mejorar la planificación interna.

En una evolución futura, este servicio podría integrarse con herramientas externas de recursos humanos o control de horas.

### 3. Servicio de analítica y reportes

Servicio proyectado para consolidar información del sistema y transformarla en métricas útiles para la toma de decisiones. Su objetivo es entregar indicadores sobre avance de proyectos, productividad, carga de trabajo y estado general de la operación.

En una evolución futura, este servicio podría alimentar herramientas de inteligencia de negocios como Metabase.

---

## Estado actual de implementación

Actualmente, el backend implementa el núcleo base necesario para operar la plataforma:

- autenticación de usuarios;
- validación de token mediante guard;
- gestión de usuarios;
- creación y consulta de proyectos;
- gestión de tareas asociadas a proyectos;
- actualización de estados y progreso de tareas;
- registro de historial de cambios;
- administración de miembros de proyecto.

Aunque la arquitectura fue pensada para tres servicios principales, en esta etapa se priorizó el desarrollo del servicio central de gestión de proyectos y usuarios, dejando preparados los criterios de separación modular para futuras ampliaciones.

---

## Tecnologías utilizadas

- **NestJS**: framework principal del backend.
- **TypeScript**: lenguaje utilizado para mejorar legibilidad, tipado y mantenibilidad.
- **Supabase**: servicio utilizado para autenticación y persistencia de datos.
- **class-validator / class-transformer**: validación y transformación de datos mediante DTOs.
- **Node.js**: entorno de ejecución.

---

## Estructura general

```txt
backend/
├── src/
│   ├── auth/
│   │   ├── controllers/
│   │   ├── guards/
│   │   ├── services/
│   │   └── auth.module.ts
│   ├── users/
│   │   ├── controllers/
│   │   ├── dto/
│   │   ├── services/
│   │   └── users.module.ts
│   ├── projects/
│   │   ├── controllers/
│   │   ├── dto/
│   │   ├── services/
│   │   └── projects.module.ts
│   ├── app.module.ts
│   └── main.ts
├── package.json
└── README.md
```

## Quick Start

```bash
npm install
npm run start:dev
