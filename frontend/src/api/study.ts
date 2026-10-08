import api from "./client";

export interface StudySession {
  id: number;
  cards_reviewed: number;
  cards_correct: number;
}

export const startSession = (workspace: number, deck: number) =>
  api.post<StudySession>("/study/", { workspace, deck });

export const endSession = (id: number, cards_reviewed: number, cards_correct: number) =>
  api.post<StudySession>(`/study/${id}/end/`, { cards_reviewed, cards_correct });

export const getStreak = () =>
  api.get<{ current_streak: number }>("/study/streak/");