import api from "./client";

export type Visibility = "PRIVATE" | "SHARED";

export interface Note {
  id: number;
  workspace: number;
  folder: number | null;
  title: string;
  content: string;
  visibility: Visibility;
  author: number | null;
  author_email?: string;
  is_author: boolean;
  can_edit: boolean;
  can_delete: boolean;
  created_at: string;
  updated_at: string;
}

export interface NoteVersion {
  id: number;
  title: string;
  content: string;
  edited_by: number;
  created_at: string;
}

export const listNotes = (workspaceId: number) =>
  api.get<Note[]>("/notes/", { params: { workspace: workspaceId } });

export const getNote = (id: number) => api.get<Note>(`/notes/${id}/`);

export const getNoteHistory = (id: number) =>
  api.get<NoteVersion[]>(`/notes/${id}/history/`);

// Mutations (Create, Update, Delete, Restore)
export const createNote = (data: {
  workspace: number;
  title: string;
  content: string;
  visibility?: Visibility;
  folder?: number | null;
}) => api.post<Note>("/notes/", data);

export const updateNote = (
  id: number,
  data: {
    title?: string;
    content?: string;
    visibility?: Visibility;
    folder?: number | null;
  }
) => api.patch<Note>(`/notes/${id}/`, data);

export const deleteNote = (id: number) => api.delete(`/notes/${id}/`);

export const restoreNoteVersion = (id: number, versionId: number) =>
  api.post<Note>(`/notes/${id}/restore/`, { version_id: versionId });