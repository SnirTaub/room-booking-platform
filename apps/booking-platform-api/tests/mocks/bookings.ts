import { stub } from "sinon";
import type { BookingsProvider } from "../../src/modules/bookings/bookings.provider";
import type { CreateBooking, BookingResponse } from "../../src/modules/bookings/bookings.types";
import { BookingStatus } from "../../src/modules/bookings/bookings.types";

export const fakePgClient = {} as any;

export const bookingPayload: CreateBooking = {
  roomId: 1,
  startTime: "2025-06-01T14:00:00Z",
  endTime: "2025-06-03T11:00:00Z",
};

export const createdBooking: BookingResponse = {
  id: 10,
  roomId: 1,
  userId: 5,
  startTime: bookingPayload.startTime,
  endTime: bookingPayload.endTime,
  status: BookingStatus.CONFIRMED,
};

export function createMockBookingsProvider(partial: Partial<{
  runInTransaction: ReturnType<typeof stub>;
  lockActiveRoom: ReturnType<typeof stub>;
  hasOverlappingBooking: ReturnType<typeof stub>;
  insertBooking: ReturnType<typeof stub>;
}> = {}): BookingsProvider {
  return {
    runInTransaction: stub().callsFake(async (_cid: string, fn: (client: any) => Promise<any>) => fn(fakePgClient)),
    lockActiveRoom: stub().resolves(true),
    hasOverlappingBooking: stub().resolves(false),
    insertBooking: stub().resolves(createdBooking),
    ...partial,
  } as unknown as BookingsProvider;
}