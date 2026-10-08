import api from "./client";

export interface Deck {
  id: number;
  workspace: number;
  name: string;
  description: string;
}

export interface Flashcard {
  id: number;
  deck: number;
  front: string;
  back: string;
  next_review: string;
  repetitions: number;
}

export const listDecks = (workspaceId: number) =>
  api.get<Deck[]>("/flashcards/decks/", { params: { workspace: workspaceId } });

export const createDeck = (data: { workspace: number; name: string }) =>
  api.post<Deck>("/flashcards/decks/", data);

export const getDeck = (id: number) => api.get<Deck>(`/flashcards/decks/${id}/`);

export const listCards = (deckId: number) =>
  api.get<Flashcard[]>("/flashcards/cards/", { params: { deck: deckId } });

export const listDueCards = (deckId: number) =>
  api.get<Flashcard[]>("/flashcards/cards/due/", { params: { deck: deckId } });

export const createCard = (data: { deck: number; front: string; back: string }) =>
  api.post<Flashcard>("/flashcards/cards/", data);

export const deleteCard = (id: number) => api.delete(`/flashcards/cards/${id}/`);

export const reviewCard = (id: number, quality: number) =>
  api.post<Flashcard>(`/flashcards/cards/${id}/review/`, { quality });