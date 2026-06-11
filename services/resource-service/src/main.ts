import { ConfigService } from '@nestjs/config';
import { createLocalApp } from './bootstrap/nest-app';

async function bootstrap() {
  const app = await createLocalApp();
  const configService = app.get(ConfigService);

  const port = configService.get<number>('PORT', 3003);

  await app.listen(port);

  console.log(
    `Resource Service ejecutándose en http://localhost:${port}/api`,
  );
}

bootstrap();