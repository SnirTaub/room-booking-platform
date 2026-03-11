import { Request, Response } from "express";
import { HttpStatusCode } from "../../config/constants";
import { registerSchema, loginSchema } from "./auth.schemas";
import { authService } from "./auth.service";
import { LoginRequestDto, LoginResponseDto, RegisterRequestDto, RegisterResponseDto } from "./auth.types";

export class AuthController {
  public async register(req: Request, res: Response): Promise<void> {
    const payload: RegisterRequestDto = registerSchema.parse(req.body);
    const result: RegisterResponseDto = await authService.register(payload);

    res.status(HttpStatusCode.CREATED).json(result);
  }

  public async login(req: Request, res: Response): Promise<void> {
    const payload: LoginRequestDto = loginSchema.parse(req.body);
    const result: LoginResponseDto = await authService.login(payload);

    res.status(HttpStatusCode.OK).json(result);
  }
}

export const authController = new AuthController();