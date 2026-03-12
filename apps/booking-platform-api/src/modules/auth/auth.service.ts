import { AppError } from "../../common/errors/AppError";
import { HttpStatusCode } from "../../config/constants";
import { hashPassword, comparePassword } from "../../common/utils/password";
import { signAccessToken } from "../../common/utils/jwt";
import { LoginRequestDto, LoginResponseDto, RegisterRequestDto, RegisterResponseDto, UserRow } from "./auth.types";
import { authProvider, AuthProvider } from "./auth.provider";

export class AuthService {
  constructor(private readonly provider: AuthProvider = authProvider) {}

  public async register(payload: RegisterRequestDto): Promise<RegisterResponseDto> {
    const existingUser: UserRow | null = await this.provider.findUserByEmail(payload.email);

    if (existingUser) {
      throw new AppError({
        statusCode: HttpStatusCode.CONFLICT,
        code: "EMAIL_ALREADY_EXISTS",
        message: "A user with this email already exists",
      });
    }

    const passwordHash: string = await hashPassword(payload.password);
    const createdUser: UserRow | null = await this.provider.insertUser(payload.email, passwordHash, payload.fullName);

    if (!createdUser) {
      throw new AppError({
        statusCode: HttpStatusCode.INTERNAL_SERVER_ERROR,
        code: "USER_CREATION_FAILED",
        message: "Failed to create user",
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
      throw new AppError({
        statusCode: HttpStatusCode.UNAUTHORIZED,
        code: "INVALID_CREDENTIALS",
        message: "Invalid email or password",
      });
    }

    const isPasswordValid: boolean = await comparePassword(payload.password, user.password_hash);

    if (!isPasswordValid) {
      throw new AppError({
        statusCode: HttpStatusCode.UNAUTHORIZED,
        code: "INVALID_CREDENTIALS",
        message: "Invalid email or password",
      });
    }

    const accessToken: string = signAccessToken({ userId: user.id, email: user.email });

    return { accessToken };
  }
}

export const authService = new AuthService();