import api from "./client";

export type Role = "OWNER" | "ADMIN" | "EDITOR" | "VIEWER";

export interface Member {
  id: number;
  user: number;
  email: string;
  role: Role;
  joined_at: string;
}

export interface Workspace {
  id: number;
  name: string;
  owner: number;
  created_at: string;
  my_role: Role | null;
  members: Member[];
}

export const listWorkspaces = () => api.get<Workspace[]>("/workspaces/");

export const createWorkspace = (name: string) =>
  api.post<Workspace>("/workspaces/", { name });

export const inviteMember = (workspaceId: number, email: string, role: Role) =>
  api.post<Member>(`/workspaces/${workspaceId}/invite_member/`, { email, role });