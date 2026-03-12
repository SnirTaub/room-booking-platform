import { Request, Response } from "express";
import { HttpStatusCode } from "../../config/constants";
import { ErrorDefinitions } from "../errors/errorDefinitions";

export function notFoundMiddleware(req: Request, res: Response): void {
  res.status(HttpStatusCode.NOT_FOUND).json({
    error: {
      code: ErrorDefinitions.NOT_FOUND.code,
      message: ErrorDefinitions.NOT_FOUND.message,
    },
  });
}