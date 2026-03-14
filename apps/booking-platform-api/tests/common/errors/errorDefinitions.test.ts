import { expect } from "chai";
import {
  createAppError,
  ErrorCodes,
  ErrorDefinitions,
} from "../../../src/common/errors/errorDefinitions";
import { AppError } from "../../../src/common/errors/AppError";
import { HttpStatusCode } from "../../../src/config/constants";

describe("errorDefinitions", () => {
  describe("createAppError", () => {
    it("creates AppError with code and default message", () => {
      const err = createAppError(ErrorCodes.VALIDATION_ERROR);
      expect(err).to.be.an.instanceOf(AppError);
      expect(err.code).to.equal(ErrorDefinitions.VALIDATION_ERROR.code);
      expect(err.message).to.equal(ErrorDefinitions.VALIDATION_ERROR.message);
      expect(err.statusCode).to.equal(HttpStatusCode.BAD_REQUEST);
    });

    it("allows overriding message and statusCode", () => {
      const err = createAppError(ErrorCodes.NOT_FOUND, {
        message: "Room not found",
        statusCode: 404,
      });
      expect(err.message).to.equal("Room not found");
      expect(err.statusCode).to.equal(404);
      expect(err.code).to.equal(ErrorCodes.NOT_FOUND);
    });

    it("allows passing details", () => {
      const details = { field: "email" };
      const err = createAppError(ErrorCodes.VALIDATION_ERROR, { details });
      expect(err.details).to.deep.equal(details);
    });
  });
});