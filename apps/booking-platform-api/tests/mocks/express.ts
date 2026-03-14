import { stub } from "sinon";
import type { Request, Response, NextFunction } from "express";

export const DEFAULT_CORRELATION_ID = "test-correlation-id";

export function mockRequest(overrides: Partial<Request> & { body?: unknown; query?: unknown; params?: unknown } = {}): Request {
  return {
    body: {},
    query: {},
    params: {},
    correlationId: DEFAULT_CORRELATION_ID,
    ...overrides,
  } as unknown as Request;
}

export function mockResponse(): Response {
  const res = {} as Response;
  res.status = stub().returnsThis();
  res.json = stub().returnsThis();
  res.locals = {};
  return res;
}

export function mockNext(): NextFunction {
  return stub() as unknown as NextFunction;
}