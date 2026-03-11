import { createClient, RedisClientType } from "redis";
import { env } from "../../config/env";

export const redisClient: RedisClientType = createClient({
  url: env.redisUrl,
});

redisClient.on("error", (error: unknown) => {
  console.error("Redis client error:", error);
});

export async function connectRedis(): Promise<void> {
  if (!redisClient.isOpen) {
    await redisClient.connect();
  }
}