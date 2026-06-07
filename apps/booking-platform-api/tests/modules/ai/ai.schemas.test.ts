import { expect } from "chai";
import {
  roomSearchIntentProviderResponseSchema,
  roomSearchIntentRequestSchema,
} from "../../../src/modules/ai/ai.schemas";

describe("ai schemas", () => {
  describe("roomSearchIntentRequestSchema", () => {
    it("accepts a valid prompt", () => {
      const result = roomSearchIntentRequestSchema.safeParse({
        prompt: "Tel Aviv for 2 guests with wifi",
        timezone: "Asia/Jerusalem",
      });

      expect(result.success).to.equal(true);
    });

    it("rejects short prompts", () => {
      const result = roomSearchIntentRequestSchema.safeParse({ prompt: "hi" });

      expect(result.success).to.equal(false);
    });
  });

  describe("roomSearchIntentProviderResponseSchema", () => {
    it("accepts supported locations and amenities", () => {
      const result = roomSearchIntentProviderResponseSchema.safeParse({
        intent: {
          location: "Tel Aviv",
          capacity: 2,
          startTime: "2026-06-10T10:00:00.000Z",
          endTime: "2026-06-11T10:00:00.000Z",
          amenities: ["WIFI", "PARKING"],
        },
      });

      expect(result.success).to.equal(true);
    });

    it("rejects unsupported amenities", () => {
      const result = roomSearchIntentProviderResponseSchema.safeParse({
        intent: {
          amenities: ["BALCONY"],
        },
      });

      expect(result.success).to.equal(false);
    });

    it("rejects inverted dates", () => {
      const result = roomSearchIntentProviderResponseSchema.safeParse({
        intent: {
          startTime: "2026-06-11T10:00:00.000Z",
          endTime: "2026-06-10T10:00:00.000Z",
        },
      });

      expect(result.success).to.equal(false);
    });
  });
});