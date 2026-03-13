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

export async function getFromCache<T>(key: string): Promise<T | null> {
  const raw = await redisClient.get(key);
  if (!raw) {
    return null;
  }
  return JSON.parse(raw) as T;
}

export async function setInCache(key: string, value: unknown, ttlSeconds?: number): Promise<void> {
  const stringifiedValue = JSON.stringify(value);

  if (ttlSeconds && ttlSeconds > 0) {
    await redisClient.set(key, stringifiedValue, { EX: ttlSeconds });
  } else {
    await redisClient.set(key, stringifiedValue);
  }
}

export async function deleteFromCache(key: string): Promise<void> {
  await redisClient.del(key);
}

export async function deleteByPattern(pattern: string): Promise<void> {
  const keys = await redisClient.keys(pattern);
  if (!keys.length) {
    return;
  }
  await redisClient.del(keys);
}