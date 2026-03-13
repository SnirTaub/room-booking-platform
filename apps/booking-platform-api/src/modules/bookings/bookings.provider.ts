import { PoolClient, QueryResult } from "pg";
import { pgPool } from "../../infrastructure/db/pg";
import { BookingStatus, CreateBooking, BookingResponse } from "./bookings.types";
import { RoomStatus } from "../rooms/rooms.types";
import { logger } from "../../common/utils/logger";

export class BookingsProvider {
  public async runInTransaction<T>(correlationId: string, fn: (client: PoolClient) => Promise<T>): Promise<T> {
    const methodName = "BookingsProvider/runInTransaction";

    logger.info(correlationId, `${methodName} - start`);

    const client: PoolClient = await pgPool.connect();
    try {
      await client.query("BEGIN");
      const result = await fn(client);
      await client.query("COMMIT");

      logger.info(correlationId, `${methodName} - end - result: transaction committed`);

      return result;
    } catch (error) {
      await client.query("ROLLBACK");

      logger.error(correlationId, `${methodName} - error: transaction rolled back`, { error: error instanceof Error ? error.message : String(error) });

      throw error;
    } finally {
      client.release();
    }
  }

  public async lockActiveRoom(correlationId: string, client: PoolClient, roomId: number): Promise<boolean> {
    const methodName = "BookingsProvider/lockActiveRoom";

    logger.info(correlationId, `${methodName} - start - input parameters`, { roomId: roomId });

    const result: QueryResult = await client.query(
      `
      SELECT id
      FROM rooms
      WHERE id = $1
        AND status = $2
      FOR UPDATE
      `,
      [roomId, RoomStatus.ACTIVE]
    );
    const found: boolean = (result.rowCount || 0) > 0;

    logger.info(correlationId, `${methodName} - end - result: room lock attempted`, { roomId: roomId, locked: found });

    return found;
  }

  public async hasOverlappingBooking(correlationId: string, client: PoolClient, roomId: number, startTime: string, endTime: string): Promise<boolean> {
    const methodName = "BookingsProvider/hasOverlappingBooking";

    logger.info(correlationId, `${methodName} - start - input parameters`, { roomId: roomId, startTime: startTime, endTime: endTime });

    const result: QueryResult = await client.query(
      `
      SELECT id
      FROM bookings
      WHERE room_id = $1
        AND status = $4
        AND start_time < $3
        AND end_time   > $2
      LIMIT 1
      `,
      [roomId, startTime, endTime, BookingStatus.CONFIRMED]
    );
    const hasOverlap: boolean = (result.rowCount || 0) > 0;

    logger.info(correlationId, `${methodName} - end - result: overlap check`, { roomId: roomId, startTime: startTime, endTime: endTime, hasOverlap: hasOverlap });

    return hasOverlap;
  }

  public async insertBooking(
    correlationId: string,
    client: PoolClient,
    userId: number,
    booking: CreateBooking
  ): Promise<BookingResponse> {
    const methodName = "BookingsProvider/insertBooking";

    logger.info(correlationId, `${methodName} - start - input parameters`, { userId: userId, roomId: booking.roomId, startTime: booking.startTime, endTime: booking.endTime });

    const result: QueryResult = await client.query(
      `
      INSERT INTO bookings (user_id, room_id, start_time, end_time, status)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, user_id, room_id, start_time, end_time, status
      `,
      [userId, booking.roomId, booking.startTime, booking.endTime, BookingStatus.CONFIRMED]
    );

    const row = result.rows[0];
    const bookingRow: BookingResponse = {
      id: Number(row.id),
      roomId: Number(row.room_id),
      userId: Number(row.user_id),
      startTime: row.start_time,
      endTime: row.end_time,
      status: row.status,
    };

    logger.info(correlationId, `${methodName} - end - result: booking inserted`, { bookingId: bookingRow.id, roomId: bookingRow.roomId, userId: bookingRow.userId });

    return bookingRow;
  }
}

export const bookingsProvider = new BookingsProvider();