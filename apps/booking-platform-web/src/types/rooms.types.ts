export interface SearchRoomsQuery {
  location?: string;
  capacity?: number;
  startTime: string;
  endTime: string;
  amenities?: string;
  page?: number;
  limit?: number;
}

export interface RoomSearchItem {
  id: number;
  name: string;
  location: string;
  capacity: number;
  amenities: string[];
  isAvailable: boolean;
}

export interface SearchRoomsResponse {
  items: RoomSearchItem[];
  page: number;
  limit: number;
  total: number;
}