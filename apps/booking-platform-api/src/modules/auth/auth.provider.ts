import { QueryResult } from "pg";
import { pgPool } from "../../infrastructure/db/pg";
import { UserRow } from "./auth.types";

export class AuthProvider {
  public async findUserByEmail(email: string): Promise<UserRow | null> {
    const result: QueryResult<UserRow> = await pgPool.query(
      `
      SELECT id, email, password_hash, full_name, created_at, updated_at
      FROM users
      WHERE email = $1
      `,
      [email]
    );

    return result.rows[0] || null;
  }

  public async insertUser(email: string, passwordHash: string, fullName: string): Promise<UserRow | null> {
    const result: QueryResult<UserRow> = await pgPool.query(
      `
      INSERT INTO users (email, password_hash, full_name)
      VALUES ($1, $2, $3)
      RETURNING id, email, password_hash, full_name, created_at, updated_at
      `,
      [email, passwordHash, fullName]
    );

    return result.rows[0] || null;
  }
}

export const authProvider = new AuthProvider();