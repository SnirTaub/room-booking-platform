import { stub } from "sinon";
import type { RoomsProvider } from "../../src/modules/rooms/rooms.provider";
import type { RoomSearchRow, SearchRoomsResponse, RoomDetails } from "../../src/modules/rooms/rooms.types";
import { RoomStatus } from "../../src/modules/rooms/rooms.types";

export const sampleRoomRow: RoomSearchRow = {
  id: 1,
  name: "Sea View",
  location: "Tel Aviv",
  capacity: 4,
  status: RoomStatus.ACTIVE,
  amenities: ["WIFI"],
  is_available: true,
};

export const roomDetails: RoomDetails = {
  id: 1,
  name: "Sea View",
  location: "Tel Aviv",
  capacity: 4,
  amenities: ["WIFI"],
  status: RoomStatus.ACTIVE,
};

export const searchQuery = {
  startTime: "2025-06-01T14:00:00Z",
  endTime: "2025-06-03T11:00:00Z",
  page: 1,
  limit: 20,
};

export const emptySearchResponse: SearchRoomsResponse = {
  items: [],
  page: 1,
  limit: 20,
  total: 0,
};

export function createMockRoomsProvider(partial: Partial<{
  searchRooms: ReturnType<typeof stub>;
  getRoomById: ReturnType<typeof stub>;
}> = {}): RoomsProvider {
  return {
    searchRooms: stub(),
    getRoomById: stub(),
    ...partial,
  } as unknown as RoomsProvider;
}