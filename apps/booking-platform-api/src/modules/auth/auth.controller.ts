import { Request, Response } from "express";
import { HttpStatusCode } from "../../config/constants";
import { registerSchema, loginSchema } from "./auth.schemas";
import { authService } from "./auth.service";
import { LoginRequest, LoginResponse, RegisterRequest, RegisterResponse } from "./auth.types";

export class AuthController {
  public async register(req: Request, res: Response): Promise<void> {
    const payload: RegisterRequest = registerSchema.parse(req.body);
    const result: RegisterResponse = await authService.register(payload);

    res.status(HttpStatusCode.CREATED).json(result);
  }

  public async login(req: Request, res: Response): Promise<void> {
    const payload: LoginRequest = loginSchema.parse(req.body);
    const result: LoginResponse = await authService.login(payload);

    res.status(HttpStatusCode.OK).json(result);
  }
}

export const authController = new AuthController();