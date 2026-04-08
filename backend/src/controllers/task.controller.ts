import { z } from "zod";
import { Task } from "../models/task.model";
import { CacheService } from "../services/cache.service";
import { asyncHandler } from "../utils/async-handler";
import { AuthenticatedRequest } from "../types/auth.types";

const createTaskSchema = z.object({
  title: z.string().trim().min(1),
  description: z.string().trim().optional().default(""),
  status: z.enum(["pending", "completed"]).optional().default("pending"),
  dueDate: z.string().datetime().optional().or(z.string().date().optional())
});

const updateTaskSchema = z.object({
  title: z.string().trim().min(1).optional(),
  description: z.string().trim().optional(),
  status: z.enum(["pending", "completed"]).optional(),
  dueDate: z.string().datetime().optional().or(z.string().date().optional()).or(z.literal(""))
});

export const getTasks = asyncHandler(async (request: AuthenticatedRequest, response) => {
  const userId = request.user.id;

  const cached = await CacheService.getTasksCache(userId);
  if (cached) {
    response.json(cached);
    return;
  }

  const tasks = await Task.find({ owner: userId });
  tasks.sort((left, right) => {
    if (left.status !== right.status) {
      return left.status === "pending" ? -1 : 1;
    }

    const leftDue = left.dueDate ? new Date(left.dueDate).getTime() : Number.MAX_SAFE_INTEGER;
    const rightDue = right.dueDate ? new Date(right.dueDate).getTime() : Number.MAX_SAFE_INTEGER;

    if (leftDue !== rightDue) {
      return leftDue - rightDue;
    }

    return new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime();
  });

  const payload = { tasks };
  await CacheService.setTasksCache(userId, payload);

  response.json(payload);
});

export const createTask = asyncHandler(async (request: AuthenticatedRequest, response) => {
  const userId = request.user.id;

  const parsed = createTaskSchema.safeParse(request.body);

  if (!parsed.success) {
    response.status(400).json({ message: "Invalid task payload" });
    return;
  }

  const task = await Task.create({
    ...parsed.data,
    dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : undefined,
    completedAt: parsed.data.status === "completed" ? new Date() : undefined,
    owner: userId
  });

  await CacheService.invalidateTasksCache(userId);

  response.status(201).json({ task });
});

export const updateTask = asyncHandler(async (request: AuthenticatedRequest, response) => {
  const userId = request.user.id;

  const parsed = updateTaskSchema.safeParse(request.body);

  if (!parsed.success) {
    response.status(400).json({ message: "Invalid task payload" });
    return;
  }

  const existingTask = await Task.findOne({ _id: request.params.id, owner: userId });

  if (!existingTask) {
    response.status(404).json({ message: "Task not found" });
    return;
  }

  const update: Record<string, unknown> = {};

  if (parsed.data.title !== undefined) {
    update.title = parsed.data.title;
  }

  if (parsed.data.description !== undefined) {
    update.description = parsed.data.description;
  }

  if (parsed.data.status !== undefined) {
    update.status = parsed.data.status;
    
    // Set completedAt only if status is changing to 'completed'
    if (parsed.data.status === "completed" && existingTask.status !== "completed") {
      update.completedAt = new Date();
    } else if (parsed.data.status === "pending") {
      update.completedAt = null;
    }
  }

  if (parsed.data.dueDate !== undefined) {
    update.dueDate = parsed.data.dueDate === "" ? null : new Date(parsed.data.dueDate);
  }

  const task = await Task.findOneAndUpdate(
    { _id: request.params.id, owner: userId },
    { $set: update },
    { new: true }
  );

  await CacheService.invalidateTasksCache(userId);

  response.json({ task });
});

export const deleteTask = asyncHandler(async (request: AuthenticatedRequest, response) => {
  const userId = request.user.id;

  const task = await Task.findOneAndDelete({
    _id: request.params.id,
    owner: userId
  });

  if (!task) {
    response.status(404).json({ message: "Task not found" });
    return;
  }

  await CacheService.invalidateTasksCache(userId);

  response.status(204).send();
});
