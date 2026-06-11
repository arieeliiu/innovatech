import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

 const configuredFrontendUrl = configService.get<string>('FRONTEND_URL');

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

  const port = configService.get<number>('PORT', 3003);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );
  
  await app.listen(port);

  console.log(`Resource Service ejecutándose en http://localhost:${port}/api`);
}

bootstrap();