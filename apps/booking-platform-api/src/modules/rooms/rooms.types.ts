export enum RoomStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  MAINTENANCE = "MAINTENANCE",
}

export interface SearchRoomsQuery {
  location?: string;
  capacity?: number;
  startTime: string;
  endTime: string;
  amenities?: string[];
  page: number;
  limit: number;
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

export interface RoomDetails {
  id: number;
  name: string;
  location: string;
  capacity: number;
  amenities: string[];
  status: RoomStatus;
}

export interface RoomRow {
  id: number;
  name: string;
  location: string;
  capacity: number;
  status: RoomStatus;
  region_code: string;
  created_at: Date;
  updated_at: Date;
}

export interface RoomSearchRow {
  id: number;
  name: string;
  location: string;
  capacity: number;
  status: RoomStatus;
  amenities: string[] | null;
  is_available: boolean;
}

export interface CountRow {
  count: string;
}