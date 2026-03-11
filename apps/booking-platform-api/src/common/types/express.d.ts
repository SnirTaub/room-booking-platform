declare global {
  namespace Express {
    interface Request {
      correlationId?: string;
      user?: {
        userId: number;
        email: string;
      };
    }

    interface Locals {
      idempotency?: {
        redisKey: string;
        requestHash: string;
        ttlInSeconds: number;
      };
    }
  }
}

export {};