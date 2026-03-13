import { Router } from "express";
import { asyncHandler } from "../../common/utils/asyncHandler";
import { authMiddleware } from "../../common/middleware/auth.middleware";
import { rateLimitMiddleware } from "../../common/middleware/rateLimit.middleware";
import { bookingIdempotencyMiddleware } from "../../common/middleware/idempotency.middleware";
import { RATE_LIMIT_BOOKINGS_CREATE_PREFIX } from "../../config/constants";
import { bookingsController } from "./bookings.controller";

const bookingsRouter = Router();

bookingsRouter.post("/",
  authMiddleware,
  rateLimitMiddleware({
    keyPrefix: RATE_LIMIT_BOOKINGS_CREATE_PREFIX,
    windowInSeconds: 60,
    maxRequests: 10,
    keyGenerator: (req) => req.user?.userId.toString() || req.ip || "unknown",
  }),
  asyncHandler(bookingIdempotencyMiddleware),
  asyncHandler(bookingsController.createBooking.bind(bookingsController))
);

export { bookingsRouter };