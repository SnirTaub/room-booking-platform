import { createApp } from "./app";
import { env } from "./config/env";
import { verifyPostgresConnection } from "./infrastructure/db/pg";
import { connectRedis } from "./infrastructure/redis/redis";
import { logger } from "./common/utils/logger";

async function bootstrap(): Promise<void> {
  const methodName = "bootstrap";

  await verifyPostgresConnection();
  await connectRedis();

  const app = createApp();

  app.listen(env.port, () => {
    logger.info("system", `${methodName} - end - API server started`, { port: env.port });
  });
}

bootstrap().catch((error: unknown) => {
  logger.error("system", "bootstrap - error: failed to start server", { error });
  process.exit(1);
});