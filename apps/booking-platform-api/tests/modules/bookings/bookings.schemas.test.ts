import { expect } from "chai";
import { createBookingSchema } from "../../../src/modules/bookings/bookings.schemas";

describe("bookings schemas", () => {
  describe("createBookingSchema", () => {
    it("accepts valid payload", () => {
      const result = createBookingSchema.safeParse({
        roomId: 1,
        startTime: "2025-06-01T14:00:00Z",
        endTime: "2025-06-03T11:00:00Z",
      });
      expect(result.success).to.equal(true);
      if (result.success) {
        expect(result.data.roomId).to.equal(1);
      }
    });

    it("rejects when startTime >= endTime", () => {
      const result = createBookingSchema.safeParse({
        roomId: 1,
        startTime: "2025-06-03T14:00:00Z",
        endTime: "2025-06-01T11:00:00Z",
      });
      expect(result.success).to.equal(false);
    });

    it("rejects invalid roomId", () => {
      expect(createBookingSchema.safeParse({
        roomId: 0,
        startTime: "2025-06-01T14:00:00Z",
        endTime: "2025-06-03T11:00:00Z",
      }).success).to.equal(false);
    });

    it("rejects invalid datetime strings", () => {
      const result = createBookingSchema.safeParse({
        roomId: 1,
        startTime: "not-a-date",
        endTime: "2025-06-03T11:00:00Z",
      });
      expect(result.success).to.equal(false);
    });
  });
});