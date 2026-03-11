export interface SearchRoomsQuery {
  location?: string;
  capacity?: number;
  startTime: string;
  endTime: string;
  amenities?: string;
  page?: number;
  limit?: number;
}

export interface RoomSearchItemDto {
  id: number;
  name: string;
  location: string;
  capacity: number;
  amenities: string[];
  isAvailable: boolean;
}

export interface SearchRoomsResponseDto {
  items: RoomSearchItemDto[];
  page: number;
  limit: number;
  total: number;
}