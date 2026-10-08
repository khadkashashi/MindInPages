import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getNote, updateNote, deleteNote, getNoteHistory, restoreNoteVersion,type Note,type NoteVersion, type Visibility} from "../api/notes";
import { useWorkspace } from "../context/WorkspaceContext";
import { canEditRole } from "../utils/roles.ts";
import AppLayout from "../components/AppLayout";

export default function NoteDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { workspaces } = useWorkspace();
  const [note, setNote] = useState<Note | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [visibility, setVisibility] = useState<Visibility>("PRIVATE");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [history, setHistory] = useState<NoteVersion[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  const load = (n: Note) => {
    setNote(n);
    setTitle(n.title);
    setContent(n.content);
    setVisibility(n.visibility);
  };

  useEffect(() => {
    if (!id) return;
    getNote(Number(id))
      .then((res) => load(res.data))
      .catch(() => setError("This note could not be found."));
  }, [id]);

  const handleSave = async () => {
    if (!id || !note) return;
    setSaving(true);
    setError("");
    try {
      const payload: { title: string; content: string; visibility?: Visibility } = { title, content };
      if (note.is_author && visibility !== note.visibility) payload.visibility = visibility;
      const res = await updateNote(Number(id), payload);
      load(res.data);
    } catch (err: any) {
      setError(err?.response?.data?.detail ?? "Could not save this note.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!id || !confirm("Delete this note?")) return;
    try {
      await deleteNote(Number(id));
      navigate("/notes");
    } catch (err: any) {
      setError(err?.response?.data?.detail ?? "Could not delete this note.");
    }
  };

  const loadHistory = async () => {
    if (!id) return;
    const res = await getNoteHistory(Number(id));
    setHistory(res.data);
    setShowHistory(true);
  };

  const handleRestore = async (versionId: number) => {
    if (!id) return;
    try {
      const res = await restoreNoteVersion(Number(id), versionId);
      load(res.data);
      setShowHistory(false);
    } catch (err: any) {
      setError(err?.response?.data?.detail ?? "Could not restore this version.");
    }
  };

  if (!note) {
    return (
      <AppLayout>
        <p className="text-[#9c8a6f]">{error || "Loading..."}</p>
      </AppLayout>
    );
  }

  const readOnly = !note.can_edit;
  const canShare = canEditRole(workspaces.find((w) => w.id === note.workspace)?.role);
  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto">
        <div className="flex flex-wrap items-center gap-3 mb-3 text-sm">
          <span
            className={`px-3 py-1 rounded-full font-medium ${
              note.visibility === "SHARED" ? "bg-green-100 text-green-700" : "bg-[#ece4d4] text-[#6b5f50]"
            }`}
          >
            {note.visibility === "SHARED" ? "Shared" : "Private"}
          </span>
          {!note.is_author && note.author_email && (
            <span className="text-[#9c8a6f]">Shared by {note.author_email}</span>
          )}
          {note.is_author && (
            <select
              value={visibility}
              onChange={(e) => setVisibility(e.target.value as Visibility)}
              className="rounded-full border border-[#e3dbcb] bg-white px-3 py-1 text-sm text-[#3d342a]"
            >
              <option value="PRIVATE">Private (only me)</option>
              {(canShare || note.visibility === "SHARED") && (
                <option value="SHARED">Shared with workspace</option>
              )}
            </select>
          )}
        </div>

        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          readOnly={readOnly}
          className="w-full text-3xl font-semibold text-[#3d342a] bg-transparent border-none focus:outline-none mb-4"
          style={{ fontFamily: "'Playfair Display', serif" }}
        />
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          readOnly={readOnly}
          rows={14}
          className="w-full rounded-2xl border border-[#e3dbcb] bg-white/70 p-5 text-[#3d342a] leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#3d342a]/30"
        />
        {error && <p className="text-sm text-red-600 mt-3">{error}</p>}

        <div className="flex items-center gap-3 mt-5">
          {!readOnly && (
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-5 py-2.5 rounded-full text-sm font-medium bg-[#3d342a] text-[#f5f1ea] hover:bg-[#2a2319] disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save"}
            </button>
          )}
          <button
            onClick={loadHistory}
            className="px-5 py-2.5 rounded-full text-sm font-medium border border-[#e3dbcb] text-[#6b5f50] hover:bg-[#ece4d4]"
          >
            History
          </button>
          {note.can_delete && (
            <button
              onClick={handleDelete}
              className="px-5 py-2.5 rounded-full text-sm font-medium text-red-600 hover:bg-red-50"
            >
              Delete
            </button>
          )}
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
                      <p className="text-xs text-[#9c8a6f]">{new Date(v.created_at).toLocaleString()}</p>
                    </div>
                    {!readOnly && (
                      <button
                        onClick={() => handleRestore(v.id)}
                        className="text-sm font-medium text-[#3d342a] hover:underline"
                      >
                        Restore
                      </button>
                    )}
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