import { HttpStatusCode, ROOMS_SEARCH_CACHE_PREFIX } from "../../config/constants";
import { createAppError, ErrorCodes } from "../../common/errors/errorDefinitions";
import { deleteByPattern } from "../../infrastructure/redis/redis";
import { CreateBooking, BookingResponse } from "./bookings.types";
import { bookingsProvider } from "./bookings.provider";

export class BookingsService {
  constructor(private readonly provider = bookingsProvider) {}

  public async createBooking(userId: number, booking: CreateBooking): Promise<BookingResponse> {
    const createdBooking = await this.provider.runInTransaction(async (client) => {
      const roomLocked: boolean = await this.provider.lockActiveRoom(client, booking.roomId);
      if (!roomLocked) {
        throw createAppError(ErrorCodes.ROOM_NOT_FOUND, {
          statusCode: HttpStatusCode.NOT_FOUND,
        });
      }

      const hasOverlap: boolean = await this.provider.hasOverlappingBooking(client, booking.roomId, booking.startTime, booking.endTime);
      if (hasOverlap) {
        throw createAppError(ErrorCodes.ROOM_ALREADY_BOOKED, {
          statusCode: HttpStatusCode.CONFLICT,
        });
      }

      return this.provider.insertBooking(client, userId, booking);
    });

    await deleteByPattern(`${ROOMS_SEARCH_CACHE_PREFIX}*`);

    return createdBooking;
  }
}

export const bookingsService = new BookingsService();
