import { HttpStatusCode, ROOMS_SEARCH_CACHE_PREFIX, SEARCH_CACHE_TTL_SECONDS } from "../../config/constants";
import { createAppError, ErrorCodes } from "../../common/errors/errorDefinitions";
import { getFromCache, setInCache } from "../../infrastructure/redis/redis";
import { RoomDetails, RoomSearchItem, RoomSearchRow, SearchRoomsQuery, SearchRoomsResponse } from "./rooms.types";
import { roomsProvider } from "./rooms.provider";
import { logger } from "../../common/utils/logger";

export class RoomsService {
  constructor(private readonly provider = roomsProvider) {}

  public async searchRooms(correlationId: string, query: SearchRoomsQuery): Promise<SearchRoomsResponse> {
    const methodName = "RoomsService/searchRooms";

    logger.info(correlationId, `${methodName} - start - input parameters`, { location: query.location, capacity: query.capacity, startTime: query.startTime, endTime: query.endTime, amenitiesCount: query.amenities?.length ?? 0, page: query.page, limit: query.limit });

    const cacheKey = this.buildSearchCacheKey(query);

    const cached = await getFromCache<SearchRoomsResponse>(cacheKey);
    if (cached) {
      logger.info(correlationId, `${methodName} - end - result: cache hit`, { page: cached.page, limit: cached.limit, total: cached.total });
      return cached;
    }

    const { rows, total } = await this.provider.searchRooms(correlationId, query);

    const response: SearchRoomsResponse = {
      items: rows.map((row) => this.mapRowToSearchItem(row)),
      page: query.page,
      limit: query.limit,
      total,
    };

    await setInCache(cacheKey, response, SEARCH_CACHE_TTL_SECONDS);

    logger.info(correlationId, `${methodName} - end - result: rooms fetched`, { page: response.page, limit: response.limit, total: response.total });

    return response;
  }

  public async getRoomById(correlationId: string, roomId: number): Promise<RoomDetails> {
    const methodName = "RoomsService/getRoomById";

    logger.info(correlationId, `${methodName} - start - input parameters`, { roomId: roomId });

    const room = await this.provider.getRoomById(correlationId, roomId);

    if (!room) {
      logger.error(correlationId, `${methodName} - error: room not found`, { roomId: roomId });

      throw createAppError(ErrorCodes.ROOM_NOT_FOUND, {
        statusCode: HttpStatusCode.NOT_FOUND,
      });
    }

    const details = this.mapRowToDetails(room);

    logger.info(correlationId, `${methodName} - end - result: room fetched`, { roomId: details.id, location: details.location, capacity: details.capacity });

    return details;
  }

  private buildSearchCacheKey(query: SearchRoomsQuery): string {
    const { location, capacity, startTime, endTime, amenities, page, limit } = query;
    return `${ROOMS_SEARCH_CACHE_PREFIX}${JSON.stringify({
      location: location || null,
      capacity: capacity || null,
      startTime,
      endTime,
      amenities: amenities || [],
      page,
      limit,
    })}`;
  }

  private mapRowToSearchItem(row: RoomSearchRow): RoomSearchItem {
    return {
      id: Number(row.id),
      name: row.name,
      location: row.location,
      capacity: row.capacity,
      amenities: row.amenities || [],
      isAvailable: row.is_available,
    };
  }

  private mapRowToDetails(row: RoomSearchRow): RoomDetails {
    return {
      id: row.id,
      name: row.name,
      location: row.location,
      capacity: row.capacity,
      amenities: row.amenities || [],
      status: row.status,
    };
  }
}

export const roomsService = new RoomsService();