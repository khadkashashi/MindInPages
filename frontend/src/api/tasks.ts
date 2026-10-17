import api from "./client";

export interface TaskAssignee {
  id: number;
  email: string;
  username: string;
}

export interface Task {
  id: number;
  workspace: number;
  title: string;
  description: string;
  status: "TODO" | "IN_PROGRESS" | "DONE";
  priority: "LOW" | "MEDIUM" | "HIGH";
  due_date: string | null;
  completed_at: string | null;
  assignees: number[];
  assignee_details: TaskAssignee[];
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
  assignees?: number[];
}) => api.post<Task>("/tasks/", data);

export const updateTask = (
  id: number,
  data: {
    title?: string;
    status?: Task["status"];
    priority?: Task["priority"];
    assignees?: number[];
  }
) => api.patch<Task>(`/tasks/${id}/`, data);

export const deleteTask = (id: number) => api.delete(`/tasks/${id}/`);