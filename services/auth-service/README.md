# Auth Service

Microservicio propietario de autenticación e identidades de usuario.

## Ejecución local

```powershell
npm install
npm run start:dev
```

Escucha en `http://localhost:3002` por defecto.

## Endpoints

- `POST /auth/login`
- `GET /auth/profile`
- `GET /users`
- `GET /users/:id`
- `POST /users`
- `PATCH /users/:id`
- `PATCH /users/:id/role`
- `DELETE /users/:id`

Las variables necesarias están documentadas en `.env.example`. En desarrollo, mientras se migran los secretos locales, también puede leer `../project-service/.env` como respaldo.
