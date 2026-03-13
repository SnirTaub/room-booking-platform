import { HttpStatusCode, ROOMS_SEARCH_CACHE_PREFIX } from "../../config/constants";
import { createAppError, ErrorCodes } from "../../common/errors/errorDefinitions";
import { deleteByPattern } from "../../infrastructure/redis/redis";
import { CreateBooking, BookingResponse } from "./bookings.types";
import { bookingsProvider } from "./bookings.provider";
import { logger } from "../../common/utils/logger";

export class BookingsService {
  constructor(private readonly provider = bookingsProvider) {}

  public async createBooking(correlationId: string, userId: number, booking: CreateBooking): Promise<BookingResponse> {
    const methodName = "BookingsService/createBooking";

    logger.info(correlationId, `${methodName} - start - input parameters`, { userId, roomId: booking.roomId, startTime: booking.startTime, endTime: booking.endTime });

    const createdBooking: BookingResponse = await this.provider.runInTransaction(correlationId, async (client) => {
      const roomLocked: boolean = await this.provider.lockActiveRoom(correlationId, client, booking.roomId);
      if (!roomLocked) {
        logger.error(correlationId, `${methodName} - error: room not found`, { roomId: booking.roomId });

        throw createAppError(ErrorCodes.ROOM_NOT_FOUND, {
          statusCode: HttpStatusCode.NOT_FOUND,
        });
      }

      const hasOverlap: boolean = await this.provider.hasOverlappingBooking(correlationId, client, booking.roomId, booking.startTime, booking.endTime);
      if (hasOverlap) {
        logger.error(correlationId, `${methodName} - error: room already booked`, { roomId: booking.roomId, startTime: booking.startTime, endTime: booking.endTime });

        throw createAppError(ErrorCodes.ROOM_ALREADY_BOOKED, {
          statusCode: HttpStatusCode.CONFLICT,
        });
      }

      return this.provider.insertBooking(correlationId, client, userId, booking);
    });

    await deleteByPattern(`${ROOMS_SEARCH_CACHE_PREFIX}*`);

    logger.info(correlationId, `${methodName} - end - result: booking created`, { bookingId: createdBooking.id, roomId: createdBooking.roomId, userId: createdBooking.userId });

    return createdBooking;
  }
}

export const bookingsService = new BookingsService();