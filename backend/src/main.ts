import { createLocalApp } from './bootstrap/nest-app';

async function bootstrap() {
  const app = await createLocalApp();

  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();