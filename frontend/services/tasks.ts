import { apiFetch, Task } from "../lib/api";

export type CreateTaskPayload = {
  title: string;
  description?: string;
  status?: "pending" | "completed";
  dueDate?: string;
};

export type UpdateTaskPayload = Partial<CreateTaskPayload>;

export const TaskService = {
  async getTasks() {
    return apiFetch<{ tasks: Task[] }>("/api/tasks");
  },

  async createTask(payload: CreateTaskPayload) {
    return apiFetch<{ task: Task }>("/api/tasks", {
      method: "POST",
      bodyJson: payload,
    });
  },

  async updateTask(id: string, payload: UpdateTaskPayload) {
    return apiFetch<{ task: Task }>(`/api/tasks/${id}`, {
      method: "PUT",
      bodyJson: payload,
    });
  },

  async deleteTask(id: string) {
    return apiFetch(`/api/tasks/${id}`, {
      method: "DELETE",
    });
  },
};
