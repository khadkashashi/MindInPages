import api from "./client";

export interface Workspace {
  id: number;
  name: string;
  owner: number;
  created_at: string;
}

export const listWorkspaces = () => api.get<Workspace[]>("/workspaces/");
export const createWorkspace = (name: string) =>
  api.post<Workspace>("/workspaces/", { name });