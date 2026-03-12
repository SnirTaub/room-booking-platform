import { NextFunction, Request, Response } from "express";
import { verifyAccessToken } from "../utils/jwt";
import { createAppError, ErrorCodes } from "../errors/errorDefinitions";

export function authMiddleware(req: Request, _res: Response, next: NextFunction): void {
  const authorizationHeader: string | undefined = req.headers.authorization;

  if (!authorizationHeader) {
    throw createAppError(ErrorCodes.MISSING_AUTHORIZATION_HEADER);
  }

  const [scheme, token] = authorizationHeader.split(" ");

  if (scheme !== "Bearer" || !token) {
    throw createAppError(ErrorCodes.INVALID_AUTHORIZATION_HEADER);
  }

  try {
    const payload = verifyAccessToken(token);

    req.user = {
      userId: payload.userId,
      email: payload.email,
    };

    next();
  } catch {
    throw createAppError(ErrorCodes.INVALID_TOKEN);
  }
}