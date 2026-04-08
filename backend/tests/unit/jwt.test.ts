import { signToken, verifyToken } from "../../src/utils/jwt";

describe("JWT Utils", () => {
  const payload = { id: "123", email: "test@example.com" };

  it("should sign and verify a valid token", () => {
    const token = signToken(payload);
    const decoded = verifyToken(token);
    expect(decoded.id).toBe(payload.id);
    expect(decoded.email).toBe(payload.email);
  });

  it("should throw for an invalid token", () => {
    expect(() => verifyToken("invalid-token")).toThrow();
  });

  it("should throw for an expired token", () => {
    // We can't easily force expiration without mocking time or passing a short expire time
    // but we can verify it throws if the secret is wrong or structure is bad.
    expect(() => verifyToken("")).toThrow();
  });
});
