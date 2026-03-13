import { Request, Response } from "express";
import { HttpStatusCode } from "../../config/constants";
import { registerSchema, loginSchema } from "./auth.schemas";
import { authService } from "./auth.service";
import { LoginRequest, LoginResponse, RegisterRequest, RegisterResponse } from "./auth.types";
import { logger } from "../../common/utils/logger";

export class AuthController {
  public async register(req: Request, res: Response): Promise<void> {
    const methodName = "AuthController/register";

    logger.info(req.correlationId, `${methodName} - start`);

    const payload: RegisterRequest = registerSchema.parse(req.body);
    const result: RegisterResponse = await authService.register(req.correlationId, payload);

    logger.info(req.correlationId, `${methodName} - end - result: user registered`, {
      userId: result.user.id,
      email: result.user.email,
    });

    res.status(HttpStatusCode.CREATED).json(result);
  }

  public async login(req: Request, res: Response): Promise<void> {
    const methodName = "AuthController/login";

    logger.info(req.correlationId, `${methodName} - start`);

    const payload: LoginRequest = loginSchema.parse(req.body);
    const result: LoginResponse = await authService.login(req.correlationId, payload);

    logger.info(req.correlationId, `${methodName} - end - result: user logged-in`, {
      hasToken: Boolean(result.accessToken)
    });

    res.status(HttpStatusCode.OK).json(result);
  }
}

export const authController = new AuthController();