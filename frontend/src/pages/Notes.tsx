import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useWorkspace } from "../context/WorkspaceContext";
import { listNotes, createNote,type Note } from "../api/notes";
import AppLayout from "../components/AppLayout.tsx";

export default function Notes() {
  const { currentWorkspace } = useWorkspace();
  const [notes, setNotes] = useState<Note[]>([]);
  const [title, setTitle] = useState("");
  const [creating, setCreating] = useState(false);

  const refresh = () => {
    if (!currentWorkspace) return;
    listNotes(currentWorkspace.id).then((res) => setNotes(res.data));
  };

  useEffect(refresh, [currentWorkspace]);

  const handleCreate = async () => {
    if (!title.trim() || !currentWorkspace) return;
    setCreating(true);
    try {
      await createNote({ workspace: currentWorkspace.id, title: title.trim(), content: "" });
      setTitle("");
      refresh();
    } finally {
      setCreating(false);
    }
  };

  return (
    <AppLayout>
      <div className="flex items-center justify-between mb-8">
        <h1
          className="text-3xl font-semibold text-[#3d342a]"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          Notes
        </h1>
        <div className="flex items-center gap-2">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            placeholder="New note title"
            className="rounded-full border border-[#e3dbcb] bg-white px-4 py-2 text-sm text-[#3d342a] focus:outline-none focus:ring-2 focus:ring-[#3d342a]/30"
          />
          <button
            onClick={handleCreate}
            disabled={creating}
            className="px-4 py-2 rounded-full text-sm font-medium bg-[#3d342a] text-[#f5f1ea] hover:bg-[#2a2319] disabled:opacity-60"
          >
            + New Note
          </button>
        </div>
      </div>

      {notes.length === 0 ? (
        <p className="text-[#9c8a6f]">No notes yet. Create one above.</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {notes.map((n) => (
            <Link
              key={n.id}
              to={`/notes/${n.id}`}
              className="bg-white/70 border border-[#e3dbcb] rounded-2xl p-5 hover:shadow-md transition"
            >
              <h3 className="font-semibold text-[#3d342a] mb-2 truncate">{n.title}</h3>
              <p className="text-sm text-[#6b5f50] line-clamp-3">
                {n.content || "No content yet."}
              </p>
              <p className="text-xs text-[#9c8a6f] mt-3">
                Updated {new Date(n.updated_at).toLocaleDateString()}
              </p>
            </Link>
          ))}
        </div>
      )}
    </AppLayout>
  );
}