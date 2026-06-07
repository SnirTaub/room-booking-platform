import { apiClient } from "./client";
import type { RoomSearchIntentRequest, RoomSearchIntentResponse } from "../types/ai.types";

export async function parseRoomSearchIntent(payload: RoomSearchIntentRequest): Promise<RoomSearchIntentResponse> {
  const response = await apiClient.post<RoomSearchIntentResponse>("/v1/ai/room-search-intent", payload);
  return response.data;
}