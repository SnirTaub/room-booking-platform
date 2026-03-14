import { expect } from "chai";
import {
  HttpStatusCode,
  MAX_IDEMPOTENCY_KEY_LENGTH,
  IDEMPOTENCY_TTL_IN_SECONDS,
  ROOMS_SEARCH_CACHE_PREFIX,
  CORS_ORIGIN_REGEX,
} from "../../src/config/constants";

describe("constants", () => {
  it("HttpStatusCode has expected values", () => {
    expect(HttpStatusCode.OK).to.equal(200);
    expect(HttpStatusCode.CREATED).to.equal(201);
    expect(HttpStatusCode.BAD_REQUEST).to.equal(400);
    expect(HttpStatusCode.UNAUTHORIZED).to.equal(401);
    expect(HttpStatusCode.NOT_FOUND).to.equal(404);
    expect(HttpStatusCode.CONFLICT).to.equal(409);
    expect(HttpStatusCode.TOO_MANY_REQUESTS).to.equal(429);
    expect(HttpStatusCode.INTERNAL_SERVER_ERROR).to.equal(500);
  });

  it("MAX_IDEMPOTENCY_KEY_LENGTH is 128", () => {
    expect(MAX_IDEMPOTENCY_KEY_LENGTH).to.equal(128);
  });

  it("IDEMPOTENCY_TTL_IN_SECONDS is 600", () => {
    expect(IDEMPOTENCY_TTL_IN_SECONDS).to.equal(600);
  });

  it("ROOMS_SEARCH_CACHE_PREFIX is set", () => {
    expect(ROOMS_SEARCH_CACHE_PREFIX).to.equal("rooms:search:");
  });

  it("CORS_ORIGIN_REGEX strips brackets and quotes", () => {
    expect(`["http://a.com"]`.replace(CORS_ORIGIN_REGEX, "")).to.equal("http://a.com");
  });
});