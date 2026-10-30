import { useEffect, useState } from "react";
import { useWorkspace } from "../context/WorkspaceContext";
import {
  listTasks, createTask, updateTask, deleteTask, setTaskStatus,
  type CompletionMode, type Task, type TaskStatus,
} from "../api/tasks";
import { apiError } from "../utils/errors";
import AppLayout from "../components/AppLayout";
import AssigneePicker from "../components/AssigneePicker";

const statusLabels: Record<TaskStatus, string> = {
  TODO: "To Do",
  IN_PROGRESS: "In Progress",
  DONE: "Done",
};

const statusDot: Record<TaskStatus, string> = {
  TODO: "bg-[#c9bba3]",
  IN_PROGRESS: "bg-amber-400",
  DONE: "bg-green-500",
};

const priorityColors: Record<Task["priority"], string> = {
  LOW: "bg-[#ece4d4] text-[#6b5f50]",
  MEDIUM: "bg-amber-100 text-amber-700",
  HIGH: "bg-red-100 text-red-700",
};

const nextStatus: Record<TaskStatus, TaskStatus> = {
  TODO: "IN_PROGRESS",
  IN_PROGRESS: "DONE",
  DONE: "TODO",
};

const modeLabels: Record<CompletionMode, string> = {
  INDIVIDUAL: "Each person completes their own",
  SHARED: "Group: one result for everyone",
};

export default function Tasks() {
  const { currentWorkspace, canEdit } = useWorkspace();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState<TaskStatus | "ALL">("ALL");
  const [mineOnly, setMineOnly] = useState(false);
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<Task["priority"]>("MEDIUM");
  const [mode, setMode] = useState<CompletionMode>("INDIVIDUAL");
  const [newAssignees, setNewAssignees] = useState<number[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  const members = currentWorkspace?.members ?? [];

  const refresh = () => {
    if (!currentWorkspace) return;
    listTasks(currentWorkspace.id, filter === "ALL" ? undefined : filter, mineOnly)
      .then((res) => setTasks(res.data))
      .catch((err) => setError(apiError(err, "Could not load tasks.")));
  };

  useEffect(refresh, [currentWorkspace, filter, mineOnly]);

  const guard = async (action: () => Promise<unknown>) => {
    setError("");
    try {
      await action();
      refresh();
    } catch (err) {
      setError(apiError(err));
    }
  };

  const handleCreate = async () => {
    if (!title.trim() || !currentWorkspace || creating) return;
    setCreating(true);
    await guard(async () => {
      await createTask({
        workspace: currentWorkspace.id,
        title: title.trim(),
        priority,
        completion_mode: mode,
        assignees: newAssignees,
      });
      setTitle("");
      setNewAssignees([]);
    });
    setCreating(false);
  };

  return (
    <AppLayout>
      <h1
        className="text-3xl font-semibold text-[#3d342a] mb-6"
        style={{ fontFamily: "'Playfair Display', serif" }}
      >
        Tasks
      </h1>

      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

      {canEdit && (
        <div className="bg-white/70 border border-[#e3dbcb] rounded-2xl p-5 mb-6">
          <div className="flex flex-wrap items-center gap-2">
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
              value={mode}
              onChange={(e) => setMode(e.target.value as CompletionMode)}
              className="rounded-full border border-[#e3dbcb] bg-white px-4 py-2 text-sm text-[#3d342a] focus:outline-none"
            >
              <option value="INDIVIDUAL">{modeLabels.INDIVIDUAL}</option>
              <option value="SHARED">{modeLabels.SHARED}</option>
            </select>
            <button
              onClick={handleCreate}
              disabled={creating}
              className="px-4 py-2 rounded-full text-sm font-medium bg-[#3d342a] text-[#f5f1ea] hover:bg-[#2a2319] disabled:opacity-60"
            >
              + Add Task
            </button>
          </div>
          <p className="text-xs text-[#9c8a6f] mt-4 mb-2">Assign to (pick one or more)</p>
          <AssigneePicker members={members} selected={newAssignees} onChange={setNewAssignees} />
        </div>
      )}

      <div className="flex flex-wrap gap-2 mb-8">
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
          {tasks.map((t) => {
            const individual = t.completion_mode === "INDIVIDUAL";
            const mine = t.assignee_details.find((a) => a.is_me);
            // an assignee's circle shows their own status; everyone else sees the overall one
            const circleStatus: TaskStatus = individual && mine ? mine.status : t.status;
            const circleEnabled = individual ? !!mine : t.can_change_status;
            const badge =
              individual && t.progress_summary
                ? `${t.progress_summary.done}/${t.progress_summary.total} done`
                : statusLabels[t.status];

            return (
              <li key={t.id} className="bg-white/70 border border-[#e3dbcb] rounded-xl px-5 py-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => guard(() => setTaskStatus(t.id, nextStatus[circleStatus]))}
                      disabled={!circleEnabled}
                      title={circleEnabled ? "Click to change status" : "Only assignees can change this"}
                      className={`w-5 h-5 rounded-full border-2 flex-shrink-0 disabled:opacity-40 ${
                        circleStatus === "DONE"
                          ? "bg-[#3d342a] border-[#3d342a]"
                          : circleStatus === "IN_PROGRESS"
                          ? "bg-amber-300 border-amber-400"
                          : "border-[#9c8a6f]"
                      }`}
                    />
                    <div>
                      <p
                        className={`font-medium text-[#3d342a] ${
                          t.status === "DONE" ? "line-through text-[#9c8a6f]" : ""
                        }`}
                      >
                        {t.title}
                      </p>
                      <p className="text-xs text-[#9c8a6f]">
                        {modeLabels[t.completion_mode]}
                        {t.due_date && ` · Due ${new Date(t.due_date).toLocaleDateString()}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${priorityColors[t.priority]}`}>
                      {t.priority}
                    </span>
                    <span className="text-xs px-2 py-1 rounded-full font-medium bg-[#ece4d4] text-[#6b5f50]">
                      {badge}
                    </span>
                    {canEdit && (
                      <button
                        onClick={() => setEditingId(editingId === t.id ? null : t.id)}
                        className="text-xs text-[#3d342a] hover:underline"
                      >
                        {editingId === t.id ? "Done" : "Assign"}
                      </button>
                    )}
                    {t.can_delete && (
                      <button
                        onClick={() => guard(() => deleteTask(t.id))}
                        className="text-xs text-red-600 hover:underline"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>

                {t.assignee_details.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3 pl-8">
                    {t.assignee_details.map((a) => {
                      const clickable = individual && (canEdit || a.is_me);
                      const chipClass =
                        "inline-flex items-center gap-2 text-xs px-2 py-1 rounded-full bg-[#f5f1ea] border border-[#e3dbcb] text-[#6b5f50]";
                      const content = (
                        <>
                          {individual && (
                            <span className={`inline-block w-2 h-2 rounded-full ${statusDot[a.status]}`} />
                          )}
                          {a.email}
                          {a.is_me && " (you)"}
                          {individual && ` · ${statusLabels[a.status]}`}
                        </>
                      );
                      return clickable ? (
                        <button
                          key={a.id}
                          title={`Click to change ${a.is_me ? "your" : a.email + "'s"} status`}
                          onClick={() =>
                            guard(() =>
                              setTaskStatus(t.id, nextStatus[a.status], a.is_me ? undefined : a.id)
                            )
                          }
                          className={`${chipClass} hover:bg-[#ece4d4]`}
                        >
                          {content}
                        </button>
                      ) : (
                        <span key={a.id} className={chipClass}>
                          {content}
                        </span>
                      );
                    })}
                  </div>
                )}

                {editingId === t.id && (
                  <div className="mt-3 pl-8 space-y-3">
                    <AssigneePicker
                      members={members}
                      selected={t.assignees}
                      onChange={(ids) => guard(() => updateTask(t.id, { assignees: ids }))}
                    />
                    <select
                      value={t.completion_mode}
                      onChange={(e) =>
                        guard(() => updateTask(t.id, { completion_mode: e.target.value as CompletionMode }))
                      }
                      className="rounded-full border border-[#e3dbcb] bg-white px-3 py-1 text-xs text-[#3d342a]"
                    >
                      <option value="INDIVIDUAL">{modeLabels.INDIVIDUAL}</option>
                      <option value="SHARED">{modeLabels.SHARED}</option>
                    </select>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </AppLayout>
  );
}