import { INestApplication, ValidationPipe } from "@nestjs/common";

export function configureApp(app: INestApplication) {
  const origins = [
    process.env.FRONTEND_URL,
    "http://localhost:3000",
    "http://localhost:3001",
  ].filter((origin): origin is string => Boolean(origin));

  app.enableCors({ origin: origins, credentials: true });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );
}
