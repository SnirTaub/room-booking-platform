import { apiClient } from "./client";
import type { BookingResponse, CreateBookingRequest } from "../types/bookings.types";

export async function createBooking(payload: CreateBookingRequest): Promise<BookingResponse> {
  const idempotencyKey = crypto.randomUUID();
  const response = await apiClient.post<BookingResponse>("/v1/bookings", payload, { headers: { "Idempotency-Key": idempotencyKey } });
  return response.data;
}