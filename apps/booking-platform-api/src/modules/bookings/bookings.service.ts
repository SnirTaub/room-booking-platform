import { HttpStatusCode } from "../../config/constants";
import { createAppError, ErrorCodes } from "../../common/errors/errorDefinitions";
import { CreateBookingDto, BookingResponseDto } from "./bookings.types";
import { bookingsProvider } from "./bookings.provider";

export class BookingsService {
  constructor(private readonly provider = bookingsProvider) {}

  public async createBooking(userId: number, dto: CreateBookingDto): Promise<BookingResponseDto> {
    return this.provider.runInTransaction(async (client) => {
      const roomLocked: boolean = await this.provider.lockActiveRoom(client, dto.roomId);
      if (!roomLocked) {
        throw createAppError(ErrorCodes.ROOM_NOT_FOUND, {
          statusCode: HttpStatusCode.NOT_FOUND,
        });
      }

      const hasOverlap: boolean = await this.provider.hasOverlappingBooking(client, dto.roomId, dto.startTime, dto.endTime);
      if (hasOverlap) {
        throw createAppError(ErrorCodes.ROOM_ALREADY_BOOKED, {
          statusCode: HttpStatusCode.CONFLICT,
        });
      }

      return this.provider.insertBooking(client, userId, dto);
    });
  }
}

export const bookingsService = new BookingsService();
