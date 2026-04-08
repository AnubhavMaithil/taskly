import jwt, { type Secret, type SignOptions } from "jsonwebtoken";
import { env } from "../config/env";

type TokenPayload = {
  id: string;
  email: string;
};

export function signToken(payload: TokenPayload) {
  const secret: Secret = env.jwtSecret;

  return jwt.sign(payload, secret, {
    expiresIn: env.jwtExpiresIn as SignOptions["expiresIn"]
  });
}

export function verifyToken(token: string) {
  const secret: Secret = env.jwtSecret;

  return jwt.verify(token, secret) as TokenPayload;
}
