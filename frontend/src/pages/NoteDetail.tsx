import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {getNote, updateNote, deleteNote, getNoteHistory, restoreNoteVersion,type Note, type NoteVersion} from "../api/notes";
import AppLayout from "../components/AppLayout";

export default function NoteDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [note, setNote] = useState<Note | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [history, setHistory] = useState<NoteVersion[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    if (!id) return;
    getNote(Number(id)).then((res) => {
      setNote(res.data);
      setTitle(res.data.title);
      setContent(res.data.content);
    });
  }, [id]);

  const handleSave = async () => {
    if (!id) return;
    setSaving(true);
    try {
      const res = await updateNote(Number(id), { title, content });
      setNote(res.data);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!id || !confirm("Delete this note?")) return;
    await deleteNote(Number(id));
    navigate("/notes");
  };

  const loadHistory = async () => {
    if (!id) return;
    const res = await getNoteHistory(Number(id));
    setHistory(res.data);
    setShowHistory(true);
  };

  const handleRestore = async (versionId: number) => {
    if (!id) return;
    const res = await restoreNoteVersion(Number(id), versionId);
    setNote(res.data);
    setTitle(res.data.title);
    setContent(res.data.content);
    setShowHistory(false);
  };

  if (!note) {
    return (
      <AppLayout>
        <p className="text-[#9c8a6f]">Loading...</p>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full text-3xl font-semibold text-[#3d342a] bg-transparent border-none focus:outline-none mb-4"
          style={{ fontFamily: "'Playfair Display', serif" }}
        />
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={14}
          className="w-full rounded-2xl border border-[#e3dbcb] bg-white/70 p-5 text-[#3d342a] leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#3d342a]/30"
        />
        <div className="flex items-center gap-3 mt-5">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2.5 rounded-full text-sm font-medium bg-[#3d342a] text-[#f5f1ea] hover:bg-[#2a2319] disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save"}
          </button>
          <button
            onClick={loadHistory}
            className="px-5 py-2.5 rounded-full text-sm font-medium border border-[#e3dbcb] text-[#6b5f50] hover:bg-[#ece4d4]"
          >
            History
          </button>
          <button
            onClick={handleDelete}
            className="px-5 py-2.5 rounded-full text-sm font-medium text-red-600 hover:bg-red-50"
          >
            Delete
          </button>
        </div>

        {showHistory && (
          <div className="mt-8 bg-white/70 border border-[#e3dbcb] rounded-2xl p-6">
            <h3 className="font-semibold text-[#3d342a] mb-4">Version History</h3>
            {history.length === 0 ? (
              <p className="text-sm text-[#9c8a6f]">No earlier versions yet.</p>
            ) : (
              <ul className="space-y-3">
                {history.map((v) => (
                  <li
                    key={v.id}
                    className="flex items-center justify-between border-b border-[#e3dbcb] pb-3 last:border-0"
                  >
                    <div>
                      <p className="font-medium text-[#3d342a]">{v.title}</p>
                      <p className="text-xs text-[#9c8a6f]">
                        {new Date(v.created_at).toLocaleString()}
                      </p>
                    </div>
                    <button
                      onClick={() => handleRestore(v.id)}
                      className="text-sm font-medium text-[#3d342a] hover:underline"
                    >
                      Restore
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
}