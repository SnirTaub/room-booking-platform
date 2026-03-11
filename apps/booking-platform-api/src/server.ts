import { createApp } from "./app";
import { env } from "./config/env";
import { verifyPostgresConnection } from "./infrastructure/db/pg";
import { connectRedis } from "./infrastructure/redis/redis";

async function bootstrap(): Promise<void> {
  await verifyPostgresConnection();
  await connectRedis();

  const app = createApp();

  app.listen(env.port, () => {
    console.log(`API server is running on http://localhost:${env.port}`);
  });
}

bootstrap().catch((error: unknown) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});