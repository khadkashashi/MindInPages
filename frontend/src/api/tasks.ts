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
  assigned_to: number | null;
  assigned_to_email?: string;
  can_change_status: boolean;
  can_delete: boolean;
}

export const listTasks = (workspaceId: number, status?: string, mine?: boolean) =>
  api.get<Task[]>("/tasks/", {
    params: { workspace: workspaceId, status, mine: mine ? "true" : undefined },
  });

export const createTask = (data: {
  workspace: number;
  title: string;
  priority?: string;
  due_date?: string | null;
  assigned_to?: number | null;
}) => api.post<Task>("/tasks/", data);

export const updateTask = (id: number, data: Partial<Task>) =>
  api.patch<Task>(`/tasks/${id}/`, data);

export const deleteTask = (id: number) =>
  api.delete(`/tasks/${id}/`);