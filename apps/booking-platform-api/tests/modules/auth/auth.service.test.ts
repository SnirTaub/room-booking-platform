import { expect } from "chai";
import { stub, restore } from "sinon";
import { AuthService } from "../../../src/modules/auth/auth.service";
import { ErrorCodes } from "../../../src/common/errors/errorDefinitions";
import { DEFAULT_CORRELATION_ID } from "../../mocks/express";
import {
  createUserRow,
  createMockAuthProvider,
  registerPayload,
  loginPayload,
} from "../../mocks/auth";

describe("AuthService", () => {
  afterEach(() => {
    restore();
  });

  describe("register", () => {
    it("throws EMAIL_ALREADY_EXISTS when user exists", async () => {
      const existingUser = createUserRow({ email: "existing@example.com", full_name: "Existing User" });
      const mockProvider = createMockAuthProvider({
        findUserByEmail: stub().resolves(existingUser),
        insertUser: stub(),
      });

      const service = new AuthService(mockProvider);

      try {
        await service.register(DEFAULT_CORRELATION_ID, {
          email: "existing@example.com",
          password: "password123",
          fullName: "New Name",
        });
        expect.fail("should have thrown");
      } catch (err: any) {
        expect(err.code).to.equal(ErrorCodes.EMAIL_ALREADY_EXISTS);
      }
      expect((mockProvider.insertUser as any).called).to.equal(false);
    });

    it("returns user and accessToken when registration succeeds", async () => {
      const createdUser = createUserRow({
        id: 2,
        email: "new@example.com",
        full_name: "New User",
      });
      const mockProvider = createMockAuthProvider({
        findUserByEmail: stub().resolves(null),
        insertUser: stub().resolves(createdUser),
      });

      const service = new AuthService(mockProvider);

      const result = await service.register(DEFAULT_CORRELATION_ID, {
        ...registerPayload,
        email: "new@example.com",
        fullName: "New User",
      });

      expect(result.user.id).to.equal(2);
      expect(result.user.email).to.equal("new@example.com");
      expect(result.user.fullName).to.equal("New User");
      expect(result.accessToken).to.be.a("string");
      expect(result.accessToken.length).to.be.greaterThan(0);
    });
  });

  describe("login", () => {
    it("throws INVALID_CREDENTIALS when user not found", async () => {
      const mockProvider = createMockAuthProvider({ findUserByEmail: stub().resolves(null) });
      const service = new AuthService(mockProvider);

      try {
        await service.login(DEFAULT_CORRELATION_ID, {
          email: "nobody@example.com",
          password: "secret",
        });
        expect.fail("should have thrown");
      } catch (err: any) {
        expect(err.code).to.equal(ErrorCodes.INVALID_CREDENTIALS);
      }
    });

    it("returns accessToken when password matches", async () => {
      const bcrypt = require("bcryptjs");
      const hash = await bcrypt.hash("correctPassword", 10);
      const user = createUserRow({ id: 3, password_hash: hash });
      const mockProvider = createMockAuthProvider({ findUserByEmail: stub().resolves(user) });
      const service = new AuthService(mockProvider);

      const result = await service.login(DEFAULT_CORRELATION_ID, {
        email: "user@example.com",
        password: "correctPassword",
      });

      expect(result.accessToken).to.be.a("string");
      expect(result.accessToken.length).to.be.greaterThan(0);
    });

    it("throws INVALID_CREDENTIALS when password is wrong", async () => {
      const bcrypt = require("bcryptjs");
      const hash = await bcrypt.hash("rightPassword", 10);
      const user = createUserRow({ id: 4, password_hash: hash });
      const mockProvider = createMockAuthProvider({ findUserByEmail: stub().resolves(user) });
      const service = new AuthService(mockProvider);

      try {
        await service.login(DEFAULT_CORRELATION_ID, {
          email: "user@example.com",
          password: "wrongPassword",
        });
        expect.fail("should have thrown");
      } catch (err: any) {
        expect(err.code).to.equal(ErrorCodes.INVALID_CREDENTIALS);
      }
    });
  });
});