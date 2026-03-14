import { expect } from "chai";
import { stub } from "sinon";
import { asyncHandler } from "../../../src/common/utils/asyncHandler";
import { mockRequest, mockResponse } from "../../mocks/express";

describe("asyncHandler", () => {
  it("calls the handler and passes req, res, next", async () => {
    const handler = stub().resolves(undefined);
    const req = mockRequest();
    const res = mockResponse();
    const next = stub();

    const wrapped = asyncHandler(handler as any);
    wrapped(req, res, next as any);

    await Promise.resolve();

    expect(handler.calledOnce).to.equal(true);
    expect(handler.calledWith(req, res, next)).to.equal(true);
  });

  it("forwards rejection to next", async () => {
    const err = new Error("handler failed");
    const handler = stub().rejects(err);
    const next = stub();

    const wrapped = asyncHandler(handler as any);
    wrapped(mockRequest(), mockResponse(), next as any);

    await new Promise((r) => setTimeout(r, 10));

    expect(next.calledOnce).to.equal(true);
    expect(next.calledWith(err)).to.equal(true);
  });
});