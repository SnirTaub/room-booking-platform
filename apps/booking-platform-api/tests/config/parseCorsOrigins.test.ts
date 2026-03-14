import { expect } from "chai";
import { parseCorsOrigins } from "../../src/config/parseCorsOrigins";

describe("parseCorsOrigins", () => {
  it("parses a single URL", () => {
    expect(parseCorsOrigins("http://localhost:5173")).to.deep.equal(["http://localhost:5173"]);
  });

  it("strips brackets and quotes from a single value", () => {
    expect(parseCorsOrigins(`["http://localhost:5173"]`)).to.deep.equal(["http://localhost:5173"]);
  });

  it("parses comma-separated URLs", () => {
    expect(
      parseCorsOrigins("http://localhost:5173,https://app.example.com")
    ).to.deep.equal(["http://localhost:5173", "https://app.example.com"]);
  });

  it("trims whitespace around each value", () => {
    expect(
      parseCorsOrigins("  http://localhost:5173  ,  https://app.com  ")
    ).to.deep.equal(["http://localhost:5173", "https://app.com"]);
  });

  it("strips brackets and quotes from each value", () => {
    expect(
      parseCorsOrigins(`["http://a.com"], ["http://b.com"]`)
    ).to.deep.equal(["http://a.com", "http://b.com"]);
  });

  it("filters out empty segments", () => {
    expect(parseCorsOrigins("http://a.com,,http://b.com")).to.deep.equal([
      "http://a.com",
      "http://b.com",
    ]);
  });
});