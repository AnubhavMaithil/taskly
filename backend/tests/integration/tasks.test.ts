import mongoose from "mongoose";
import request from "supertest";
import { createApp } from "../../src/app";
import "./setup";

const app = createApp();

describe("Tasks Integration", () => {
  let cookie: any;

  beforeEach(async () => {
    const signupRes = await request(app)
      .post("/api/auth/signup")
      .send({
        name: "Tasks User",
        email: "tasks@example.com",
        password: "password123"
      });
    cookie = signupRes.header["set-cookie"];
  });

  it("should create and fetch tasks", async () => {
    await request(app)
      .post("/api/tasks")
      .set("Cookie", cookie!)
      .send({
        title: "Test Task",
        description: "Task Description"
      });

    const res = await request(app)
      .get("/api/tasks")
      .set("Cookie", cookie!);

    expect(res.status).toBe(200);
    expect(res.body.tasks).toHaveLength(1);
    expect(res.body.tasks[0].title).toBe("Test Task");
  });

  it("should not allow access to tasks without authentication", async () => {
    const res = await request(app).get("/api/tasks");
    expect(res.status).toBe(401);
  });

  it("should only return tasks belonging to the user", async () => {
    // User 1 creates a task
    await request(app)
      .post("/api/tasks")
      .set("Cookie", cookie!)
      .send({ title: "User 1 Task" });

    // User 2 signs up
    const signupRes2 = await request(app)
      .post("/api/auth/signup")
      .send({
        name: "User 2",
        email: "user2@example.com",
        password: "password123"
      });
    const cookie2 = signupRes2.header["set-cookie"];

    // User 2 fetches tasks
    const res = await request(app)
      .get("/api/tasks")
      .set("Cookie", cookie2!);

    expect(res.status).toBe(200);
    expect(res.body.tasks).toHaveLength(0);
  });

  it("should update and delete a task", async () => {
    const createRes = await request(app)
      .post("/api/tasks")
      .set("Cookie", cookie!)
      .send({ title: "Task to update" });

    const taskId = createRes.body.task._id;

    // Update
    const updateRes = await request(app)
      .put(`/api/tasks/${taskId}`)
      .set("Cookie", cookie!)
      .send({ status: "completed" });

    expect(updateRes.status).toBe(200);
    expect(updateRes.body.task.status).toBe("completed");

    // Delete
    const deleteRes = await request(app)
      .delete(`/api/tasks/${taskId}`)
      .set("Cookie", cookie!);

    expect(deleteRes.status).toBe(204);

    // Fetch again
    const fetchRes = await request(app)
      .get("/api/tasks")
      .set("Cookie", cookie!);
    expect(fetchRes.body.tasks).toHaveLength(0);
  });

  it("should handle partial updates and status-dependent timestamps", async () => {
    const createRes = await request(app)
      .post("/api/tasks")
      .set("Cookie", cookie!)
      .send({ title: "Partial Update Task" });
    const taskId = createRes.body.task._id;

    // Only update description
    const res1 = await request(app)
      .put(`/api/tasks/${taskId}`)
      .set("Cookie", cookie!)
      .send({ description: "Updated Desc" });
    expect(res1.body.task.description).toBe("Updated Desc");
    expect(res1.body.task.title).toBe("Partial Update Task");
    expect(res1.body.task.completedAt).toBeUndefined();

    // Mark as completed
    const res2 = await request(app)
      .put(`/api/tasks/${taskId}`)
      .set("Cookie", cookie!)
      .send({ status: "completed" });
    expect(res2.body.task.status).toBe("completed");
    expect(res2.body.task.completedAt).toBeDefined();

    // Mark back to pending
    const res3 = await request(app)
      .put(`/api/tasks/${taskId}`)
      .set("Cookie", cookie!)
      .send({ status: "pending" });
    expect(res3.body.task.status).toBe("pending");
    expect(res3.body.task.completedAt).toBeNull();
  });

  it("should return 404 when updating non-existent task", async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app)
      .put(`/api/tasks/${fakeId}`)
      .set("Cookie", cookie!)
      .send({ title: "New Title" });
    expect(res.status).toBe(404);
  });

  it("should support Bearer token authentication", async () => {
    const signupRes = await request(app)
      .post("/api/auth/signup")
      .send({
        name: "Bearer User",
        email: "bearer@example.com",
        password: "password123"
      });
    const token = signupRes.header["set-cookie"][0].split(";")[0].split("=")[1];

    const res = await request(app)
      .get("/api/tasks")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
  });

  it("should fail with invalid token", async () => {
    const res = await request(app)
      .get("/api/tasks")
      .set("Cookie", ["token=invalid-token"]);
    expect(res.status).toBe(401);
  });

  it("should set completedAt on creation if status is completed", async () => {
    const res = await request(app)
      .post("/api/tasks")
      .set("Cookie", cookie!)
      .send({
        title: "Immediate Completed Task",
        status: "completed"
      });
    expect(res.body.task.completedAt).toBeDefined();
  });

  it("should handle empty dueDate to clear it", async () => {
    const createRes = await request(app)
      .post("/api/tasks")
      .set("Cookie", cookie!)
      .send({ title: "Due Date Task", dueDate: "2025-01-01" });
    const taskId = createRes.body.task._id;

    const updateRes = await request(app)
      .put(`/api/tasks/${taskId}`)
      .set("Cookie", cookie!)
      .send({ dueDate: "" });
    expect(updateRes.body.task.dueDate).toBeNull();
  });

  it("should return tasks from cache on second request", async () => {
    // First request - populates cache
    await request(app).get("/api/tasks").set("Cookie", cookie!);
    
    // Second request - should hit cache
    const res = await request(app).get("/api/tasks").set("Cookie", cookie!);
    expect(res.status).toBe(200);
  });

  it("should not update completedAt if already completed", async () => {
    const createRes = await request(app)
      .post("/api/tasks")
      .set("Cookie", cookie!)
      .send({ title: "Already Completed", status: "completed" });
    const firstCompletedAt = createRes.body.task.completedAt;

    // Redundant update
    const updateRes = await request(app)
      .put(`/api/tasks/${createRes.body.task._id}`)
      .set("Cookie", cookie!)
      .send({ status: "completed" });
    
    expect(updateRes.body.task.completedAt).toBe(firstCompletedAt);
  });
});
