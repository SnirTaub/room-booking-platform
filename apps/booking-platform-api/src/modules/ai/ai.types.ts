export interface RoomSearchIntentRequest {
  prompt: string;
  timezone?: string;
}

export interface RoomSearchIntent {
  location?: string;
  capacity?: number;
  capacityMode?: "AT_LEAST" | "EXACT";
  startTime?: string;
  endTime?: string;
  amenities?: string[];
}

export interface RoomSearchIntentResponse {
  intent: RoomSearchIntent;
  source: "openai";
}

export interface RoomSearchIntentParser {
  parseRoomSearchIntent(correlationId: string, request: RoomSearchIntentRequest): Promise<RoomSearchIntentResponse>;
}