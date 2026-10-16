import { useEffect, useState } from "react";
import { useWorkspace } from "../context/WorkspaceContext";
import { listTasks, createTask, updateTask, deleteTask, type Task } from "../api/tasks";
import AppLayout from "../components/AppLayout";

const statusLabels: Record<Task["status"], string> = {
  TODO: "To Do",
  IN_PROGRESS: "In Progress",
  DONE: "Done",
};

const priorityColors: Record<Task["priority"], string> = {
  LOW: "bg-[#ece4d4] text-[#6b5f50]",
  MEDIUM: "bg-amber-100 text-amber-700",
  HIGH: "bg-red-100 text-red-700",
};

export default function Tasks() {
  const { currentWorkspace, canEdit } = useWorkspace();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState<Task["status"] | "ALL">("ALL");
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<Task["priority"]>("MEDIUM");
  const [creating, setCreating] = useState(false);
  const [assignee, setAssignee] = useState<number | "">("");
  const [mineOnly, setMineOnly] = useState(false);

  const refresh = () => {
    if (!currentWorkspace) return;
    listTasks(currentWorkspace.id, filter === "ALL" ? undefined : filter, mineOnly).then((res) =>
      setTasks(res.data)
    );
  };

  useEffect(() => {
    refresh();
  }, [currentWorkspace, filter, mineOnly]);

  const handleCreate = async () => {
    if (!title.trim() || !currentWorkspace) return;
    setCreating(true);
    try {
      await createTask({
        workspace: currentWorkspace.id,
        title: title.trim(),
        priority,
        assigned_to: assignee === "" ? null : assignee,
      });
      setTitle("");
      setAssignee("");
      refresh();
    } finally {
      setCreating(false);
    }
  };

  const cycleStatus = async (task: Task) => {
    const next: Record<Task["status"], Task["status"]> = {
      TODO: "IN_PROGRESS",
      IN_PROGRESS: "DONE",
      DONE: "TODO",
    };
    await updateTask(task.id, { status: next[task.status] });
    refresh();
  };

  const handleDelete = async (id: number) => {
    await deleteTask(id);
    refresh();
  };

  return (
    <AppLayout>
      <div className="flex items-center justify-between mb-6">
        <h1
          className="text-3xl font-semibold text-[#3d342a]"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          Tasks
        </h1>
      </div>

      {/* New task row (Only visible for users who can write/edit) */}
      {canEdit && (
        <div className="flex flex-wrap items-center gap-2 mb-6">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            placeholder="New task title"
            className="flex-1 min-w-[200px] rounded-full border border-[#e3dbcb] bg-white px-4 py-2 text-sm text-[#3d342a] focus:outline-none focus:ring-2 focus:ring-[#3d342a]/30"
          />
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as Task["priority"])}
            className="rounded-full border border-[#e3dbcb] bg-white px-4 py-2 text-sm text-[#3d342a] focus:outline-none"
          >
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
          </select>
          <select
            value={assignee}
            onChange={(e) => setAssignee(e.target.value ? Number(e.target.value) : "")}
            className="rounded-full border border-[#e3dbcb] bg-white px-4 py-2 text-sm text-[#3d342a] focus:outline-none"
          >
            <option value="">Unassigned</option>
            {currentWorkspace?.members.map((m) => (
              <option key={m.user} value={m.user}>
                {m.email}
              </option>
            ))}
          </select>
          <button
            onClick={handleCreate}
            disabled={creating}
            className="px-4 py-2 rounded-full text-sm font-medium bg-[#3d342a] text-[#f5f1ea] hover:bg-[#2a2319] disabled:opacity-60"
          >
            + Add Task
          </button>
        </div>
      )}

      {/* Filters and "My tasks" toggle */}
      <div className="flex items-center justify-between gap-2 mb-8 flex-wrap">
        <div className="flex gap-2">
          {(["ALL", "TODO", "IN_PROGRESS", "DONE"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
                filter === s
                  ? "bg-[#3d342a] text-[#f5f1ea]"
                  : "bg-white border border-[#e3dbcb] text-[#6b5f50] hover:bg-[#ece4d4]"
              }`}
            >
              {s === "ALL" ? "All" : statusLabels[s]}
            </button>
          ))}
        </div>
        <button
          onClick={() => setMineOnly(!mineOnly)}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
            mineOnly
              ? "bg-[#3d342a] text-[#f5f1ea]"
              : "bg-white border border-[#e3dbcb] text-[#6b5f50] hover:bg-[#ece4d4]"
          }`}
        >
          My tasks
        </button>
      </div>

      {tasks.length === 0 ? (
        <p className="text-[#9c8a6f]">No tasks here.</p>
      ) : (
        <ul className="space-y-3">
          {tasks.map((t) => (
            <li
              key={t.id}
              className="flex items-center justify-between bg-white/70 border border-[#e3dbcb] rounded-xl px-5 py-4"
            >
              <div className="flex items-center gap-3">
                <button
                  onClick={() => cycleStatus(t)}
                  disabled={!t.can_change_status}
                  className={`w-5 h-5 rounded-full border-2 flex-shrink-0 transition ${
                    t.status === "DONE"
                      ? "bg-[#3d342a] border-[#3d342a]"
                      : "border-[#9c8a6f]"
                  } ${!t.can_change_status ? "opacity-40 cursor-not-allowed" : "hover:scale-105"}`}
                  title={t.can_change_status ? "Click to change status" : "You cannot modify this task"}
                />
                <div>
                  <p
                    className={`font-medium text-[#3d342a] ${
                      t.status === "DONE" ? "line-through text-[#9c8a6f]" : ""
                    }`}
                  >
                    {t.title}
                  </p>
                  {t.due_date && (
                    <p className="text-xs text-[#9c8a6f]">
                      Due {new Date(t.due_date).toLocaleDateString()}
                    </p>
                  )}
                  {t.assigned_to_email && (
                    <p className="text-xs text-[#9c8a6f]">Assigned to {t.assigned_to_email}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`text-xs px-2 py-1 rounded-full font-medium ${priorityColors[t.priority]}`}
                >
                  {t.priority}
                </span>
                <span className="text-xs px-2 py-1 rounded-full font-medium bg-[#ece4d4] text-[#6b5f50]">
                  {statusLabels[t.status]}
                </span>
                {t.can_delete && (
                  <button
                    onClick={() => handleDelete(t.id)}
                    className="text-xs text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </AppLayout>
  );
}