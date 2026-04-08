const defaultHost = typeof window !== "undefined" ? window.location.hostname : "localhost";
const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? `http://${defaultHost}:5500`;

type RequestOptions = RequestInit & {
  bodyJson?: unknown;
};

export async function apiFetch<T>(path: string, options: RequestOptions = {}) {
  const response = await fetch(`${apiUrl}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers ?? {})
    },
    body: options.bodyJson ? JSON.stringify(options.bodyJson) : options.body
  });

  const isJson = response.headers.get("content-type")?.includes("application/json");
  const payload = isJson ? await response.json() : null;

  if (!response.ok) {
    const message =
      payload && typeof payload === "object" && "message" in payload
        ? String(payload.message)
        : "Request failed";

    const error = new Error(message) as any;
    error.status = response.status;
    throw error;
  }

  return payload as T;
}

export type Task = {
  _id: string;
  title: string;
  description?: string;
  status: "pending" | "completed";
  dueDate?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
};
