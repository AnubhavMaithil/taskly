import { Response } from "express";
import { AuthenticatedRequest } from "../types/auth.types";
import { z } from "zod";
import { User } from "../models/user.model";
import { asyncHandler } from "../utils/async-handler";
import { comparePassword, hashPassword } from "../utils/password";
import { signToken } from "../utils/jwt";
import { env } from "../config/env";

const signupSchema = z.object({
  name: z.string().trim().min(2),
  email: z.string().trim().email(),
  password: z.string().min(8)
});

const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(8)
});

function attachToken(response: Response, token: string) {
  const isProd = env.nodeEnv === "production";

  response.cookie("token", token, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000
  });
}

export const signup = asyncHandler(async (request, response) => {
  const parsed = signupSchema.safeParse(request.body);

  if (!parsed.success) {
    response.status(400).json({ message: "Invalid signup payload" });
    return;
  }

  const email = parsed.data.email.toLowerCase();
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    response.status(409).json({ message: "Email already in use" });
    return;
  }

  const user = await User.create({
    ...parsed.data,
    email,
    password: await hashPassword(parsed.data.password)
  });

  const token = signToken({
    id: user.id,
    email: user.email
  });

  attachToken(response, token);

  response.status(201).json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email
    }
  });
});

export const login = asyncHandler(async (request, response) => {
  const parsed = loginSchema.safeParse(request.body);

  if (!parsed.success) {
    response.status(400).json({ message: "Invalid login payload" });
    return;
  }

  const email = parsed.data.email.toLowerCase();
  const user = await User.findOne({ email });

  if (!user) {
    response.status(401).json({ message: "Invalid credentials" });
    return;
  }

  const passwordMatches = await comparePassword(parsed.data.password, user.password);

  if (!passwordMatches) {
    response.status(401).json({ message: "Invalid credentials" });
    return;
  }

  const token = signToken({
    id: user.id,
    email: user.email
  });

  attachToken(response, token);

  response.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email
    }
  });
});

export const logout = asyncHandler(async (_request, response) => {
  const isProd = env.nodeEnv === "production";

  response.clearCookie("token", {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax"
  });

  response.json({ message: "Logged out" });
});

export const getProfile = asyncHandler(async (request: AuthenticatedRequest, response) => {
  const user = await User.findById(request.user.id).select("-password");

  if (!user) {
    response.status(404).json({ message: "User not found" });
    return;
  }

  response.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email
    }
  });
});
