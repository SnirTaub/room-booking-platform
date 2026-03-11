import { PoolClient } from "pg"
import { pgPool } from "../../infrastructure/db/pg"
import { AppError } from "../../common/errors/AppError"
import { HttpStatusCode } from "../../config/constants"
import { BookingStatus, CreateBookingDto, BookingResponseDto } from "./bookings.types"

export class BookingsService {

  public async createBooking(userId: number, dto: CreateBookingDto): Promise<BookingResponseDto> {

    const client: PoolClient = await pgPool.connect()

    try {

      await client.query("BEGIN")

      const roomResult = await client.query(
        `
        SELECT id
        FROM rooms
        WHERE id = $1
        FOR UPDATE
        `,
        [dto.roomId]
      )

      if (roomResult.rowCount === 0) {
        throw new AppError({
          statusCode: HttpStatusCode.NOT_FOUND,
          code: "ROOM_NOT_FOUND",
          message: "Room not found"
        })
      }

      const overlapResult = await client.query(
        `
        SELECT id
        FROM bookings
        WHERE room_id = $1
          AND status = 'CONFIRMED'
          AND NOT (end_time <= $2 OR start_time >= $3)
        LIMIT 1
        `,
        [dto.roomId, dto.startTime, dto.endTime]
      )

      if (overlapResult.rowCount ?? 0 > 0) {
        throw new AppError({
          statusCode: HttpStatusCode.CONFLICT,
          code: "ROOM_ALREADY_BOOKED",
          message: "Room is already booked for this time slot"
        })
      }

      const insertResult = await client.query(
        `
        INSERT INTO bookings
        (user_id, room_id, start_time, end_time, status)
        VALUES ($1,$2,$3,$4,$5)
        RETURNING id, user_id, room_id, start_time, end_time, status
        `,
        [
          userId,
          dto.roomId,
          dto.startTime,
          dto.endTime,
          BookingStatus.CONFIRMED
        ]
      )

      await client.query("COMMIT")

      const row = insertResult.rows[0]

      return {
        id: Number(row.id),
        roomId: Number(row.room_id),
        userId: Number(row.user_id),
        startTime: row.start_time,
        endTime: row.end_time,
        status: row.status
      }

    } catch (error) {

      await client.query("ROLLBACK")

      throw error

    } finally {

      client.release()

    }
  }
}

export const bookingsService = new BookingsService()