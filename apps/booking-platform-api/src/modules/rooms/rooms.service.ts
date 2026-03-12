import { HttpStatusCode } from "../../config/constants";
import { createAppError, ErrorCodes } from "../../common/errors/errorDefinitions";
import { RoomDetailsDto, RoomSearchItemDto, RoomSearchRow, SearchRoomsQueryDto, SearchRoomsResponseDto } from "./rooms.types";
import { roomsProvider } from "./rooms.provider";

const SEARCH_CACHE_TTL_SECONDS = 60;

export class RoomsService {
  constructor(private readonly provider = roomsProvider) {}

  public async searchRooms(query: SearchRoomsQueryDto): Promise<SearchRoomsResponseDto> {
    const cacheKey = this.buildSearchCacheKey(query);

    const cached = await this.provider.getCachedSearch(cacheKey);
    if (cached) {
      return cached;
    }

    const { rows, total } = await this.provider.searchRooms(query);

    const response: SearchRoomsResponseDto = {
      items: rows.map((row) => this.mapRowToSearchItem(row)),
      page: query.page,
      limit: query.limit,
      total,
    };

    await this.provider.setCachedSearch(cacheKey, response, SEARCH_CACHE_TTL_SECONDS);

    return response;
  }

  public async getRoomById(roomId: number): Promise<RoomDetailsDto> {
    const room = await this.provider.getRoomById(roomId);

    if (!room) {
      throw createAppError(ErrorCodes.ROOM_NOT_FOUND, {
        statusCode: HttpStatusCode.NOT_FOUND,
      });
    }

    return this.mapRowToDetails(room);
  }

  private buildSearchCacheKey(query: SearchRoomsQueryDto): string {
    const { location, capacity, startTime, endTime, amenities, page, limit } = query;
    return `rooms:search:${JSON.stringify({
      location: location || null,
      capacity: capacity || null,
      startTime,
      endTime,
      amenities: amenities || [],
      page,
      limit,
    })}`;
  }

  private mapRowToSearchItem(row: RoomSearchRow): RoomSearchItemDto {
    return {
      id: Number(row.id),
      name: row.name,
      location: row.location,
      capacity: row.capacity,
      amenities: row.amenities || [],
      isAvailable: row.is_available,
    };
  }

  private mapRowToDetails(row: RoomSearchRow): RoomDetailsDto {
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