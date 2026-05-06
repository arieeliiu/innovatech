# Frontend - Innovatech Solutions

Frontend desarrollado en **Next.js** para el proyecto **Innovatech Solutions**. Esta aplicación corresponde a la interfaz visual del sistema, permitiendo que los usuarios inicien sesión, accedan a las funcionalidades disponibles según su rol y gestionen información relacionada con proyectos, tareas y usuarios.

El frontend se comunica con el backend mediante peticiones HTTP, utilizando una capa centralizada de conexión para evitar duplicar lógica de consumo de API en cada vista.

---

## Rol del frontend dentro del sistema

El frontend cumple la función de presentar una interfaz clara y usable para los distintos usuarios de Innovatech Solutions.

Desde esta capa se realizan acciones como:

- iniciar sesión;
- almacenar temporalmente el token de acceso;
- redirigir usuarios según su rol;
- visualizar proyectos;
- administrar usuarios;
- crear y consultar tareas;
- actualizar estados de tareas;
- consultar miembros asociados a proyectos.

La lógica crítica del sistema no se concentra en el frontend, sino que se delega al backend. Esto permite mantener una separación ordenada entre presentación, reglas de negocio y persistencia de datos.

---

## Tecnologías utilizadas

- **Next.js**: framework principal del frontend.
- **React**: construcción de interfaces mediante componentes.
- **TypeScript**: tipado del código para mejorar legibilidad y mantenimiento.
- **Tailwind CSS**: estilos visuales de la aplicación.
- **Lucide React**: librería de íconos utilizada en la interfaz.

---

## Estructura general

```txt
frontend/
├── src/
│   ├── app/
│   │   ├── admin/
│   │   ├── projects/
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   └── lib/
│       ├── api.ts
│       ├── auth.ts
│       └── userRules.ts
├── public/
├── package.json
└── README.md
```

La estructura separa las vistas principales, componentes reutilizables y funciones auxiliares. Esto permite mantener el código más ordenado y facilita futuras modificaciones.

---

## Principales carpetas

### `src/app/`

Contiene las rutas principales de la aplicación. En esta carpeta se ubican las páginas visibles para el usuario, como el login, el panel de administración y las vistas relacionadas con proyectos.

### `src/components/`

Contiene componentes reutilizables de la interfaz. Su propósito es evitar duplicar código visual y mantener una estructura más limpia.

### `src/lib/`

Contiene funciones auxiliares que pueden ser utilizadas por distintas partes del frontend.

Algunos ejemplos:

- `api.ts`: centraliza las peticiones al backend.
- `auth.ts`: contiene funciones relacionadas con token, usuario y rol.
- `userRules.ts`: define reglas y opciones asociadas a usuarios.

---

## Conexión con el backend

La conexión con el backend se realiza mediante la variable de entorno:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

Esta variable indica la URL base donde se encuentra ejecutándose el backend.

El archivo `src/lib/api.ts` centraliza las solicitudes HTTP. Esto evita repetir en cada página la URL del backend, los headers, el token de autorización y el manejo básico de errores.

Este enfoque mejora la mantenibilidad del código, ya que cualquier ajuste en la comunicación con el backend puede realizarse desde un solo archivo.

---

## Variables de entorno

Para ejecutar el frontend correctamente, se debe crear un archivo `.env.local` dentro de la carpeta `frontend`.

Ejemplo:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

En caso de desplegar el frontend en Vercel u otra plataforma, esta variable debe configurarse también en el panel de variables de entorno del servicio de despliegue.

---

## Instalación

Desde la carpeta `frontend`, ejecutar:

```bash
npm install
```

---

## Ejecución en desarrollo

```bash
npm run dev
```

Luego abrir la aplicación en el navegador:

```txt
http://localhost:3000
```

---

## Compilación del proyecto

```bash
npm run build
```

Este comando genera una versión optimizada del frontend para producción.

---

## Ejecución en producción

Después de compilar el proyecto, se puede ejecutar con:

```bash
npm run start
```

---

## Revisión de código

```bash
npm run lint
```

Este comando permite revisar posibles problemas de estilo o errores detectables por ESLint.

---

## Scripts disponibles

```bash
npm run dev      # Ejecuta el frontend en modo desarrollo
npm run build    # Compila el proyecto para producción
npm run start    # Ejecuta la versión compilada
npm run lint     # Revisa el código con ESLint
```

---

## Patrones y criterios de diseño aplicados

### Component Pattern

El frontend utiliza componentes reutilizables para separar partes de la interfaz. Esto evita repetir código y permite que la aplicación sea más fácil de mantener.

### Separación de responsabilidades

La aplicación separa la interfaz visual, la comunicación con el backend y las reglas auxiliares en archivos distintos.

Ejemplo:

- las páginas se encargan de mostrar vistas;
- `api.ts` se encarga de comunicarse con el backend;
- `auth.ts` se encarga de interpretar datos del token;
- `userRules.ts` concentra reglas asociadas a usuarios.

Esta separación permite que el código sea más legible y fácil de modificar.

### Centralización de peticiones HTTP

Las llamadas al backend se concentran en una capa común. Esto reduce duplicación, ya que no es necesario repetir manualmente la configuración de `fetch`, headers, token y manejo de errores en cada página.

---

## Métodos síncronos y asíncronos

El frontend utiliza métodos **asíncronos** cuando debe comunicarse con el backend, por ejemplo al iniciar sesión, consultar proyectos, crear usuarios o actualizar tareas.

Esto es necesario porque esas operaciones dependen de una respuesta externa y no deben bloquear la interacción general de la aplicación.

También se utilizan métodos **síncronos** para operaciones simples que no requieren consultar servicios externos, como normalizar roles, validar reglas locales o leer información almacenada en el navegador.

Esta diferencia permite mantener un flujo eficiente para usuarios, especialmente pensando en un sistema que puede ser utilizado por varias personas al mismo tiempo.

---

## Relación con la arquitectura del sistema

El frontend forma parte de una arquitectura separada en capas:

```txt
Usuario
  ↓
Frontend Next.js
  ↓
Backend NestJS
  ↓
Supabase / Servicios externos
```

Esta separación permite que la interfaz pueda evolucionar sin modificar directamente la lógica interna del backend o la estructura de datos.

---

## Proyección de mejora

Como mejora futura, el frontend puede incorporar:

- protección más completa de rutas según rol;
- vistas específicas para cada tipo de usuario;
- manejo global de sesión;
- mejor feedback visual en formularios;
- estados de carga;
- validaciones visuales más detalladas;
- integración con futuros módulos de recursos y analítica.

---

## Resumen

El frontend de Innovatech Solutions entrega la interfaz principal del sistema y se comunica con el backend mediante una capa centralizada de API. Su estructura busca mantener el código ordenado, legible y reutilizable, aplicando separación de responsabilidades y componentes reutilizables para facilitar el mantenimiento y futuras ampliaciones.