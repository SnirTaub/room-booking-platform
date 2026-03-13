import { HttpStatusCode } from "../../config/constants";
import { hashPassword, comparePassword } from "../../common/utils/password";
import { signAccessToken } from "../../common/utils/jwt";
import { LoginRequest, LoginResponse, RegisterRequest, RegisterResponse, UserRow } from "./auth.types";
import { authProvider, AuthProvider } from "./auth.provider";
import { createAppError, ErrorCodes } from "../../common/errors/errorDefinitions";
import { logger } from "../../common/utils/logger";

export class AuthService {
  constructor(private readonly provider: AuthProvider = authProvider) {}

  public async register(correlationId: string, payload: RegisterRequest): Promise<RegisterResponse> {
    const methodName = "AuthService/register";

    logger.info(correlationId, `${methodName} - start - input parameters`, { email: payload.email });

    const existingUser: UserRow | null = await this.provider.findUserByEmail(correlationId, payload.email);

    if (existingUser) {
      logger.error(correlationId, `${methodName} - error: email already exists`, { email: payload.email });

      throw createAppError(ErrorCodes.EMAIL_ALREADY_EXISTS, {
        statusCode: HttpStatusCode.CONFLICT,
      });
    }

    const passwordHash: string = await hashPassword(payload.password);
    const createdUser: UserRow | null = await this.provider.insertUser(correlationId, payload.email, passwordHash, payload.fullName);

    if (!createdUser) {
      logger.error(correlationId, `${methodName} - error: user creation failed`, { email: payload.email });

      throw createAppError(ErrorCodes.USER_CREATION_FAILED, {
        statusCode: HttpStatusCode.INTERNAL_SERVER_ERROR,
      });
    }

    const accessToken: string = signAccessToken({ userId: createdUser.id, email: createdUser.email });

    const response: RegisterResponse = {
      user: {
        id: createdUser.id,
        email: createdUser.email,
        fullName: createdUser.full_name,
      },
      accessToken,
    };

    logger.info(correlationId, `${methodName} - end - result: user registered`, {
      userId: createdUser.id,
      email: createdUser.email,
    });

    return response;
  }

  public async login(correlationId: string, payload: LoginRequest): Promise<LoginResponse> {
    const methodName = "AuthService/login";

    logger.info(correlationId, `${methodName} - start - input parameters`, { email: payload.email });

    const user: UserRow | null = await this.provider.findUserByEmail(correlationId, payload.email);

    if (!user) {
      logger.error(correlationId, `${methodName} - error: user not found`, { email: payload.email });

      throw createAppError(ErrorCodes.INVALID_CREDENTIALS, {
        statusCode: HttpStatusCode.UNAUTHORIZED,
      });
    }

    const isPasswordValid: boolean = await comparePassword(payload.password, user.password_hash);

    if (!isPasswordValid) {
      logger.error(correlationId, `${methodName} - error: invalid password`, {
        userId: user.id,
        email: user.email,
      });

      throw createAppError(ErrorCodes.INVALID_CREDENTIALS, {
        statusCode: HttpStatusCode.UNAUTHORIZED,
      });
    }

    const accessToken: string = signAccessToken({ userId: user.id, email: user.email });

    const response: LoginResponse = { accessToken };

    logger.info(correlationId, `${methodName} - end - result: login successful`, { userId: user.id, email: user.email });

    return response;
  }
}

export const authService = new AuthService();