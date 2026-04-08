import { NextFunction, Request, Response } from "express";
import { verifyToken } from "../utils/jwt";

export function requireAuth(request: Request, response: Response, next: NextFunction) {
  const bearerToken = request.headers.authorization?.startsWith("Bearer ")
    ? request.headers.authorization.slice(7)
    : null;
  const token = request.cookies.token || bearerToken;

  if (!token) {
    response.status(401).json({ message: "Authentication required" });
    return;
  }

  try {
    request.user = verifyToken(token);
    next();
  } catch {
    response.status(401).json({ message: "Invalid or expired token" });
  }
}
