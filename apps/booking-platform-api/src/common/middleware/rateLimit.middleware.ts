import { NextFunction, Request, Response } from "express";
import { createAppError, ErrorCodes } from "../errors/errorDefinitions";
import { redisClient } from "../../infrastructure/redis/redis";

interface RateLimitOptions {
  windowInSeconds: number;
  maxRequests: number;
  keyPrefix: string;
  keyGenerator?: (req: Request) => string;
}

function getClientIdentifier(req: Request): string {
  return req.ip || "unknown";
}

export function rateLimitMiddleware(options: RateLimitOptions) {
  return function rateLimit(req: Request, _res: Response, next: NextFunction): void {
    void (async () => {
      const rawKey: string = options.keyGenerator ? options.keyGenerator(req) : getClientIdentifier(req);

      const redisKey: string = `${options.keyPrefix}:${rawKey}`;

      const currentCount: number = await redisClient.incr(redisKey);

      if (currentCount === 1) {
        await redisClient.expire(redisKey, options.windowInSeconds);
      }

      if (currentCount > options.maxRequests) {
        return next(createAppError(ErrorCodes.RATE_LIMIT_EXCEEDED));
      }

      next();
    })().catch(next);
  };
}