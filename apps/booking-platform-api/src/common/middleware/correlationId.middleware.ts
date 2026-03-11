import { NextFunction, Request, Response } from "express";
import crypto from "crypto";

export function correlationIdMiddleware(req: Request, res: Response, next: NextFunction): void {
  const correlationId: string = crypto.randomUUID();

  req.correlationId = correlationId;
  res.setHeader("X-Correlation-Id", correlationId);

  next();
}