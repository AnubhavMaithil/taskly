import { Request, Response } from "express";
import { requireAuth } from "../../src/middleware/auth";
import { signToken } from "../../src/utils/jwt";

describe("Auth Middleware", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction = jest.fn();

  beforeEach(() => {
    mockRequest = {
      cookies: {},
      headers: {}
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    nextFunction = jest.fn();
  });

  it("should fail if no token is present", () => {
    requireAuth(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({ message: "Authentication required" });
    expect(nextFunction).not.toHaveBeenCalled();
  });

  it("should allow access with a valid cookie token", () => {
    const token = signToken({ id: "123", email: "test@example.com" });
    mockRequest.cookies!.token = token;

    requireAuth(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(nextFunction).toHaveBeenCalled();
    expect((mockRequest as any).user.id).toBe("123");
  });

  it("should allow access with a valid Bearer token", () => {
    const token = signToken({ id: "123", email: "test@example.com" });
    mockRequest.headers!.authorization = `Bearer ${token}`;

    requireAuth(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(nextFunction).toHaveBeenCalled();
    expect((mockRequest as any).user.id).toBe("123");
  });

  it("should fail with an invalid token", () => {
    mockRequest.cookies!.token = "invalid-token";

    requireAuth(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({ message: "Invalid or expired token" });
  });
});
