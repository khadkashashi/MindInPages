import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useWorkspace } from "../context/WorkspaceContext";
import { listDecks, createDeck, type Deck } from "../api/flashcards";
import { getStreak } from "../api/study";
import AppLayout from "../components/AppLayout";

export default function Flashcards() {
  const { currentWorkspace } = useWorkspace();
  const [decks, setDecks] = useState<Deck[]>([]);
  const [name, setName] = useState("");
  const [streak, setStreak] = useState(0);

  const refresh = () => {
    if (!currentWorkspace) return;
    listDecks(currentWorkspace.id).then((res) => setDecks(res.data));
  };

  useEffect(refresh, [currentWorkspace]);
  useEffect(() => {
    getStreak().then((res) => setStreak(res.data.current_streak));
  }, []);

  const handleCreate = async () => {
    if (!name.trim() || !currentWorkspace) return;
    await createDeck({ workspace: currentWorkspace.id, name: name.trim() });
    setName("");
    refresh();
  };

  return (
    <AppLayout>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h1
            className="text-3xl font-semibold text-[#3d342a]"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Flashcards
          </h1>
          <p className="text-sm text-[#9c8a6f] mt-1">
            🔥 {streak}-day study streak
          </p>
        </div>
        <div className="flex items-center gap-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            placeholder="New deck name"
            className="rounded-full border border-[#e3dbcb] bg-white px-4 py-2 text-sm text-[#3d342a] focus:outline-none focus:ring-2 focus:ring-[#3d342a]/30"
          />
          <button
            onClick={handleCreate}
            className="px-4 py-2 rounded-full text-sm font-medium bg-[#3d342a] text-[#f5f1ea] hover:bg-[#2a2319]"
          >
            + New Deck
          </button>
        </div>
      </div>

      {decks.length === 0 ? (
        <p className="text-[#9c8a6f]">No decks yet. Create one above.</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {decks.map((d) => (
            <Link
              key={d.id}
              to={`/flashcards/${d.id}`}
              className="bg-white/70 border border-[#e3dbcb] rounded-2xl p-6 hover:shadow-md transition"
            >
              <h3
                className="text-lg font-semibold text-[#3d342a]"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                {d.name}
              </h3>
              <p className="text-sm text-[#6b5f50] mt-1">
                {d.description || "Open to add cards and study."}
              </p>
            </Link>
          ))}
        </div>
      )}
    </AppLayout>
  );
}