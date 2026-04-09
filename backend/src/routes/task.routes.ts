import { Router } from "express";
import { createTask, deleteTask, getTasks, updateTask } from "../controllers/task.controller";
import { requireAuth } from "../middleware/auth";

const taskRouter = Router();

taskRouter.use(requireAuth);
taskRouter.get("/", getTasks);
taskRouter.post("/", createTask);
taskRouter.put("/:id", updateTask);
taskRouter.delete("/:id", deleteTask);

export { taskRouter };
