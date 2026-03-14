import { expect } from "chai";
import { AppError } from "../../../src/common/errors/AppError";

describe("AppError", () => {
  it("creates an error with name AppError", () => {
    const err = new AppError({
      message: "test",
      statusCode: 400,
      code: "TEST",
    });
    expect(err.name).to.equal("AppError");
    expect(err).to.be.an.instanceOf(Error);
    expect(err).to.be.an.instanceOf(AppError);
  });

  it("sets message, statusCode, and code", () => {
    const err = new AppError({
      message: "Validation failed",
      statusCode: 422,
      code: "VALIDATION_ERROR",
    });
    expect(err.message).to.equal("Validation failed");
    expect(err.statusCode).to.equal(422);
    expect(err.code).to.equal("VALIDATION_ERROR");
  });

  it("accepts optional details", () => {
    const details = { field: "email" };
    const err = new AppError({
      message: "Bad request",
      statusCode: 400,
      code: "BAD_REQUEST",
      details,
    });
    expect(err.details).to.deep.equal(details);
  });
});