import { expect } from "chai";
import { stub, restore } from "sinon";
import { AuthController } from "../../../src/modules/auth/auth.controller";
import { authService } from "../../../src/modules/auth/auth.service";
import { HttpStatusCode } from "../../../src/config/constants";
import { mockRequest, mockResponse, DEFAULT_CORRELATION_ID } from "../../mocks/express";
import { registerPayload, registerResponse, loginPayload, loginResponse } from "../../mocks/auth";

describe("AuthController", () => {
  afterEach(() => {
    restore();
  });

  describe("register", () => {
    it("parses body, calls authService.register, responds 201 with result", async () => {
      const result = registerResponse;
      const registerStub = stub(authService, "register").resolves(result);

      const req = mockRequest({ body: registerPayload });
      const res = mockResponse();
      const controller = new AuthController();

      await controller.register(req, res);

      expect(registerStub.calledOnce).to.equal(true);
      expect(registerStub.calledWith(DEFAULT_CORRELATION_ID, registerPayload)).to.equal(true);
      expect((res.status as any).calledWith(HttpStatusCode.CREATED)).to.equal(true);
      expect((res.json as any).calledWith(result)).to.equal(true);
    });
  });

  describe("login", () => {
    it("parses body, calls authService.login, responds 200 with result", async () => {
      const result = loginResponse;
      const loginStub = stub(authService, "login").resolves(result);

      const req = mockRequest({ body: loginPayload });
      const res = mockResponse();
      const controller = new AuthController();

      await controller.login(req, res);

      expect(loginStub.calledOnce).to.equal(true);
      expect(loginStub.calledWith(DEFAULT_CORRELATION_ID, loginPayload)).to.equal(true);
      expect((res.status as any).calledWith(HttpStatusCode.OK)).to.equal(true);
      expect((res.json as any).calledWith(result)).to.equal(true);
    });
  });
});