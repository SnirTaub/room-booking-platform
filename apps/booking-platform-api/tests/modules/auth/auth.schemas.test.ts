import { expect } from "chai";
import { registerSchema, loginSchema } from "../../../src/modules/auth/auth.schemas";

describe("auth schemas", () => {
  describe("registerSchema", () => {
    it("accepts valid payload", () => {
      const result = registerSchema.safeParse({
        email: "user@example.com",
        password: "password123",
        fullName: "Snir",
      });
      expect(result.success).to.equal(true);
      if (result.success) {
        expect(result.data.email).to.equal("user@example.com");
        expect(result.data.fullName).to.equal("Snir");
      }
    });

    it("rejects invalid email", () => {
      const result = registerSchema.safeParse({
        email: "not-an-email",
        password: "password123",
        fullName: "Snir",
      });
      expect(result.success).to.equal(false);
    });

    it("rejects password shorter than 8", () => {
      const result = registerSchema.safeParse({
        email: "user@example.com",
        password: "short",
        fullName: "Snir",
      });
      expect(result.success).to.equal(false);
    });

    it("rejects fullName shorter than 2", () => {
      const result = registerSchema.safeParse({
        email: "user@example.com",
        password: "password123",
        fullName: "J",
      });
      expect(result.success).to.equal(false);
    });
  });

  describe("loginSchema", () => {
    it("accepts valid payload", () => {
      const result = loginSchema.safeParse({
        email: "user@example.com",
        password: "any",
      });
      expect(result.success).to.equal(true);
      if (result.success) {
        expect(result.data.email).to.equal("user@example.com");
      }
    });

    it("rejects empty password", () => {
      const result = loginSchema.safeParse({
        email: "user@example.com",
        password: "",
      });
      expect(result.success).to.equal(false);
    });

    it("rejects invalid email", () => {
      const result = loginSchema.safeParse({
        email: "invalid",
        password: "secret",
      });
      expect(result.success).to.equal(false);
    });
  });
});