import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useWorkspace } from "../context/WorkspaceContext";
import { listDueCards, reviewCard, type Flashcard } from "../api/flashcards";
import { startSession, endSession } from "../api/study";
import AppLayout from "../components/AppLayout";

const ratings = [
  { label: "Again", quality: 1 },
  { label: "Hard", quality: 3 },
  { label: "Good", quality: 4 },
  { label: "Easy", quality: 5 },
];

export default function Study() {
  const { deckId } = useParams();
  const { currentWorkspace } = useWorkspace();
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [reviewed, setReviewed] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    if (!deckId) return;
    listDueCards(Number(deckId)).then((res) => {
      setCards(res.data);
      setLoaded(true);
    });
  }, [deckId]);

  const handleStart = async () => {
    if (!currentWorkspace || !deckId) return;
    const res = await startSession(currentWorkspace.id, Number(deckId));
    setSessionId(res.data.id);
  };

  const handleRate = async (quality: number) => {
    const card = cards[index];
    await reviewCard(card.id, quality);
    const newReviewed = reviewed + 1;
    const newCorrect = correct + (quality >= 3 ? 1 : 0);
    setReviewed(newReviewed);
    setCorrect(newCorrect);
    setFlipped(false);

    if (index + 1 >= cards.length) {
      if (sessionId) await endSession(sessionId, newReviewed, newCorrect);
      setFinished(true);
    } else {
      setIndex(index + 1);
    }
  };

  const card = cards[index];

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto">
        <Link to={`/flashcards/${deckId}`} className="text-sm text-[#9c8a6f] hover:text-[#3d342a]">
          ← Back to deck
        </Link>

        {!loaded ? (
          <p className="text-[#9c8a6f] mt-8">Loading...</p>
        ) : cards.length === 0 ? (
          <div className="text-center mt-16">
            <h2
              className="text-2xl font-semibold text-[#3d342a]"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              All caught up 🎉
            </h2>
            <p className="text-[#6b5f50] mt-2">No cards are due in this deck right now.</p>
          </div>
        ) : finished ? (
          <div className="text-center mt-16">
            <h2
              className="text-2xl font-semibold text-[#3d342a]"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Session complete
            </h2>
            <p className="text-[#6b5f50] mt-2">
              You reviewed {reviewed} cards and got {correct} right.
            </p>
            <Link
              to="/flashcards"
              className="inline-block mt-6 px-6 py-3 rounded-full text-sm font-medium bg-[#3d342a] text-[#f5f1ea] hover:bg-[#2a2319]"
            >
              Back to decks
            </Link>
          </div>
        ) : !sessionId ? (
          <div className="text-center mt-16">
            <p className="text-[#6b5f50] mb-6">{cards.length} cards are due.</p>
            <button
              onClick={handleStart}
              className="px-6 py-3 rounded-full text-sm font-medium bg-[#3d342a] text-[#f5f1ea] hover:bg-[#2a2319]"
            >
              Start studying
            </button>
          </div>
        ) : (
          <div className="mt-8">
            <p className="text-sm text-[#9c8a6f] text-center mb-4">
              Card {index + 1} of {cards.length}
            </p>
            <div
              onClick={() => setFlipped(true)}
              className="min-h-[240px] flex items-center justify-center text-center bg-white/70 border border-[#e3dbcb] rounded-2xl shadow-md p-10 cursor-pointer"
            >
              <p
                className="text-2xl text-[#3d342a]"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                {flipped ? card.back : card.front}
              </p>
            </div>

            {!flipped ? (
              <p className="text-center text-sm text-[#9c8a6f] mt-5">
                Click the card to reveal the answer
              </p>
            ) : (
              <div className="grid grid-cols-4 gap-3 mt-6">
                {ratings.map((r) => (
                  <button
                    key={r.label}
                    onClick={() => handleRate(r.quality)}
                    className="py-3 rounded-full text-sm font-medium border border-[#e3dbcb] bg-white text-[#3d342a] hover:bg-[#3d342a] hover:text-[#f5f1ea] transition"
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
}