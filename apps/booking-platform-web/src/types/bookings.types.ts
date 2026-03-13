export interface CreateBookingRequest {
  roomId: number;
  startTime: string;
  endTime: string;
}

export interface BookingResponse {
  id: number;
  roomId: number;
  userId: number;
  startTime: string;
  endTime: string;
  status: "CONFIRMED" | "CANCELLED";
}