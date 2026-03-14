import { expect } from "chai";
import {
  searchRoomsSchema,
  roomIdParamsSchema,
} from "../../../src/modules/rooms/rooms.schemas";

describe("rooms schemas", () => {
  describe("searchRoomsSchema", () => {
    it("accepts valid query with required dates", () => {
      const result = searchRoomsSchema.safeParse({
        startTime: "2025-06-01T14:00:00Z",
        endTime: "2025-06-03T11:00:00Z",
      });
      expect(result.success).to.equal(true);
      if (result.success) {
        expect(result.data.page).to.equal(1);
        expect(result.data.limit).to.equal(20);
      }
    });

    it("coerces page and limit", () => {
      const result = searchRoomsSchema.safeParse({
        startTime: "2025-06-01T14:00:00Z",
        endTime: "2025-06-03T11:00:00Z",
        page: "2",
        limit: "10",
      });
      expect(result.success).to.equal(true);
      if (result.success) {
        expect(result.data.page).to.equal(2);
        expect(result.data.limit).to.equal(10);
      }
    });

    it("rejects when startTime >= endTime", () => {
      const result = searchRoomsSchema.safeParse({
        startTime: "2025-06-03T14:00:00Z",
        endTime: "2025-06-01T11:00:00Z",
      });
      expect(result.success).to.equal(false);
    });

    it("transforms amenities string to array", () => {
      const result = searchRoomsSchema.safeParse({
        startTime: "2025-06-01T14:00:00Z",
        endTime: "2025-06-03T11:00:00Z",
        amenities: "WIFI,KITCHEN",
      });
      expect(result.success).to.equal(true);
      if (result.success) {
        expect(result.data.amenities).to.deep.equal(["WIFI", "KITCHEN"]);
      }
    });
  });

  describe("roomIdParamsSchema", () => {
    it("accepts positive integer roomId", () => {
      const result = roomIdParamsSchema.safeParse({ roomId: 5 });
      expect(result.success).to.equal(true);
      if (result.success) expect(result.data.roomId).to.equal(5);
    });

    it("coerces string to number", () => {
      const result = roomIdParamsSchema.safeParse({ roomId: "42" });
      expect(result.success).to.equal(true);
      if (result.success) expect(result.data.roomId).to.equal(42);
    });

    it("rejects zero or negative", () => {
      expect(roomIdParamsSchema.safeParse({ roomId: 0 }).success).to.equal(false);
      expect(roomIdParamsSchema.safeParse({ roomId: -1 }).success).to.equal(false);
    });
  });
});