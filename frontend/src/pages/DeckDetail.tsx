import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {getDeck, listCards, createCard, deleteCard, type Deck, type Flashcard,} from "../api/flashcards";
import AppLayout from "../components/AppLayout";

export default function DeckDetail() {
  const { deckId } = useParams();
  const [deck, setDeck] = useState<Deck | null>(null);
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [front, setFront] = useState("");
  const [back, setBack] = useState("");

  const refresh = () => {
    if (!deckId) return;
    listCards(Number(deckId)).then((res) => setCards(res.data));
  };

  useEffect(() => {
    if (!deckId) return;
    getDeck(Number(deckId)).then((res) => setDeck(res.data));
    refresh();
  }, [deckId]);

  const handleAdd = async () => {
    if (!front.trim() || !back.trim() || !deckId) return;
    await createCard({ deck: Number(deckId), front: front.trim(), back: back.trim() });
    setFront("");
    setBack("");
    refresh();
  };

  const handleDelete = async (id: number) => {
    await deleteCard(id);
    refresh();
  };

  const dueCount = cards.filter((c) => new Date(c.next_review) <= new Date()).length;

  return (
    <AppLayout>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <Link to="/flashcards" className="text-sm text-[#9c8a6f] hover:text-[#3d342a]">
            ← All decks
          </Link>
          <h1
            className="text-3xl font-semibold text-[#3d342a] mt-1"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            {deck?.name}
          </h1>
          <p className="text-sm text-[#9c8a6f] mt-1">
            {cards.length} cards · {dueCount} due now
          </p>
        </div>
        <Link
          to={`/flashcards/${deckId}/study`}
          className="px-6 py-3 rounded-full text-sm font-medium bg-[#3d342a] text-[#f5f1ea] hover:bg-[#2a2319]"
        >
          Study ({dueCount})
        </Link>
      </div>

      <div className="bg-white/70 border border-[#e3dbcb] rounded-2xl p-6 mb-8">
        <h2 className="font-semibold text-[#3d342a] mb-3">Add a card</h2>
        <div className="grid md:grid-cols-2 gap-3">
          <textarea
            value={front}
            onChange={(e) => setFront(e.target.value)}
            placeholder="Front (question)"
            rows={3}
            className="rounded-xl border border-[#e3dbcb] bg-white p-3 text-sm text-[#3d342a] focus:outline-none focus:ring-2 focus:ring-[#3d342a]/30"
          />
          <textarea
            value={back}
            onChange={(e) => setBack(e.target.value)}
            placeholder="Back (answer)"
            rows={3}
            className="rounded-xl border border-[#e3dbcb] bg-white p-3 text-sm text-[#3d342a] focus:outline-none focus:ring-2 focus:ring-[#3d342a]/30"
          />
        </div>
        <button
          onClick={handleAdd}
          className="mt-3 px-5 py-2 rounded-full text-sm font-medium bg-[#3d342a] text-[#f5f1ea] hover:bg-[#2a2319]"
        >
          + Add Card
        </button>
      </div>

      {cards.length === 0 ? (
        <p className="text-[#9c8a6f]">No cards yet.</p>
      ) : (
        <ul className="space-y-3">
          {cards.map((c) => (
            <li
              key={c.id}
              className="flex items-start justify-between gap-4 bg-white/70 border border-[#e3dbcb] rounded-xl px-5 py-4"
            >
              <div>
                <p className="font-medium text-[#3d342a]">{c.front}</p>
                <p className="text-sm text-[#6b5f50] mt-1">{c.back}</p>
              </div>
              <button
                onClick={() => handleDelete(c.id)}
                className="text-xs text-red-600 hover:underline flex-shrink-0"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </AppLayout>
  );
}