import { expect } from "chai";
import { stub } from "sinon";
import { AiService } from "../../../src/modules/ai/ai.service";
import { RoomSearchIntentParser } from "../../../src/modules/ai/ai.types";
import { DEFAULT_CORRELATION_ID } from "../../mocks/express";

describe("AiService", () => {
  it("validates request and returns parser result", async () => {
    const parser: RoomSearchIntentParser = {
      parseRoomSearchIntent: stub().resolves({
        source: "openai",
        intent: {
          location: "Tel Aviv",
          capacity: 2,
          amenities: ["WIFI"],
        },
      }),
    };

    const service = new AiService(parser);
    const result = await service.parseRoomSearchIntent(DEFAULT_CORRELATION_ID, {
      prompt: "Tel Aviv for 2 guests with wifi",
    });

    expect(result.intent.location).to.equal("Tel Aviv");
    expect(result.intent.capacity).to.equal(2);
    expect(result.intent.capacityMode).to.equal("EXACT");
    expect((parser.parseRoomSearchIntent as any).calledOnce).to.equal(true);
  });

  it("rejects invalid requests before calling parser", async () => {
    const parser: RoomSearchIntentParser = {
      parseRoomSearchIntent: stub(),
    };

    const service = new AiService(parser);

    try {
      await service.parseRoomSearchIntent(DEFAULT_CORRELATION_ID, { prompt: "no" });
      expect.fail("should have thrown");
    } catch {
      expect((parser.parseRoomSearchIntent as any).called).to.equal(false);
    }
  });
});