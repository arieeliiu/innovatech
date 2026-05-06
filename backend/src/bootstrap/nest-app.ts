import { INestApplication, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import * as dotenv from 'dotenv';
import express from 'express';

import { AppModule } from '../app.module';

dotenv.config();

const LOCAL_FRONTEND_ORIGIN = 'http://localhost:3001';

function getAllowedOrigins() {
  return [LOCAL_FRONTEND_ORIGIN, process.env.FRONTEND_URL].filter(
    (origin): origin is string => Boolean(origin),
  );
}

function applyCommonConfiguration(app: INestApplication) {
  const allowedOrigins = new Set(getAllowedOrigins());

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.has(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error(`CORS blocked for origin: ${origin}`), false);
    },
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );
}

export async function createLocalApp() {
  const app = await NestFactory.create(AppModule);

  applyCommonConfiguration(app);

  return app;
}

export async function createVercelApp() {
  const server = express();
  const app = await NestFactory.create(AppModule, new ExpressAdapter(server));

  applyCommonConfiguration(app);
  await app.init();

  return server;
}
