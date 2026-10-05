import api from "./client";

export interface Task {
  id: number;
  workspace: number;
  title: string;
  status: "TODO" | "IN_PROGRESS" | "DONE";
  priority: "LOW" | "MEDIUM" | "HIGH";
  due_date: string | null;
}

export const listTasks = (workspaceId: number) =>
  api.get<Task[]>("/tasks/", { params: { workspace: workspaceId } });