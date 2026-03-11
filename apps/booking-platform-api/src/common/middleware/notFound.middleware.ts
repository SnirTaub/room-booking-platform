import { Request, Response } from "express";
import { HttpStatusCode } from "../../config/constants";

export function notFoundMiddleware(req: Request, res: Response): void {
  res.status(HttpStatusCode.NOT_FOUND).json({
    error: {
      code: "NOT_FOUND",
      message: `Route not found: ${req.method} ${req.originalUrl}`,
    },
  });
}