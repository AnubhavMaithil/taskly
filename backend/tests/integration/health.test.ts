import request from "supertest";
import { createApp } from "../../src/app";

describe("GET /health", () => {
  it("returns service health", async () => {
    const app = createApp();
    const response = await request(app).get("/health");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ ok: true });
  });
});
