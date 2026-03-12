import { NextFunction, Request, Response } from "express";
import crypto from "crypto";
import { createAppError, ErrorCodes } from "../errors/errorDefinitions";
import { redisClient } from "../../infrastructure/redis/redis";

interface IdempotencyRecord {
  statusCode: number;
  body: unknown;
}

const IDEMPOTENCY_TTL_IN_SECONDS = 60 * 10 // 10 minutes;

function hashRequestBody(body: unknown): string {
  return crypto.createHash("sha256").update(JSON.stringify(body || {})).digest("hex");
}

export async function bookingIdempotencyMiddleware(req: Request, res: Response, next: NextFunction): Promise<void> {
  const idempotencyKeyHeader: string | undefined = req.header("Idempotency-Key");

  if (!idempotencyKeyHeader) {
    throw createAppError(ErrorCodes.MISSING_IDEMPOTENCY_KEY);
  }

  const userId: number | undefined = req.user?.userId;

  if (!userId) {
    throw createAppError(ErrorCodes.UNAUTHORIZED);
  }

  const requestHash: string = hashRequestBody(req.body);
  const redisKey: string = `idempotency:booking:${userId}:${idempotencyKeyHeader}`;
  const existingRecordRaw: string | null = await redisClient.get(redisKey);

  if (existingRecordRaw) {
    const parsedRecord: { requestHash: string; response: IdempotencyRecord } = JSON.parse(existingRecordRaw);

    if (parsedRecord.requestHash !== requestHash) {
      throw createAppError(ErrorCodes.IDEMPOTENCY_KEY_REUSED_WITH_DIFFERENT_PAYLOAD);
    }

    res.status(parsedRecord.response.statusCode).json(parsedRecord.response.body);
    return;
  }

  res.locals.idempotency = {
    redisKey,
    requestHash,
    ttlInSeconds: IDEMPOTENCY_TTL_IN_SECONDS,
  };

  next();
}