export type WorkspaceRole = "OWNER" | "ADMIN" | "EDITOR" | "VIEWER";
export interface WorkspaceMember {
  user: number;
  email: string;
  role: "OWNER" | "ADMIN" | "EDITOR" | "VIEWER";
  my_role?: string;
}

export interface Workspace {
  id: number;
  name: string;
  owner: number;
  role?: string;
  my_role?: string;
  members: WorkspaceMember[]; // <-- Add this line
}