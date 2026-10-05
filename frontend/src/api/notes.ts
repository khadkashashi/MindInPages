import api from "./client";

export interface Note {
  id: number;
  workspace: number;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export const listNotes = (workspaceId: number) =>
  api.get<Note[]>("/notes/", { params: { workspace: workspaceId } });