import { Router } from "express";
import { asyncHandler } from "../../common/utils/asyncHandler";
import { rateLimitMiddleware } from "../../common/middleware/rateLimit.middleware";
import { RATE_LIMIT_AI_ROOM_SEARCH_INTENT_PREFIX } from "../../config/constants";
import { aiController } from "./ai.controller";

const aiRouter = Router();

aiRouter.post(
  "/room-search-intent",
  rateLimitMiddleware({
    keyPrefix: RATE_LIMIT_AI_ROOM_SEARCH_INTENT_PREFIX,
    windowInSeconds: 60,
    maxRequests: 20,
  }),
  asyncHandler(aiController.parseRoomSearchIntent.bind(aiController))
);

export { aiRouter };