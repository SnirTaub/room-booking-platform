import { Pool } from "pg";
import { env } from "../../config/env";

export const pgPool = new Pool({
  host: env.database.host,
  port: env.database.port,
  database: env.database.name,
  user: env.database.user,
  password: env.database.password,
});

export async function verifyPostgresConnection(): Promise<void> {
  await pgPool.query("SELECT 1");
}