import { ConfigService } from "@nestjs/config";
import { createLocalApp } from "./bootstrap/nest-app";

async function bootstrap() {
  const app = await createLocalApp();

  const config = app.get(ConfigService);
  const port = config.get<number>("PORT", 3002);

  await app.listen(port);
  console.log(`Auth Service ejecutándose en http://localhost:${port}`);
}

void bootstrap();
