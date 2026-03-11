export interface CreateBookingRequestDto {
  roomId: number;
  startTime: string;
  endTime: string;
}

export interface BookingResponseDto {
  id: number;
  roomId: number;
  userId: number;
  startTime: string;
  endTime: string;
  status: "CONFIRMED" | "CANCELLED";
}