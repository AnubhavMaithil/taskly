import request from "supertest";
import { createApp } from "../../src/app";
import "./setup";

const app = createApp();

describe("Auth Integration", () => {
  it("should register a new user successfully", async () => {
    const res = await request(app)
      .post("/api/auth/signup")
      .send({
        name: "Test User",
        email: "test@example.com",
        password: "password123"
      });

    expect(res.status).toBe(201);
    expect(res.body.user).toBeDefined();
    expect(res.body.user.email).toBe("test@example.com");
    expect(res.header["set-cookie"]).toBeDefined();
  });

  it("should fail to register with an existing email", async () => {
    await request(app)
      .post("/api/auth/signup")
      .send({
        name: "First User",
        email: "duplicate@example.com",
        password: "password123"
      });

    const res = await request(app)
      .post("/api/auth/signup")
      .send({
        name: "Second User",
        email: "duplicate@example.com",
        password: "password456"
      });

    expect(res.status).toBe(409);
    expect(res.body.message).toMatch(/already in use/i);
  });

  it("should login successfully with correct credentials", async () => {
    await request(app)
      .post("/api/auth/signup")
      .send({
        name: "Login User",
        email: "login@example.com",
        password: "password123"
      });

    const res = await request(app)
      .post("/api/auth/login")
      .send({
        email: "login@example.com",
        password: "password123"
      });

    expect(res.status).toBe(200);
    expect(res.header["set-cookie"]).toBeDefined();
  });

  it("should return profile for authenticated user", async () => {
    const signupRes = await request(app)
      .post("/api/auth/signup")
      .send({
        name: "Profile User",
        email: "profile@example.com",
        password: "password123"
      });

    const cookie = signupRes.header["set-cookie"];

    const res = await request(app)
      .get("/api/auth/me")
      .set("Cookie", cookie);

    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe("profile@example.com");
  });
});
