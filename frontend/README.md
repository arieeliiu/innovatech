# Frontend - Innovatech Solutions

Frontend desarrollado en Next.js para la interfaz operativa de Innovatech Solutions. Centraliza la navegación, la autenticación de usuario y el consumo de APIs para proyectos, tareas, usuarios, recursos y analítica.

## Rol dentro del sistema

La aplicación presenta la capa visual del sistema y actúa como consumidor de los servicios backend. Desde aquí se muestran los paneles de administración, las vistas de proyectos y los accesos a recursos y analítica general.

La lógica de negocio sensible no se resuelve en el frontend. Ese trabajo se delega a los servicios NestJS y a Supabase.

## Tecnologías usadas

- Next.js 16 con App Router
- React 19
- TypeScript
- Tailwind CSS 4
- Lucide React

## Estructura principal

```txt
frontend/
├── src/
│   ├── app/
│   ├── components/
│   ├── lib/
│   └── types/
├── public/
├── package.json
└── README.md
```

- `src/app/` contiene las rutas y páginas.
- `src/components/` concentra componentes reutilizables.
- `src/lib/` agrupa la comunicación con APIs y la lógica auxiliar de sesión y permisos.
- `src/types/` define tipos compartidos de dominio.

## Funcionalidades principales

- Inicio de sesión y lectura del token almacenado localmente.
- Redirección y restricciones básicas por rol.
- Gestión visual de proyectos, tareas y miembros de proyecto.
- Administración de usuarios desde el panel correspondiente.
- Consulta de recursos y analítica general mediante servicios separados.
- Centralización de peticiones HTTP en `src/lib/api.ts`.

## Comandos disponibles

```bash
npm install
npm run dev
npm run build
npm run start
npm run lint
```

## Variables de entorno necesarias

Crear `frontend/.env.local` con valores de referencia:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_RESOURCE_SERVICE_URL=http://localhost:3003
NEXT_PUBLIC_ANALYTICS_SERVICE_URL=http://localhost:3004
```

## Limitaciones actuales

- No se localizaron pruebas automatizadas en el frontend.
- La experiencia depende de que los servicios backend estén disponibles y con las URLs correctas.
- La protección de rutas y la persistencia de sesión pueden reforzarse.

## Mejoras futuras

- Añadir pruebas automatizadas.
- Endurecer la protección de rutas según rol.
- Mejorar estados de carga, manejo de errores y feedback visual.
- Unificar todavía más la lectura de sesión y permisos.

## Nota técnica

El frontend ya centraliza las llamadas HTTP y parte de la normalización de roles. Esto ayuda a mantener la interfaz más legible y reduce duplicación en las vistas.