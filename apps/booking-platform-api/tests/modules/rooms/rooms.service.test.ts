import { expect } from "chai";
import { stub, restore } from "sinon";
import { RoomsService } from "../../../src/modules/rooms/rooms.service";
import { RoomStatus } from "../../../src/modules/rooms/rooms.types";
import * as redis from "../../../src/infrastructure/redis/redis";
import { ErrorCodes } from "../../../src/common/errors/errorDefinitions";
import { HttpStatusCode } from "../../../src/config/constants";
import { DEFAULT_CORRELATION_ID } from "../../mocks/express";
import {
  sampleRoomRow,
  searchQuery,
  emptySearchResponse,
  createMockRoomsProvider,
} from "../../mocks/rooms";

describe("RoomsService", () => {
  afterEach(() => {
    restore();
  });

  describe("searchRooms", () => {
    it("returns cached result when cache hit", async () => {
      const cached = emptySearchResponse;
      stub(redis, "getFromCache").resolves(cached);

      const mockProvider = createMockRoomsProvider();
      const service = new RoomsService(mockProvider);

      const result = await service.searchRooms(DEFAULT_CORRELATION_ID, searchQuery);

      expect(result).to.deep.equal(cached);
      expect((mockProvider.searchRooms as any).called).to.equal(false);
    });

    it("calls provider and setInCache when cache miss, returns mapped response", async () => {
      stub(redis, "getFromCache").resolves(null);
      const setCacheStub = stub(redis, "setInCache").resolves(undefined);

      const mockProvider = createMockRoomsProvider({
        searchRooms: stub().resolves({ rows: [sampleRoomRow], total: 1 }),
      });
      const service = new RoomsService(mockProvider);

      const result = await service.searchRooms(DEFAULT_CORRELATION_ID, searchQuery);

      expect(result.items).to.have.lengthOf(1);
      const item = result.items[0]!;
      expect(item.id).to.equal(1);
      expect(item.name).to.equal("Sea View");
      expect(item.isAvailable).to.equal(true);
      expect(result.page).to.equal(1);
      expect(result.limit).to.equal(20);
      expect(result.total).to.equal(1);
      expect((mockProvider.searchRooms as any).calledOnce).to.equal(true);
      expect(setCacheStub.calledOnce).to.equal(true);
    });
  });

  describe("getRoomById", () => {
    it("throws ROOM_NOT_FOUND when provider returns null", async () => {
      const mockProvider = createMockRoomsProvider({ getRoomById: stub().resolves(null) });
      const service = new RoomsService(mockProvider);

      try {
        await service.getRoomById(DEFAULT_CORRELATION_ID, 999);
        expect.fail("should have thrown");
      } catch (err: any) {
        expect(err.code).to.equal(ErrorCodes.ROOM_NOT_FOUND);
        expect(err.statusCode).to.equal(HttpStatusCode.NOT_FOUND);
      }
    });

    it("returns room details when provider returns room", async () => {
      const mockProvider = createMockRoomsProvider({
        getRoomById: stub().resolves(sampleRoomRow),
      });
      const service = new RoomsService(mockProvider);

      const result = await service.getRoomById(DEFAULT_CORRELATION_ID, 1);

      expect(result.id).to.equal(1);
      expect(result.name).to.equal("Sea View");
      expect(result.location).to.equal("Tel Aviv");
      expect(result.capacity).to.equal(4);
      expect(result.amenities).to.deep.equal(["WIFI"]);
      expect(result.status).to.equal(RoomStatus.ACTIVE);
    });
  });
});