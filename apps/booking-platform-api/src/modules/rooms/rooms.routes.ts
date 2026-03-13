import { Router } from "express";
import { asyncHandler } from "../../common/utils/asyncHandler";
import { rateLimitMiddleware } from "../../common/middleware/rateLimit.middleware";
import { RATE_LIMIT_ROOMS_SEARCH_PREFIX } from "../../config/constants";
import { roomsController } from "./rooms.controller";

const roomsRouter = Router();

roomsRouter.get("/search", rateLimitMiddleware({ keyPrefix: RATE_LIMIT_ROOMS_SEARCH_PREFIX, windowInSeconds: 60, maxRequests: 60 }),
  asyncHandler(roomsController.searchRooms.bind(roomsController))
);

roomsRouter.get("/:roomId", asyncHandler(roomsController.getRoomById.bind(roomsController)));

export { roomsRouter };