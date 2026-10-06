import api from "./client";

export interface Note {
  id: number;
  workspace: number;
  folder: number | null;
  title: string;
  content: string;
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

export const createNote = (data: { workspace: number; title: string; content: string }) =>
  api.post<Note>("/notes/", data);

export const updateNote = (id: number, data: { title?: string; content?: string }) =>
  api.patch<Note>(`/notes/${id}/`, data);

export const deleteNote = (id: number) => api.delete(`/notes/${id}/`);

export const getNoteHistory = (id: number) =>
  api.get<NoteVersion[]>(`/notes/${id}/history/`);

export const restoreNoteVersion = (id: number, versionId: number) =>
  api.post<Note>(`/notes/${id}/restore/`, { version_id: versionId });