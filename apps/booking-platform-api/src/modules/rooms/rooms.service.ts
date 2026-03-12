import { QueryResult } from "pg";
import { AppError } from "../../common/errors/AppError";
import { HttpStatusCode } from "../../config/constants";
import { pgPool } from "../../infrastructure/db/pg";
import { redisClient } from "../../infrastructure/redis/redis";
import {
  CountRow,
  RoomDetailsDto,
  RoomSearchItemDto,
  RoomSearchRow,
  SearchRoomsQueryDto,
  SearchRoomsResponseDto,
} from "./rooms.types";

export class RoomsService {
  public async searchRooms(query: SearchRoomsQueryDto): Promise<SearchRoomsResponseDto> {
    const cacheKey: string = this.buildSearchCacheKey(query);
    const cached: string | null = await redisClient.get(cacheKey);

    if (cached) {
      return JSON.parse(cached) as SearchRoomsResponseDto;
    }

    const offset: number = (query.page - 1) * query.limit;

    const filterParams: unknown[] = [];
    const whereClauses: string[] = ["r.status = 'ACTIVE'"];

    if (query.location) {
      filterParams.push(query.location);
      whereClauses.push(`r.location = $${filterParams.length}`);
    }

    if (query.capacity) {
      filterParams.push(query.capacity);
      whereClauses.push(`r.capacity >= $${filterParams.length}`);
    }

    if (query.amenities && query.amenities.length > 0) {
      filterParams.push(query.amenities);
      whereClauses.push(`
        NOT EXISTS (
          SELECT 1
          FROM unnest($${filterParams.length}::text[]) AS required_amenity
          WHERE required_amenity NOT IN (
            SELECT ra2.amenity
            FROM room_amenities ra2
            WHERE ra2.room_id = r.id
          )
        )
      `);
    }

    const whereSql: string =
      whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "";

    const countQuery: string = `
      SELECT COUNT(*)::text AS count
      FROM rooms r
      ${whereSql}
    `;

    const countResult: QueryResult<CountRow> = await pgPool.query(
      countQuery,
      filterParams
    );

    const total: number = Number(countResult.rows[0]?.count ?? "0");

    const searchParams: unknown[] = [
      query.startTime,
      query.endTime,
      ...filterParams,
    ];

    const searchWhereClauses: string[] = ["r.status = 'ACTIVE'"];

    let nextParamIndex: number = 3;

    if (query.location) {
      searchWhereClauses.push(`r.location = $${nextParamIndex}`);
      nextParamIndex += 1;
    }

    if (query.capacity) {
      searchWhereClauses.push(`r.capacity >= $${nextParamIndex}`);
      nextParamIndex += 1;
    }

    if (query.amenities && query.amenities.length > 0) {
      searchWhereClauses.push(`
        NOT EXISTS (
          SELECT 1
          FROM unnest($${nextParamIndex}::text[]) AS required_amenity
          WHERE required_amenity NOT IN (
            SELECT ra2.amenity
            FROM room_amenities ra2
            WHERE ra2.room_id = r.id
          )
        )
      `);
      nextParamIndex += 1;
    }

    searchParams.push(query.limit);
    const limitParamIndex: number = nextParamIndex;
    nextParamIndex += 1;

    searchParams.push(offset);
    const offsetParamIndex: number = nextParamIndex;

    const searchWhereSql: string =
      searchWhereClauses.length > 0
        ? `WHERE ${searchWhereClauses.join(" AND ")}`
        : "";

    const searchQuery: string = `
      SELECT
        r.id,
        r.name,
        r.location,
        r.capacity,
        r.status,
        COALESCE(
          array_agg(DISTINCT ra.amenity) FILTER (WHERE ra.amenity IS NOT NULL),
          '{}'
        ) AS amenities,
        NOT EXISTS (
          SELECT 1
          FROM bookings b
          WHERE b.room_id = r.id
            AND b.status = 'CONFIRMED'
            AND NOT (b.end_time <= $1 OR b.start_time >= $2)
        ) AS is_available
      FROM rooms r
      LEFT JOIN room_amenities ra ON ra.room_id = r.id
      ${searchWhereSql}
      GROUP BY r.id, r.name, r.location, r.capacity, r.status
      ORDER BY r.id
      LIMIT $${limitParamIndex}
      OFFSET $${offsetParamIndex}
    `;

    const searchResult: QueryResult<RoomSearchRow> = await pgPool.query(
      searchQuery,
      searchParams
    );

    const items: RoomSearchItemDto[] = searchResult.rows.map(
      (row: RoomSearchRow): RoomSearchItemDto => ({
        id: Number(row.id),
        name: row.name,
        location: row.location,
        capacity: row.capacity,
        amenities: row.amenities ?? [],
        isAvailable: row.is_available,
      })
    );

    const response: SearchRoomsResponseDto = { items, page: query.page, limit: query.limit, total };

    await redisClient.set(cacheKey, JSON.stringify(response), { EX: 60 });

    return response;
  }

  public async getRoomById(roomId: number): Promise<RoomDetailsDto> {
    const result: QueryResult<RoomSearchRow> = await pgPool.query(
      `
      SELECT
        r.id,
        r.name,
        r.location,
        r.capacity,
        r.status,
        COALESCE(
          array_agg(DISTINCT ra.amenity) FILTER (WHERE ra.amenity IS NOT NULL),
          '{}'
        ) AS amenities,
        TRUE AS is_available
      FROM rooms r
      LEFT JOIN room_amenities ra ON ra.room_id = r.id
      WHERE r.id = $1
      GROUP BY r.id, r.name, r.location, r.capacity, r.status
      `,
      [roomId]
    );

    const room: RoomSearchRow | undefined = result.rows[0];

    if (!room) {
      throw new AppError({
        statusCode: HttpStatusCode.NOT_FOUND,
        code: "ROOM_NOT_FOUND",
        message: "Room not found",
      });
    }

    return {
      id: room.id,
      name: room.name,
      location: room.location,
      capacity: room.capacity,
      amenities: rowAmenities(room.amenities),
      status: room.status,
    };
  }

  private buildSearchCacheKey(query: SearchRoomsQueryDto): string {
    const { location, capacity, startTime, endTime, amenities, page, limit } = query;

    return `rooms:search:${JSON.stringify({
      location: location ?? null,
      capacity: capacity ?? null,
      startTime,
      endTime,
      amenities: amenities ?? [],
      page,
      limit,
    })}`;
  }
}

function rowAmenities(amenities: string[] | null): string[] {
  return amenities ?? [];
}

export const roomsService = new RoomsService();