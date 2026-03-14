import { HttpStatusCode } from "../../config/constants";
import { AppError } from "./AppError";

export const ErrorDefinitions = {
  NOT_FOUND: {
    code: "NOT_FOUND",
    statusCode: HttpStatusCode.NOT_FOUND,
    message: "Resource not found",
  },
  VALIDATION_ERROR: {
    code: "VALIDATION_ERROR",
    statusCode: HttpStatusCode.BAD_REQUEST,
    message: "Request validation failed",
  },
  INTERNAL_SERVER_ERROR: {
    code: "INTERNAL_SERVER_ERROR",
    statusCode: HttpStatusCode.INTERNAL_SERVER_ERROR,
    message: "An unexpected error occurred",
  },
  MISSING_AUTHORIZATION_HEADER: {
    code: "MISSING_AUTHORIZATION_HEADER",
    statusCode: HttpStatusCode.UNAUTHORIZED,
    message: "Authorization header is required",
  },
  INVALID_AUTHORIZATION_HEADER: {
    code: "INVALID_AUTHORIZATION_HEADER",
    statusCode: HttpStatusCode.UNAUTHORIZED,
    message: "Authorization header must be: Bearer <token>",
  },
  INVALID_TOKEN: {
    code: "INVALID_TOKEN",
    statusCode: HttpStatusCode.UNAUTHORIZED,
    message: "Invalid or expired token",
  },
  RATE_LIMIT_EXCEEDED: {
    code: "RATE_LIMIT_EXCEEDED",
    statusCode: HttpStatusCode.TOO_MANY_REQUESTS,
    message: "Too many requests, please try again later",
  },
  MISSING_IDEMPOTENCY_KEY: {
    code: "MISSING_IDEMPOTENCY_KEY",
    statusCode: HttpStatusCode.BAD_REQUEST,
    message: "Idempotency-Key header is required",
  },
  UNAUTHORIZED: {
    code: "UNAUTHORIZED",
    statusCode: HttpStatusCode.UNAUTHORIZED,
    message: "User must be authenticated",
  },
  IDEMPOTENCY_KEY_REUSED_WITH_DIFFERENT_PAYLOAD: {
    code: "IDEMPOTENCY_KEY_REUSED_WITH_DIFFERENT_PAYLOAD",
    statusCode: HttpStatusCode.CONFLICT,
    message: "This Idempotency-Key was already used with a different request payload",
  },
  IDEMPOTENCY_KEY_INVALID_LENGTH: {
    code: "IDEMPOTENCY_KEY_INVALID_LENGTH",
    statusCode: HttpStatusCode.BAD_REQUEST,
    message: "Idempotency-Key must be at most 128 characters",
  },
  ROOM_NOT_FOUND: {
    code: "ROOM_NOT_FOUND",
    statusCode: HttpStatusCode.NOT_FOUND,
    message: "Room not found",
  },
  ROOM_ALREADY_BOOKED: {
    code: "ROOM_ALREADY_BOOKED",
    statusCode: HttpStatusCode.CONFLICT,
    message: "Room is already booked for this time slot",
  },
  EMAIL_ALREADY_EXISTS: {
    code: "EMAIL_ALREADY_EXISTS",
    statusCode: HttpStatusCode.CONFLICT,
    message: "A user with this email already exists",
  },
  USER_CREATION_FAILED: {
    code: "USER_CREATION_FAILED",
    statusCode: HttpStatusCode.INTERNAL_SERVER_ERROR,
    message: "Failed to create user",
  },
  INVALID_CREDENTIALS: {
    code: "INVALID_CREDENTIALS",
    statusCode: HttpStatusCode.UNAUTHORIZED,
    message: "Invalid email or password",
  },
} as const;

export const ErrorCodes = {
  NOT_FOUND: ErrorDefinitions.NOT_FOUND.code,
  VALIDATION_ERROR: ErrorDefinitions.VALIDATION_ERROR.code,
  INTERNAL_SERVER_ERROR: ErrorDefinitions.INTERNAL_SERVER_ERROR.code,
  MISSING_AUTHORIZATION_HEADER: ErrorDefinitions.MISSING_AUTHORIZATION_HEADER.code,
  INVALID_AUTHORIZATION_HEADER: ErrorDefinitions.INVALID_AUTHORIZATION_HEADER.code,
  INVALID_TOKEN: ErrorDefinitions.INVALID_TOKEN.code,
  RATE_LIMIT_EXCEEDED: ErrorDefinitions.RATE_LIMIT_EXCEEDED.code,
  MISSING_IDEMPOTENCY_KEY: ErrorDefinitions.MISSING_IDEMPOTENCY_KEY.code,
  UNAUTHORIZED: ErrorDefinitions.UNAUTHORIZED.code,
  IDEMPOTENCY_KEY_REUSED_WITH_DIFFERENT_PAYLOAD: ErrorDefinitions.IDEMPOTENCY_KEY_REUSED_WITH_DIFFERENT_PAYLOAD.code,
  IDEMPOTENCY_KEY_INVALID_LENGTH: ErrorDefinitions.IDEMPOTENCY_KEY_INVALID_LENGTH.code,
  ROOM_NOT_FOUND: ErrorDefinitions.ROOM_NOT_FOUND.code,
  ROOM_ALREADY_BOOKED: ErrorDefinitions.ROOM_ALREADY_BOOKED.code,
  EMAIL_ALREADY_EXISTS: ErrorDefinitions.EMAIL_ALREADY_EXISTS.code,
  USER_CREATION_FAILED: ErrorDefinitions.USER_CREATION_FAILED.code,
  INVALID_CREDENTIALS: ErrorDefinitions.INVALID_CREDENTIALS.code,
} as const;

export type ErrorCode = keyof typeof ErrorDefinitions;

export function createAppError(code: ErrorCode, overrides?: { message?: string; statusCode?: number; details?: unknown }): AppError {
  const definition = ErrorDefinitions[code];

  return new AppError({
    code: definition.code,
    statusCode: overrides?.statusCode || definition.statusCode,
    message: overrides?.message || definition.message,
    details: overrides?.details,
  });
}