import { hashPassword, comparePassword } from "../../src/utils/password";

describe("Password Utils", () => {
  const rawPassword = "password123";

  it("should hash a password successfully", async () => {
    const hashed = await hashPassword(rawPassword);
    expect(hashed).toBeDefined();
    expect(hashed).not.toBe(rawPassword);
  });

  it("should return true for matching passwords", async () => {
    const hashed = await hashPassword(rawPassword);
    const matches = await comparePassword(rawPassword, hashed);
    expect(matches).toBe(true);
  });

  it("should return false for non-matching passwords", async () => {
    const hashed = await hashPassword(rawPassword);
    const matches = await comparePassword("wrong-password", hashed);
    expect(matches).toBe(false);
  });
});
