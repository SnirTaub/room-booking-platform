import { apiClient } from "./client";
import type { SearchRoomsQuery, SearchRoomsResponseDto } from "../types/rooms.types";

export async function searchRooms(query: SearchRoomsQuery): Promise<SearchRoomsResponseDto> {
  const response = await apiClient.get<SearchRoomsResponseDto>("/v1/rooms/search", { params: query });
  return response.data;
}