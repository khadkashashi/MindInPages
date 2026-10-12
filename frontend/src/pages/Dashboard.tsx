import { useEffect, useState } from "react";
import { useWorkspace } from "../context/WorkspaceContext";
import { listNotes, type Note } from "../api/notes";
import { listTasks, type Task } from "../api/tasks";
import { createWorkspace } from "../api/workspaces";
import AppLayout from "../components/AppLayout";

export default function Dashboard() {
  const {
    workspaces,
    currentWorkspace,
    setCurrentWorkspace,
    loading,
    refresh,
  } = useWorkspace();
  const [notes, setNotes] = useState<Note[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newWorkspaceName, setNewWorkspaceName] = useState("");

  useEffect(() => {
    if (!currentWorkspace) return;
    listNotes(currentWorkspace.id).then((res) =>
      setNotes(res.data.slice(0, 5)),
    );
    listTasks(currentWorkspace.id).then((res) =>
      setTasks(res.data.slice(0, 5)),
    );
  }, [currentWorkspace]);

  const handleCreateWorkspace = async () => {
    if (!newWorkspaceName.trim()) return;
    await createWorkspace(newWorkspaceName.trim());
    setNewWorkspaceName("");
    refresh();
  };

  if (loading) {
    return (
      <AppLayout>
        <p className="text-[#6b5f50]">Loading...</p>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      {/* Workspace switcher */}
      <div className="flex flex-wrap items-center gap-3 mb-10">
        {workspaces.map((w) => (
          <button
            key={w.id}
            onClick={() => setCurrentWorkspace(w)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition ${
              currentWorkspace?.id === w.id
                ? "bg-[#3d342a] text-[#f5f1ea]"
                : "bg-white border border-[#e3dbcb] text-[#6b5f50] hover:bg-[#ece4d4]"
            }`}
          >
            {w.name}
            <span className="ml-2 text-xs opacity-70">{w.my_role}</span>
          </button>
        ))}
        <div className="flex items-center gap-2">
          <input
            value={newWorkspaceName}
            onChange={(e) => setNewWorkspaceName(e.target.value)}
            placeholder="New workspace name"
            className="rounded-full border border-[#e3dbcb] bg-white px-4 py-2 text-sm text-[#3d342a] focus:outline-none focus:ring-2 focus:ring-[#3d342a]/30"
          />
          <button
            onClick={handleCreateWorkspace}
            className="px-4 py-2 rounded-full text-sm font-medium bg-white border border-[#e3dbcb] text-[#3d342a] hover:bg-[#ece4d4]"
          >
            + Create
          </button>
        </div>
      </div>

      {!currentWorkspace ? (
        <p className="text-[#6b5f50]">
          Create a workspace above to get started.
        </p>
      ) : (
        <div className="grid md:grid-cols-2 gap-8">
          {/* Recent Notes */}
          <div className="bg-white/70 border border-[#e3dbcb] rounded-2xl p-6">
            <h2
              className="text-lg font-semibold text-[#3d342a] mb-4"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Recent Notes
            </h2>
            {notes.length === 0 ? (
              <p className="text-sm text-[#9c8a6f]">No notes yet.</p>
            ) : (
              <ul className="space-y-3">
                {notes.map((n) => (
                  <li
                    key={n.id}
                    className="border-b border-[#e3dbcb] pb-3 last:border-0"
                  >
                    <p className="font-medium text-[#3d342a]">{n.title}</p>
                    <p className="text-sm text-[#6b5f50] truncate">
                      {n.content}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Tasks */}
          <div className="bg-white/70 border border-[#e3dbcb] rounded-2xl p-6">
            <h2
              className="text-lg font-semibold text-[#3d342a] mb-4"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Tasks
            </h2>
            {tasks.length === 0 ? (
              <p className="text-sm text-[#9c8a6f]">No tasks yet.</p>
            ) : (
              <ul className="space-y-3">
                {tasks.map((t) => (
                  <li
                    key={t.id}
                    className="flex items-center justify-between border-b border-[#e3dbcb] pb-3 last:border-0"
                  >
                    <span className="font-medium text-[#3d342a]">
                      {t.title}
                    </span>
                    <span
                      className={`text-xs px-2 py-1 rounded-full font-medium ${
                        t.status === "DONE"
                          ? "bg-green-100 text-green-700"
                          : t.status === "IN_PROGRESS"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-[#ece4d4] text-[#6b5f50]"
                      }`}
                    >
                      {t.status.replace("_", " ")}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </AppLayout>
  );
}
