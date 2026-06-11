import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  const configuredFrontendUrl =
    configService.get<string>('FRONTEND_URL');

  const allowedOrigins = [
    configuredFrontendUrl,
    'http://localhost:3000',
    'http://localhost:3001',
  ].filter((origin): origin is string => Boolean(origin));

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
  });

  app.setGlobalPrefix('api');

  const port = configService.get<number>('PORT', 3004);

  await app.listen(port);

  console.log(
    `Analytics Service ejecutándose en http://localhost:${port}/api`,
  );
}

bootstrap();