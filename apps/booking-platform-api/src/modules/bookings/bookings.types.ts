export enum BookingStatus {
  CONFIRMED = "CONFIRMED",
  CANCELLED = "CANCELLED"
}

export interface CreateBooking {
  roomId: number
  startTime: string
  endTime: string
}

export interface BookingResponse {
  id: number
  roomId: number
  userId: number
  startTime: string
  endTime: string
  status: BookingStatus
}