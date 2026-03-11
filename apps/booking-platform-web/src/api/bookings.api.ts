import { apiClient } from "./client";
import type { BookingResponseDto, CreateBookingRequestDto } from "../types/bookings.types";

export async function createBooking(payload: CreateBookingRequestDto): Promise<BookingResponseDto> {
  const idempotencyKey = crypto.randomUUID();
  const response = await apiClient.post<BookingResponseDto>("/v1/bookings", payload, { headers: { "Idempotency-Key": idempotencyKey } });
  return response.data;
}