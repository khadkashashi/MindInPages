import api from "./client";

export interface Task {
  id: number;
  workspace: number;
  title: string;
  description: string;
  status: "TODO" | "IN_PROGRESS" | "DONE";
  priority: "LOW" | "MEDIUM" | "HIGH";
  due_date: string | null;
  completed_at: string | null;
}

export const listTasks = (workspaceId: number, status?: string) =>
  api.get<Task[]>("/tasks/", { params: { workspace: workspaceId, status } });

export const createTask = (data: {
  workspace: number;
  title: string;
  priority?: string;
  due_date?: string | null;
}) => api.post<Task>("/tasks/", data);

export const updateTask = (id: number, data: Partial<Task>) =>
  api.patch<Task>(`/tasks/${id}/`, data);

export const deleteTask = (id: number) => api.delete(`/tasks/${id}/`);