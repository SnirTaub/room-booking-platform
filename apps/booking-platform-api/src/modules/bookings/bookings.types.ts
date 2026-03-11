export enum BookingStatus {
  CONFIRMED = "CONFIRMED",
  CANCELLED = "CANCELLED"
}

export interface CreateBookingDto {
  roomId: number
  startTime: string
  endTime: string
}

export interface BookingResponseDto {
  id: number
  roomId: number
  userId: number
  startTime: string
  endTime: string
  status: BookingStatus
}