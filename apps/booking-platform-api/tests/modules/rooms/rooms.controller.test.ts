import { expect } from "chai";
import { stub, restore } from "sinon";
import { RoomsController } from "../../../src/modules/rooms/rooms.controller";
import { roomsService } from "../../../src/modules/rooms/rooms.service";
import { HttpStatusCode } from "../../../src/config/constants";
import { mockRequest, mockResponse, DEFAULT_CORRELATION_ID } from "../../mocks/express";
import { searchQuery, emptySearchResponse, roomDetails } from "../../mocks/rooms";

describe("RoomsController", () => {
  afterEach(() => {
    restore();
  });

  describe("searchRooms", () => {
    it("parses query, calls roomsService.searchRooms, responds 200 with result", async () => {
      const result = emptySearchResponse;
      const searchStub = stub(roomsService, "searchRooms").resolves(result);

      const req = mockRequest({ query: searchQuery as any });
      const res = mockResponse();
      const controller = new RoomsController();

      await controller.searchRooms(req, res);

      expect(searchStub.calledOnce).to.equal(true);
      expect((res.status as any).calledWith(HttpStatusCode.OK)).to.equal(true);
      expect((res.json as any).calledWith(result)).to.equal(true);
    });
  });

  describe("getRoomById", () => {
    it("parses params, calls roomsService.getRoomById, responds 200 with room", async () => {
      const getByIdStub = stub(roomsService, "getRoomById").resolves(roomDetails);

      const req = mockRequest({ params: { roomId: "1" } });
      const res = mockResponse();
      const controller = new RoomsController();

      await controller.getRoomById(req, res);

      expect(getByIdStub.calledOnce).to.equal(true);
      expect(getByIdStub.calledWith(DEFAULT_CORRELATION_ID, 1)).to.equal(true);
      expect((res.status as any).calledWith(HttpStatusCode.OK)).to.equal(true);
      expect((res.json as any).calledWith(roomDetails)).to.equal(true);
    });
  });
});