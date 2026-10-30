import api from "./client";

export type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE";
export type CompletionMode = "SHARED" | "INDIVIDUAL";

export interface TaskAssignee {
  id: number;
  email: string;
  username: string;
  status: TaskStatus;
  is_me: boolean;
}

export interface Task {
  id: number;
  workspace: number;
  title: string;
  description: string;
  status: TaskStatus;
  priority: "LOW" | "MEDIUM" | "HIGH";
  completion_mode: CompletionMode;
  due_date: string | null;
  completed_at: string | null;
  assignees: number[];
  assignee_details: TaskAssignee[];
  my_status: TaskStatus | null;
  progress_summary: { done: number; total: number } | null;
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
  completion_mode?: CompletionMode;
}) => api.post<Task>("/tasks/", data);

export const updateTask = (
  id: number,
  data: {
    title?: string;
    priority?: Task["priority"];
    assignees?: number[];
    completion_mode?: CompletionMode;
  }
) => api.patch<Task>(`/tasks/${id}/`, data);

export const setTaskStatus = (id: number, status: TaskStatus, userId?: number) =>
  api.post<Task>(`/tasks/${id}/set_status/`, { status, user: userId });

export const deleteTask = (id: number) => api.delete(`/tasks/${id}/`);