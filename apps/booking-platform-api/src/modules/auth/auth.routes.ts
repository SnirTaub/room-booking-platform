import { Router } from "express";
import { asyncHandler } from "../../common/utils/asyncHandler";
import { rateLimitMiddleware } from "../../common/middleware/rateLimit.middleware";
import { authController } from "./auth.controller";

const authRouter = Router();

authRouter.post("/register", rateLimitMiddleware({ keyPrefix: "rate-limit:auth:register", windowInSeconds: 60, maxRequests: 5 }),
  asyncHandler(authController.register.bind(authController))
);

authRouter.post("/login", rateLimitMiddleware({ keyPrefix: "rate-limit:auth:login", windowInSeconds: 60, maxRequests: 5 }),
  asyncHandler(authController.login.bind(authController))
);

export { authRouter };