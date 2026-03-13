import { Request, Response } from "express";
import { HttpStatusCode } from "../../config/constants";
import { createBookingSchema } from "./bookings.schemas";
import { bookingsService } from "./bookings.service";
import { redisClient } from "../../infrastructure/redis/redis";
import { logger } from "../../common/utils/logger";

export class BookingsController {
  public async createBooking(req: Request, res: Response): Promise<void> {
    const methodName = "BookingsController/createBooking";

    logger.info(req.correlationId, `${methodName} - start - input parameters`, { body: req.body, user: req.user });

    const user = req.user;

    if (!user) {
      logger.error(req.correlationId, `${methodName} - error: user missing in request context`);
      throw new Error("User missing in request context");
    }

    const body = createBookingSchema.parse(req.body);

    const booking = await bookingsService.createBooking(req.correlationId, user.userId, body);

    if (res.locals.idempotency) {
      await redisClient.set(
        res.locals.idempotency.redisKey,
        JSON.stringify({
          requestHash: res.locals.idempotency.requestHash,
          response: {
            statusCode: HttpStatusCode.CREATED,
            body: booking,
          },
        }),
        { EX: res.locals.idempotency.ttlInSeconds }
      );
    }

    logger.info(req.correlationId, `${methodName} - end - result: booking created`, { bookingId: booking.id, roomId: booking.roomId, userId: booking.userId });

    res.status(HttpStatusCode.CREATED).json(booking);
  }
}

export const bookingsController = new BookingsController();