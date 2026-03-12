import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { AppError } from "../errors/AppError";
import { HttpStatusCode } from "../../config/constants";
import { ErrorDefinitions } from "../errors/errorDefinitions";

export function errorMiddleware(error: unknown, req: Request, res: Response, _next: NextFunction): void {
  if (error instanceof ZodError) {
    res.status(HttpStatusCode.BAD_REQUEST).json({
      error: {
        code: ErrorDefinitions.VALIDATION_ERROR.code,
        message: ErrorDefinitions.VALIDATION_ERROR.message,
        details: error.flatten(),
        correlationId: req.correlationId,
      },
    });
    return;
  }

  if (error instanceof AppError) {
    res.status(error.statusCode).json({
      error: {
        code: error.code,
        message: error.message,
        details: error.details,
        correlationId: req.correlationId,
      },
    });
    return;
  }

  console.error("Unhandled error:", error);

  res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
    error: {
      code: ErrorDefinitions.INTERNAL_SERVER_ERROR.code,
      message: ErrorDefinitions.INTERNAL_SERVER_ERROR.message,
      correlationId: req.correlationId,
    },
  });
}