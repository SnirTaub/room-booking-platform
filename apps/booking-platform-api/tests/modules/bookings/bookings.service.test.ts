import { expect } from "chai";
import { stub, restore } from "sinon";
import { BookingsService } from "../../../src/modules/bookings/bookings.service";
import * as redis from "../../../src/infrastructure/redis/redis";
import { ErrorCodes } from "../../../src/common/errors/errorDefinitions";
import { HttpStatusCode } from "../../../src/config/constants";
import { DEFAULT_CORRELATION_ID } from "../../mocks/express";
import {
  bookingPayload,
  createdBooking,
  createMockBookingsProvider,
} from "../../mocks/bookings";

describe("BookingsService", () => {
  afterEach(() => {
    restore();
  });

  it("throws ROOM_NOT_FOUND when room cannot be locked", async () => {
    const mockProvider = createMockBookingsProvider({
      lockActiveRoom: stub().resolves(false),
      hasOverlappingBooking: stub(),
    });

    stub(redis, "deleteByPattern").resolves(undefined);

    const service = new BookingsService(mockProvider);

    try {
      await service.createBooking(DEFAULT_CORRELATION_ID, 5, bookingPayload);
      expect.fail("should have thrown");
    } catch (err: any) {
      expect(err.code).to.equal(ErrorCodes.ROOM_NOT_FOUND);
      expect(err.statusCode).to.equal(HttpStatusCode.NOT_FOUND);
    }
  });

  it("throws ROOM_ALREADY_BOOKED when overlap exists", async () => {
    const mockProvider = createMockBookingsProvider({
      hasOverlappingBooking: stub().resolves(true),
    });

    stub(redis, "deleteByPattern").resolves(undefined);

    const service = new BookingsService(mockProvider);

    try {
      await service.createBooking(DEFAULT_CORRELATION_ID, 5, bookingPayload);
      expect.fail("should have thrown");
    } catch (err: any) {
      expect(err.code).to.equal(ErrorCodes.ROOM_ALREADY_BOOKED);
      expect(err.statusCode).to.equal(HttpStatusCode.CONFLICT);
    }
  });

  it("returns booking and calls deleteByPattern when successful", async () => {
    const mockProvider = createMockBookingsProvider();
    const deleteStub = stub(redis, "deleteByPattern").resolves(undefined);

    const service = new BookingsService(mockProvider);

    const result = await service.createBooking(DEFAULT_CORRELATION_ID, 5, bookingPayload);

    expect(result).to.deep.equal(createdBooking);
    expect(deleteStub.calledOnce).to.equal(true);
  });
});