import { ConfigService } from '@nestjs/config';
import { createLocalApp } from './bootstrap/nest-app';

async function bootstrap() {
  const app = await createLocalApp();
  const configService = app.get(ConfigService);

  const port = configService.get<number>('PORT', 3004);

  await app.listen(port);

  console.log(
    `Analytics Service ejecutándose en http://localhost:${port}/api`,
  );
}

bootstrap();