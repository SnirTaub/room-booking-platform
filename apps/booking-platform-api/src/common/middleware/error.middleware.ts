import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { AppError } from "../errors/AppError";
import { HttpStatusCode } from "../../config/constants";
import { ErrorDefinitions } from "../errors/errorDefinitions";
import { logger } from "../utils/logger";

export function errorMiddleware(error: unknown, req: Request, res: Response, _next: NextFunction): void {
  const methodName = "errorMiddleware";

  if (error instanceof ZodError) {
    logger.error(req.correlationId, `${methodName} - error: validation error`, {
      error: error.flatten(),
      path: req.path,
      method: req.method,
    });
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
    logger.error(req.correlationId, `${methodName} - error: handled AppError`, {
      code: error.code,
      statusCode: error.statusCode,
      details: error.details,
      path: req.path,
      method: req.method,
    });

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

  logger.error(req.correlationId, `${methodName} - error: unhandled error`, {
    error,
    path: req.path,
    method: req.method,
  });

  res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
    error: {
      code: ErrorDefinitions.INTERNAL_SERVER_ERROR.code,
      message: ErrorDefinitions.INTERNAL_SERVER_ERROR.message,
      correlationId: req.correlationId,
    },
  });
}