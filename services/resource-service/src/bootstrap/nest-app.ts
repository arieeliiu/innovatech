import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';

import { AppModule } from '../app.module';

function configureApp(app: INestApplication) {
  const configService = app.get(ConfigService);

  const allowedOrigins = [
    configService.get<string>('FRONTEND_URL'),
    'http://localhost:3000',
    'http://localhost:3001',
  ].filter((origin): origin is string => Boolean(origin));

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
  });

  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );
}

export async function createLocalApp() {
  const app = await NestFactory.create(AppModule);
  configureApp(app);

  return app;
}

export async function createVercelApp() {
  const server = express();

  const app = await NestFactory.create(
    AppModule,
    new ExpressAdapter(server),
  );

  configureApp(app);
  await app.init();

  return server;
}