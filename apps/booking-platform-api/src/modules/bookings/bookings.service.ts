import { AppError } from "../../common/errors/AppError";
import { HttpStatusCode } from "../../config/constants";
import { CreateBookingDto, BookingResponseDto } from "./bookings.types";
import { bookingsProvider } from "./bookings.provider";

export class BookingsService {
  constructor(private readonly provider = bookingsProvider) {}

  public async createBooking(userId: number, dto: CreateBookingDto): Promise<BookingResponseDto> {
    return this.provider.runInTransaction(async (client) => {
      const roomLocked: boolean = await this.provider.lockActiveRoom(client, dto.roomId);
      if (!roomLocked) {
        throw new AppError({
          statusCode: HttpStatusCode.NOT_FOUND,
          code: "ROOM_NOT_FOUND",
          message: "Room not found",
        });
      }

      const hasOverlap: boolean = await this.provider.hasOverlappingBooking(client, dto.roomId, dto.startTime, dto.endTime);
      if (hasOverlap) {
        throw new AppError({
          statusCode: HttpStatusCode.CONFLICT,
          code: "ROOM_ALREADY_BOOKED",
          message: "Room is already booked for this time slot",
        });
      }

      return this.provider.insertBooking(client, userId, dto);
    });
  }
}

export const bookingsService = new BookingsService();
