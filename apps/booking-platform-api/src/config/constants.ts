export enum HttpStatusCode {
  OK = 200,
  CREATED = 201,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  CONFLICT = 409,
  TOO_MANY_REQUESTS = 429,
  INTERNAL_SERVER_ERROR = 500,
}

export const SEARCH_CACHE_TTL_SECONDS = 60;

export const IDEMPOTENCY_TTL_IN_SECONDS = 60 * 10; // 10 minutes
export const MAX_IDEMPOTENCY_KEY_LENGTH = 128;

export const ROOMS_SEARCH_CACHE_PREFIX = "rooms:search:";

export const RATE_LIMIT_AUTH_REGISTER_PREFIX = "rate-limit:auth:register";
export const RATE_LIMIT_AUTH_LOGIN_PREFIX = "rate-limit:auth:login";
export const RATE_LIMIT_ROOMS_SEARCH_PREFIX = "rate-limit:rooms:search";
export const RATE_LIMIT_BOOKINGS_CREATE_PREFIX = "rate-limit:bookings:create";

export const IDEMPOTENCY_BOOKING_PREFIX = "idempotency:booking:";

// Removes brackets and quotes from the start and end of each CORS origin string.
export const CORS_ORIGIN_REGEX = /^["\[\]]+|["\[\]]+$/g;