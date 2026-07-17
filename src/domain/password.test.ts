import { hashPassword, isValidPassword, verifyPassword } from "./password";

describe("isValidPassword", () => {
  it("accepts a password with at least 8 characters", () => {
    expect(isValidPassword("senha1234")).toBe(true);
  });

  it("rejects a password shorter than 8 characters", () => {
    expect(isValidPassword("1234567")).toBe(false);
  });
});

describe("hashPassword / verifyPassword", () => {
  it("verifies the correct password against its hash", () => {
    const hash = hashPassword("senha1234");
    expect(verifyPassword("senha1234", hash)).toBe(true);
  });

  it("rejects an incorrect password", () => {
    const hash = hashPassword("senha1234");
    expect(verifyPassword("senha-errada", hash)).toBe(false);
  });

  it("produces a different hash each time due to the random salt", () => {
    const first = hashPassword("senha1234");
    const second = hashPassword("senha1234");
    expect(first).not.toBe(second);
  });

  it("rejects a malformed stored hash", () => {
    expect(verifyPassword("senha1234", "not-a-valid-hash")).toBe(false);
  });
});
