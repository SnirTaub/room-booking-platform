import { apiClient } from "./client";
import type { SearchRoomsQuery, SearchRoomsResponse } from "../types/rooms.types";

export async function searchRooms(query: SearchRoomsQuery): Promise<SearchRoomsResponse> {
  const response = await apiClient.get<SearchRoomsResponse>("/v1/rooms/search", { params: query });
  return response.data;
}