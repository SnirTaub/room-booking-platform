import { PoolClient, QueryResult } from "pg";
import { pgPool } from "../../infrastructure/db/pg";
import { BookingStatus, CreateBooking, BookingResponse } from "./bookings.types";
import { RoomStatus } from "../rooms/rooms.types";

export class BookingsProvider {
  public async runInTransaction<T>(fn: (client: PoolClient) => Promise<T>): Promise<T> {
    const client: PoolClient = await pgPool.connect();
    try {
      await client.query("BEGIN");
      const result = await fn(client);
      await client.query("COMMIT");
      return result;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  public async lockActiveRoom(client: PoolClient, roomId: number): Promise<boolean> {
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
    return (result.rowCount || 0) > 0;
  }

  public async hasOverlappingBooking(client: PoolClient, roomId: number, startTime: string, endTime: string): Promise<boolean> {
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
    return (result.rowCount || 0) > 0;
  }

  public async insertBooking(client: PoolClient, userId: number, booking: CreateBooking): Promise<BookingResponse> {
    const result: QueryResult = await client.query(
      `
      INSERT INTO bookings (user_id, room_id, start_time, end_time, status)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, user_id, room_id, start_time, end_time, status
      `,
      [userId, booking.roomId, booking.startTime, booking.endTime, BookingStatus.CONFIRMED]
    );

    const row = result.rows[0];
    return {
      id: Number(row.id),
      roomId: Number(row.room_id),
      userId: Number(row.user_id),
      startTime: row.start_time,
      endTime: row.end_time,
      status: row.status,
    };
  }
}

export const bookingsProvider = new BookingsProvider();
