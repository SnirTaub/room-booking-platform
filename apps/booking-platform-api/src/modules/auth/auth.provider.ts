import { QueryResult } from "pg";
import { pgPool } from "../../infrastructure/db/pg";
import { UserRow } from "./auth.types";
import { logger } from "../../common/utils/logger";

export class AuthProvider {
  public async findUserByEmail(correlationId: string, email: string): Promise<UserRow | null> {
    const methodName = "AuthProvider/findUserByEmail";

    logger.info(correlationId, `${methodName} - start - input parameters`, { email });

    const result: QueryResult<UserRow> = await pgPool.query(
      `
      SELECT id, email, password_hash, full_name, created_at, updated_at
      FROM users
      WHERE email = $1
      `,
      [email]
    );

    const user: UserRow | null = result.rows[0] || null;

    logger.info(correlationId, `${methodName} - end - result: user fetched`, { email, found: Boolean(user) });

    return user;
  }

  public async insertUser(correlationId: string, email: string, passwordHash: string, fullName: string): Promise<UserRow | null> {
    const methodName = "AuthProvider/insertUser";

    logger.info(correlationId, `${methodName} - start - input parameters`, { email, fullName });

    const result: QueryResult<UserRow> = await pgPool.query(
      `
      INSERT INTO users (email, password_hash, full_name)
      VALUES ($1, $2, $3)
      RETURNING id, email, password_hash, full_name, created_at, updated_at
      `,
      [email, passwordHash, fullName]
    );

    const user: UserRow | null = result.rows[0] || null;

    logger.info(correlationId, `${methodName} - end - result: user inserted`, { email, userId: user?.id });

    return user;
  }
}

export const authProvider = new AuthProvider();

