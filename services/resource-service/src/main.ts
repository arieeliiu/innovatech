import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.enableCors({
    origin: configService.get<string>(
      'FRONTEND_URL',
      'http://localhost:3001',
    ),
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