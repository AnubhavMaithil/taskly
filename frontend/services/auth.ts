import { apiFetch } from "../lib/api";

export type User = {
  id: string;
  name: string;
  email: string;
};

export type SignupPayload = {
  name: string;
  email: string;
  password: string;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export const AuthService = {
  async signup(payload: SignupPayload) {
    return apiFetch<{ user: User }>("/api/auth/signup", {
      method: "POST",
      bodyJson: payload
    });
  },

  async login(payload: LoginPayload) {
    return apiFetch<{ user: User }>("/api/auth/login", {
      method: "POST",
      bodyJson: payload
    });
  },

  async logout() {
    return apiFetch<{ message: string }>("/api/auth/logout", {
      method: "POST",
    });
  },

  async getProfile() {
    return apiFetch<{ user: User }>("/api/auth/me");
  }
};
