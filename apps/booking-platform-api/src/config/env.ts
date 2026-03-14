import dotenv from "dotenv";
import { parseCorsOrigins } from "./parseCorsOrigins";

dotenv.config();

function getEnv(name: string): string {
  const value: string | undefined = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function getNumberEnv(name: string): number {
  const rawValue: string = getEnv(name);
  const parsedValue: number = Number(rawValue);

  if (Number.isNaN(parsedValue)) {
    throw new Error(`Environment variable ${name} must be a valid number`);
  }

  return parsedValue;
}

export const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: getNumberEnv("PORT"),

  corsOrigin: parseCorsOrigins(getEnv("CORS_ORIGIN").trim()),

  database: {
    host: getEnv("DATABASE_HOST"),
    port: getNumberEnv("DATABASE_PORT"),
    name: getEnv("DATABASE_NAME"),
    user: getEnv("DATABASE_USER"),
    password: getEnv("DATABASE_PASSWORD"),
  },

  redisUrl: getEnv("REDIS_URL"),

  jwt: {
    secret: getEnv("JWT_SECRET"),
    expiresIn: getEnv("JWT_EXPIRES_IN"),
  },
} as const;