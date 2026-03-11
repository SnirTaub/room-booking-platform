import { Router } from "express";
import { asyncHandler } from "../../common/utils/asyncHandler";
import { rateLimitMiddleware } from "../../common/middleware/rateLimit.middleware";
import { roomsController } from "./rooms.controller";

const roomsRouter = Router();

roomsRouter.get("/search", rateLimitMiddleware({ keyPrefix: "rate-limit:rooms:search", windowInSeconds: 60, maxRequests: 60 }),
  asyncHandler(roomsController.searchRooms.bind(roomsController))
);

roomsRouter.get("/:roomId", asyncHandler(roomsController.getRoomById.bind(roomsController)));

export { roomsRouter };