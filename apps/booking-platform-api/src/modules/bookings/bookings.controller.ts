import { Request, Response } from "express";
import { HttpStatusCode } from "../../config/constants";
import { createBookingSchema } from "./bookings.schemas";
import { bookingsService } from "./bookings.service";
import { redisClient } from "../../infrastructure/redis/redis";

export class BookingsController {
  public async createBooking(req: Request, res: Response): Promise<void> {
    const user = req.user;

    if (!user) {
      throw new Error("User missing in request context");
    }

    const body = createBookingSchema.parse(req.body);

    const booking = await bookingsService.createBooking(user.userId, body);

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
        {
          EX: res.locals.idempotency.ttlInSeconds,
        }
      );
    }

    res.status(HttpStatusCode.CREATED).json(booking);
  }
}

export const bookingsController = new BookingsController();