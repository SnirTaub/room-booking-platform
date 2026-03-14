import { NextFunction, Request, Response } from "express";
import crypto from "crypto";
import { createAppError, ErrorCodes } from "../errors/errorDefinitions";
import { getFromCache } from "../../infrastructure/redis/redis";
import { IDEMPOTENCY_BOOKING_PREFIX, IDEMPOTENCY_TTL_IN_SECONDS } from "../../config/constants";
import { MAX_IDEMPOTENCY_KEY_LENGTH } from "../../config/constants";

interface IdempotencyRecord {
  statusCode: number;
  body: unknown;
}

function hashRequestBody(body: unknown): string {
  return crypto.createHash("sha256").update(JSON.stringify(body || {})).digest("hex");
}

export async function bookingIdempotencyMiddleware(req: Request, res: Response, next: NextFunction): Promise<void> {
  const idempotencyKeyHeader: string | undefined = req.header("Idempotency-Key");

  if (!idempotencyKeyHeader) {
    throw createAppError(ErrorCodes.MISSING_IDEMPOTENCY_KEY);
  }

  if (idempotencyKeyHeader.length > MAX_IDEMPOTENCY_KEY_LENGTH) {
    throw createAppError(ErrorCodes.VALIDATION_ERROR, { message: "Idempotency-Key must be at most 128 characters" });
  }

  const userId: number | undefined = req.user?.userId;

  if (!userId) {
    throw createAppError(ErrorCodes.UNAUTHORIZED);
  }

  const requestHash: string = hashRequestBody(req.body);
  const redisKey: string = `${IDEMPOTENCY_BOOKING_PREFIX}${userId}:${idempotencyKeyHeader}`;
  const existingRecord = await getFromCache<{ requestHash: string; response: IdempotencyRecord }>(redisKey);

  if (existingRecord) {
    if (existingRecord.requestHash !== requestHash) {
      throw createAppError(ErrorCodes.IDEMPOTENCY_KEY_REUSED_WITH_DIFFERENT_PAYLOAD);
    }

    res.status(existingRecord.response.statusCode).json(existingRecord.response.body);
    return;
  }

  res.locals.idempotency = {
    redisKey,
    requestHash,
    ttlInSeconds: IDEMPOTENCY_TTL_IN_SECONDS,
  };

  next();
}