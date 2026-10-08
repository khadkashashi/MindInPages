import api from "./client";

export type WorkspaceRole = "OWNER" | "ADMIN" | "EDITOR" | "VIEWER";

export interface Workspace {
  id: number;
  name: string;
  owner: number;
  role: WorkspaceRole;
  created_at: string;
}

export const listWorkspaces = () =>
  api.get<Workspace[]>("/workspaces/");

export const createWorkspace = (name: string) =>
  api.post<Workspace>("/workspaces/", { name });