import { QueryResult } from "pg";
import { pgPool } from "../../infrastructure/db/pg";
import { AppError } from "../../common/errors/AppError";
import { HttpStatusCode } from "../../config/constants";
import { hashPassword, comparePassword } from "../../common/utils/password";
import { signAccessToken } from "../../common/utils/jwt";
import { LoginRequestDto, LoginResponseDto, RegisterRequestDto, RegisterResponseDto, UserRow } from "./auth.types";

export class AuthService {
  public async register(payload: RegisterRequestDto): Promise<RegisterResponseDto> {
    const existingUserResult: QueryResult<UserRow> = await pgPool.query(
      `
      SELECT id, email, password_hash, full_name, created_at, updated_at
      FROM users
      WHERE email = $1
      `,
      [payload.email]
    );

    if ((existingUserResult.rowCount || 0) > 0) {
      throw new AppError({
        statusCode: HttpStatusCode.CONFLICT,
        code: "EMAIL_ALREADY_EXISTS",
        message: "A user with this email already exists",
      });
    }

    const passwordHash: string = await hashPassword(payload.password);

    const insertResult: QueryResult<UserRow> = await pgPool.query(
      `
      INSERT INTO users (email, password_hash, full_name)
      VALUES ($1, $2, $3)
      RETURNING id, email, password_hash, full_name, created_at, updated_at
      `,
      [payload.email, passwordHash, payload.fullName]
    );

    const createdUser: UserRow | undefined = insertResult.rows[0];

    if (!createdUser) {
      throw new AppError({
        statusCode: HttpStatusCode.INTERNAL_SERVER_ERROR,
        code: "USER_CREATION_FAILED",
        message: "Failed to create user",
      });
    }

    const accessToken: string = signAccessToken({
      userId: createdUser.id,
      email: createdUser.email,
    });

    return {
      user: {
        id: createdUser.id,
        email: createdUser.email,
        fullName: createdUser.full_name,
      },
      accessToken,
    };
  }

  public async login(payload: LoginRequestDto): Promise<LoginResponseDto> {
    const userResult: QueryResult<UserRow> = await pgPool.query(
      `
      SELECT id, email, password_hash, full_name, created_at, updated_at
      FROM users
      WHERE email = $1
      `,
      [payload.email]
    );

    const user: UserRow | undefined = userResult.rows[0];

    if (!user) {
      throw new AppError({
        statusCode: HttpStatusCode.UNAUTHORIZED,
        code: "INVALID_CREDENTIALS",
        message: "Invalid email or password",
      });
    }

    const isPasswordValid: boolean = await comparePassword(
      payload.password,
      user.password_hash
    );

    if (!isPasswordValid) {
      throw new AppError({
        statusCode: HttpStatusCode.UNAUTHORIZED,
        code: "INVALID_CREDENTIALS",
        message: "Invalid email or password",
      });
    }

    const accessToken: string = signAccessToken({
      userId: user.id,
      email: user.email,
    });

    return { accessToken };
  }
}

export const authService = new AuthService();