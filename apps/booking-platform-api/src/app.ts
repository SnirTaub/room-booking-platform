import cors from "cors";
import express, { Express, Request, Response } from "express";
import helmet from "helmet";
import morgan from "morgan";
import { correlationIdMiddleware } from "./common/middleware/correlationId.middleware";
import { notFoundMiddleware } from "./common/middleware/notFound.middleware";
import { errorMiddleware } from "./common/middleware/error.middleware";
import { authMiddleware } from "./common/middleware/auth.middleware";
import { HttpStatusCode } from "./config/constants";
import { env } from "./config/env";
import { authRouter } from "./modules/auth/auth.routes";
import { roomsRouter } from "./modules/rooms/rooms.routes";
import { bookingsRouter } from "./modules/bookings/bookings.routes";

export function createApp(): Express {
  const app: Express = express();

  app.use(helmet());
  app.use(cors({ origin: env.corsOrigin }));
  app.use(express.json());
  app.use(morgan("dev"));
  app.use(correlationIdMiddleware);

  app.get("/health", (_req: Request, res: Response) => {
    res.status(HttpStatusCode.OK).json({ status: "ok" });
  });

  app.use("/v1/auth", authRouter);
  app.use("/v1/rooms", roomsRouter);
  app.use("/v1/bookings", bookingsRouter);

  app.get("/v1/me", authMiddleware, (req: Request, res: Response) => {
    res.status(HttpStatusCode.OK).json({
      user: req.user,
    });
  });

  app.use(notFoundMiddleware);
  app.use(errorMiddleware);

  return app;
}