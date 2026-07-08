import { NestFactory } from "@nestjs/core";
import { ExpressAdapter } from "@nestjs/platform-express";
import express from "express";
import { AppModule } from "../app.module";
import { configureApp } from "./configure-app";

export async function createLocalApp() {
  const app = await NestFactory.create(AppModule);
  configureApp(app);
  return app;
}

export async function createVercelApp() {
  const server = express();
  const app = await NestFactory.create(AppModule, new ExpressAdapter(server));

  configureApp(app);
  await app.init();
  return server;
}
