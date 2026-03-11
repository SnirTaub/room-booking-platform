import { NextFunction, Request, Response } from "express";
import { verifyAccessToken } from "../utils/jwt";
import { AppError } from "../errors/AppError";
import { HttpStatusCode } from "../../config/constants";

export function authMiddleware(req: Request, _res: Response, next: NextFunction): void {
  const authorizationHeader: string | undefined = req.headers.authorization;

  if (!authorizationHeader) {
    throw new AppError({
      statusCode: HttpStatusCode.UNAUTHORIZED,
      code: "MISSING_AUTHORIZATION_HEADER",
      message: "Authorization header is required",
    });
  }

  const [scheme, token] = authorizationHeader.split(" ");

  if (scheme !== "Bearer" || !token) {
    throw new AppError({
      statusCode: HttpStatusCode.UNAUTHORIZED,
      code: "INVALID_AUTHORIZATION_HEADER",
      message: "Authorization header must be: Bearer <token>",
    });
  }

  try {
    const payload = verifyAccessToken(token);

    req.user = {
      userId: payload.userId,
      email: payload.email,
    };

    next();
  } catch {
    throw new AppError({
      statusCode: HttpStatusCode.UNAUTHORIZED,
      code: "INVALID_TOKEN",
      message: "Invalid or expired token",
    });
  }
}