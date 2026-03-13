import { Router } from "express";
import { asyncHandler } from "../../common/utils/asyncHandler";
import { rateLimitMiddleware } from "../../common/middleware/rateLimit.middleware";
import { RATE_LIMIT_AUTH_LOGIN_PREFIX, RATE_LIMIT_AUTH_REGISTER_PREFIX } from "../../config/constants";
import { authController } from "./auth.controller";

const authRouter = Router();

authRouter.post("/register", rateLimitMiddleware({ keyPrefix: RATE_LIMIT_AUTH_REGISTER_PREFIX, windowInSeconds: 60, maxRequests: 5 }),
  asyncHandler(authController.register.bind(authController))
);

authRouter.post("/login", rateLimitMiddleware({ keyPrefix: RATE_LIMIT_AUTH_LOGIN_PREFIX, windowInSeconds: 60, maxRequests: 5 }),
  asyncHandler(authController.login.bind(authController))
);

export { authRouter };