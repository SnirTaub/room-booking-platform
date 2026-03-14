import { expect } from "chai";
import { hashPassword, comparePassword } from "../../../src/common/utils/password";

describe("password", () => {
  describe("hashPassword", () => {
    it("returns a hash different from the plain password", async () => {
      const hash = await hashPassword("mySecretPassword");
      expect(hash).to.not.equal("mySecretPassword");
      expect(hash.length).to.be.greaterThan(0);
    });

    it("produces different hashes for the same password (salt)", async () => {
      const h1 = await hashPassword("same");
      const h2 = await hashPassword("same");
      expect(h1).to.not.equal(h2);
    });
  });

  describe("comparePassword", () => {
    it("returns true for matching password and hash", async () => {
      const password = "correctPassword";
      const hash = await hashPassword(password);
      const result = await comparePassword(password, hash);
      expect(result).to.equal(true);
    });

    it("returns false for wrong password", async () => {
      const hash = await hashPassword("right");
      const result = await comparePassword("wrong", hash);
      expect(result).to.equal(false);
    });
  });
});