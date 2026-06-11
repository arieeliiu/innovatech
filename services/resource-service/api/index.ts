import { createVercelApp } from '../src/bootstrap/nest-app';

let cachedServer: Awaited<ReturnType<typeof createVercelApp>> | null = null;

let cachedInitialization: Promise<
  Awaited<ReturnType<typeof createVercelApp>>
> | null = null;

async function getServer() {
  if (cachedServer) {
    return cachedServer;
  }

  cachedInitialization ??= createVercelApp().then((server) => {
    cachedServer = server;
    return server;
  });

  return cachedInitialization;
}

export default async function handler(req: unknown, res: unknown) {
  const server = await getServer();
  server(req as never, res as never);
}