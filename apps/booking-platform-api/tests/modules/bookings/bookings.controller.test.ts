import { expect } from "chai";
import { stub, restore } from "sinon";
import { BookingsController } from "../../../src/modules/bookings/bookings.controller";
import { bookingsService } from "../../../src/modules/bookings/bookings.service";
import { HttpStatusCode } from "../../../src/config/constants";
import { mockRequest, mockResponse, DEFAULT_CORRELATION_ID } from "../../mocks/express";
import { bookingPayload, createdBooking } from "../../mocks/bookings";

describe("BookingsController", () => {
  afterEach(() => {
    restore();
  });

  it("throws when req.user is missing", async () => {
    const req = mockRequest({ body: bookingPayload, user: undefined });
    const res = mockResponse();
    const controller = new BookingsController();

    try {
      await controller.createBooking(req, res);
      expect.fail("should have thrown");
    } catch (err: any) {
      expect(err.message).to.include("User missing");
    }
  });

  it("parses body, calls bookingsService.createBooking, responds 201 with booking", async () => {
    const createStub = stub(bookingsService, "createBooking").resolves(createdBooking);

    const req = mockRequest({
      body: bookingPayload,
      user: { userId: 5, email: "u@example.com" },
    });
    const res = mockResponse();
    const controller = new BookingsController();

    await controller.createBooking(req, res);

    expect(createStub.calledOnce).to.equal(true);
    expect(createStub.calledWith(DEFAULT_CORRELATION_ID, 5, bookingPayload)).to.equal(true);
    expect((res.status as any).calledWith(HttpStatusCode.CREATED)).to.equal(true);
    expect((res.json as any).calledWith(createdBooking)).to.equal(true);
  });
});