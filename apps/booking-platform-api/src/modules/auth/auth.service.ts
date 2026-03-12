import { HttpStatusCode } from "../../config/constants";
import { hashPassword, comparePassword } from "../../common/utils/password";
import { signAccessToken } from "../../common/utils/jwt";
import { LoginRequestDto, LoginResponseDto, RegisterRequestDto, RegisterResponseDto, UserRow } from "./auth.types";
import { authProvider, AuthProvider } from "./auth.provider";
import { createAppError, ErrorCodes } from "../../common/errors/errorDefinitions";

export class AuthService {
  constructor(private readonly provider: AuthProvider = authProvider) {}

  public async register(payload: RegisterRequestDto): Promise<RegisterResponseDto> {
    const existingUser: UserRow | null = await this.provider.findUserByEmail(payload.email);

    if (existingUser) {
      throw createAppError(ErrorCodes.EMAIL_ALREADY_EXISTS, {
        statusCode: HttpStatusCode.CONFLICT,
      });
    }

    const passwordHash: string = await hashPassword(payload.password);
    const createdUser: UserRow | null = await this.provider.insertUser(payload.email, passwordHash, payload.fullName);

    if (!createdUser) {
      throw createAppError(ErrorCodes.USER_CREATION_FAILED, {
        statusCode: HttpStatusCode.INTERNAL_SERVER_ERROR,
      });
    }

    const accessToken: string = signAccessToken({ userId: createdUser.id, email: createdUser.email });

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
    const user: UserRow | null = await this.provider.findUserByEmail(payload.email);

    if (!user) {
      throw createAppError(ErrorCodes.INVALID_CREDENTIALS, {
        statusCode: HttpStatusCode.UNAUTHORIZED,
      });
    }

    const isPasswordValid: boolean = await comparePassword(payload.password, user.password_hash);

    if (!isPasswordValid) {
      throw createAppError(ErrorCodes.INVALID_CREDENTIALS, {
        statusCode: HttpStatusCode.UNAUTHORIZED,
      });
    }

    const accessToken: string = signAccessToken({ userId: user.id, email: user.email });

    return { accessToken };
  }
}

export const authService = new AuthService();