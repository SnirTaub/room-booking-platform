import { QueryResult } from "pg";
import { pgPool } from "../../infrastructure/db/pg";
import { RoomSearchRow, RoomStatus, SearchRoomsQuery } from "./rooms.types";
import { logger } from "../../common/utils/logger";

export class RoomsProvider {
  public async searchRooms(correlationId: string, query: SearchRoomsQuery): Promise<{ rows: RoomSearchRow[]; total: number }> {
    const methodName = "RoomsProvider/searchRooms";
    logger.info(correlationId, `${methodName} - start - input parameters`, { location: query.location, capacity: query.capacity, startTime: query.startTime, endTime: query.endTime, amenitiesCount: query.amenities?.length ?? 0, page: query.page, limit: query.limit });

    const params = [
      RoomStatus.ACTIVE,                                                   // $1
      query.location || null,                                              // $2
      query.capacity || null,                                              // $3
      (query.amenities && query.amenities.length > 0 && query.amenities) || null, // $4
      query.startTime,                                                     // $5
      query.endTime,                                                       // $6
      query.limit,                                                         // $7
      (query.page - 1) * query.limit                                       // $8
    ];

    const sql = `
      SELECT
        r.id,
        r.name,
        r.location,
        r.capacity,
        r.status,
        COALESCE(array_agg(DISTINCT ra.amenity) FILTER (WHERE ra.amenity IS NOT NULL), '{}') AS amenities,
        NOT EXISTS (
          SELECT 1
          FROM bookings b
          WHERE b.room_id = r.id
            AND b.status = 'CONFIRMED'
            AND b.start_time < $6::timestamptz
            AND b.end_time   > $5::timestamptz
        ) AS is_available,
        COUNT(*) OVER() AS total_count
      FROM rooms r
      LEFT JOIN room_amenities ra ON ra.room_id = r.id
      WHERE r.status = $1
        AND ($2::text IS NULL OR r.location = $2::text)
        AND ($3::int IS NULL OR r.capacity >= $3::int)
        AND (
          $4::text[] IS NULL OR NOT EXISTS (
            SELECT 1
            FROM unnest($4::text[]) AS required_amenity
            WHERE required_amenity NOT IN (
              SELECT ra2.amenity
              FROM room_amenities ra2
              WHERE ra2.room_id = r.id
            )
          )
        )
      GROUP BY r.id, r.name, r.location, r.capacity, r.status
      ORDER BY r.id
      LIMIT $7::int
      OFFSET $8::int
    `;

    const result: QueryResult<RoomSearchRow & { total_count: string }> = await pgPool.query(sql, params);

    const rows: RoomSearchRow[] = result.rows.map((row) => ({
      id: row.id,
      name: row.name,
      location: row.location,
      capacity: row.capacity,
      status: row.status,
      amenities: row.amenities,
      is_available: row.is_available,
    }));

    const firstRow = result.rows[0];
    const total: number = firstRow ? Number(firstRow.total_count) : 0;

    logger.info(correlationId, `${methodName} - end - result: rooms fetched`, { page: query.page, limit: query.limit, total: total });

    return { rows, total };
  }

  public async getRoomById(correlationId: string, roomId: number): Promise<RoomSearchRow | null> {
    const methodName = "RoomsProvider/getRoomById";

    logger.info(correlationId, `${methodName} - start - input parameters`, { roomId: roomId });

    const result: QueryResult<RoomSearchRow> = await pgPool.query(
      `
      SELECT
        r.id,
        r.name,
        r.location,
        r.capacity,
        r.status,
        COALESCE(array_agg(DISTINCT ra.amenity) FILTER (WHERE ra.amenity IS NOT NULL), '{}') AS amenities,
        TRUE AS is_available
      FROM rooms r
      LEFT JOIN room_amenities ra ON ra.room_id = r.id
      WHERE r.id = $1
      GROUP BY r.id, r.name, r.location, r.capacity, r.status
      `,
      [roomId]
    );
    const room: RoomSearchRow | null = result.rows[0] || null;

    logger.info(correlationId, `${methodName} - end - result: room fetched`, { roomId: roomId, found: Boolean(room) });

    return room;
  }
}

export const roomsProvider = new RoomsProvider();
