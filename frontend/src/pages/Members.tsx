import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useWorkspace } from "../context/WorkspaceContext";
import { canManageRole, normalizeRole } from "../utils/roles";
import { apiError } from "../utils/errors";
import {
  inviteMembers, changeMemberRole, removeMember, cancelInvitation, leaveWorkspace,
  type InviteResult, type Member, type Role,
} from "../api/workspaces";
import AppLayout from "../components/AppLayout";

const roleLabels: Record<Role, string> = {
  OWNER: "Owner",
  ADMIN: "Admin",
  EDITOR: "Teacher (can edit)",
  VIEWER: "Student (read and study)",
};

const resultStyles: Record<InviteResult["status"], { label: string; cls: string }> = {
  added: { label: "Added", cls: "bg-green-100 text-green-700" },
  invited: { label: "Invitation sent", cls: "bg-green-100 text-green-700" },
  already_member: { label: "Already a member", cls: "bg-amber-100 text-amber-700" },
  already_invited: { label: "Already invited", cls: "bg-amber-100 text-amber-700" },
  invalid: { label: "Invalid email", cls: "bg-red-100 text-red-700" },
  limit_reached: { label: "Plan limit reached", cls: "bg-red-100 text-red-700" },
};

export default function Members() {
  const { currentWorkspace, refresh } = useWorkspace();
  const navigate = useNavigate();
  const [emailsText, setEmailsText] = useState("");
  const [role, setRole] = useState<Role>("VIEWER");
  const [results, setResults] = useState<InviteResult[]>([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (!currentWorkspace) {
    return (
      <AppLayout>
        <p className="text-[#9c8a6f]">Create or select a workspace first.</p>
      </AppLayout>
    );
  }

  const ws = currentWorkspace;
  const myRole = normalizeRole(ws.my_role) as Role;
  const isOwner = myRole === "OWNER";
  const canManage = canManageRole(ws.my_role);
  const assignable: Role[] = isOwner ? ["ADMIN", "EDITOR", "VIEWER"] : ["EDITOR", "VIEWER"];
  const seatsUsed = ws.members.length + ws.pending_invitations.length;
  const canManageMember = (m: Member) =>
    canManage && !m.is_me && m.role !== "OWNER" && (isOwner || m.role !== "ADMIN");

  const run = async (action: () => Promise<unknown>) => {
    setError("");
    setBusy(true);
    try {
      await action();
      refresh();
    } catch (err) {
      setError(apiError(err));
    } finally {
      setBusy(false);
    }
  };

  const handleInvite = async (e: FormEvent) => {
    e.preventDefault();
    const emails = emailsText.split(/[\s,;]+/).map((s) => s.trim()).filter(Boolean);
    if (emails.length === 0) {
      setError("Enter at least one email address.");
      return;
    }
    setError("");
    setBusy(true);
    try {
      const res = await inviteMembers(ws.id, emails, role);
      setResults(res.data.results);
      // keep the addresses that didn't go through so they can be fixed or retried
      setEmailsText(
        res.data.results
          .filter((r) => r.status === "invalid" || r.status === "limit_reached")
          .map((r) => r.email)
          .join("\n")
      );
      refresh();
    } catch (err) {
      setError(apiError(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <AppLayout>
      <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
        <div>
          <h1
            className="text-3xl font-semibold text-[#3d342a] mb-1"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Members
          </h1>
          <p className="text-sm text-[#9c8a6f]">
            {ws.name} · you are {roleLabels[myRole] ?? "a member"} · {seatsUsed}
            {ws.seat_limit ? ` of ${ws.seat_limit}` : ""} seats used
          </p>
        </div>
        {!isOwner && (
          <button
            disabled={busy}
            onClick={() => {
              if (confirm(`Leave ${ws.name}?`))
                run(async () => {
                  await leaveWorkspace(ws.id);
                  navigate("/dashboard");
                });
            }}
            className="px-4 py-2 rounded-full text-sm font-medium text-red-600 border border-red-200 hover:bg-red-50"
          >
            Leave workspace
          </button>
        )}
      </div>

      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

      {canManage && (
        <form
          onSubmit={handleInvite}
          className="bg-white/70 border border-[#e3dbcb] rounded-2xl p-6 mb-8"
        >
          <h2 className="font-semibold text-[#3d342a] mb-1">Invite people</h2>
          <p className="text-xs text-[#9c8a6f] mb-4">
            One address per line, or separated by commas. People without an account get an email
            and join automatically when they register with that address.
          </p>
          <textarea
            value={emailsText}
            onChange={(e) => setEmailsText(e.target.value)}
            rows={4}
            placeholder={"student1@example.com\nstudent2@example.com"}
            className="w-full rounded-xl border border-[#e3dbcb] bg-white p-3 text-sm text-[#3d342a] focus:outline-none focus:ring-2 focus:ring-[#3d342a]/30"
          />
          <div className="flex flex-wrap items-center gap-3 mt-3">
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as Role)}
              className="rounded-full border border-[#e3dbcb] bg-white px-4 py-2 text-sm text-[#3d342a]"
            >
              {assignable.map((r) => (
                <option key={r} value={r}>{roleLabels[r]}</option>
              ))}
            </select>
            <button
              type="submit"
              disabled={busy}
              className="px-5 py-2 rounded-full text-sm font-medium bg-[#3d342a] text-[#f5f1ea] hover:bg-[#2a2319] disabled:opacity-60"
            >
              {busy ? "Sending..." : "Send invitations"}
            </button>
          </div>

          {results.length > 0 && (
            <ul className="mt-5 space-y-2">
              {results.map((r) => (
                <li key={r.email} className="flex items-center justify-between gap-3 text-sm">
                  <span className="text-[#3d342a]">{r.email}</span>
                  <span
                    title={r.detail}
                    className={`text-xs px-2 py-1 rounded-full font-medium ${resultStyles[r.status].cls}`}
                  >
                    {resultStyles[r.status].label}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </form>
      )}

      <h2 className="font-semibold text-[#3d342a] mb-3">Members ({ws.members.length})</h2>
      <ul className="space-y-3 mb-10">
        {ws.members.map((m) => (
          <li
            key={m.id}
            className="flex flex-wrap items-center justify-between gap-3 bg-white/70 border border-[#e3dbcb] rounded-xl px-5 py-4"
          >
            <div>
              <p className="font-medium text-[#3d342a]">
                {m.email} {m.is_me && <span className="text-xs text-[#9c8a6f]">(you)</span>}
              </p>
              <p className="text-xs text-[#9c8a6f]">{m.username}</p>
            </div>
            <div className="flex items-center gap-3">
              {canManageMember(m) ? (
                <>
                  <select
                    value={m.role}
                    disabled={busy}
                    onChange={(e) => run(() => changeMemberRole(ws.id, m.id, e.target.value as Role))}
                    className="rounded-full border border-[#e3dbcb] bg-white px-3 py-1 text-sm text-[#3d342a]"
                  >
                    {assignable.map((r) => (
                      <option key={r} value={r}>{roleLabels[r]}</option>
                    ))}
                  </select>
                  <button
                    disabled={busy}
                    onClick={() => {
                      if (confirm(`Remove ${m.email} from ${ws.name}?`))
                        run(() => removeMember(ws.id, m.id));
                    }}
                    className="text-xs text-red-600 hover:underline"
                  >
                    Remove
                  </button>
                </>
              ) : (
                <span className="text-xs px-3 py-1 rounded-full font-medium bg-[#ece4d4] text-[#6b5f50]">
                  {roleLabels[normalizeRole(m.role) as Role] ?? m.role}
                </span>
              )}
            </div>
          </li>
        ))}
      </ul>

      {canManage && ws.pending_invitations.length > 0 && (
        <>
          <h2 className="font-semibold text-[#3d342a] mb-3">
            Waiting to register ({ws.pending_invitations.length})
          </h2>
          <ul className="space-y-3">
            {ws.pending_invitations.map((inv) => (
              <li
                key={inv.id}
                className="flex items-center justify-between bg-white/50 border border-dashed border-[#e3dbcb] rounded-xl px-5 py-4"
              >
                <div>
                  <p className="font-medium text-[#3d342a]">{inv.email}</p>
                  <p className="text-xs text-[#9c8a6f]">
                    Joins as {roleLabels[normalizeRole(inv.role) as Role] ?? inv.role}
                  </p>
                </div>
                <button
                  disabled={busy}
                  onClick={() => run(() => cancelInvitation(ws.id, inv.id))}
                  className="text-xs text-red-600 hover:underline"
                >
                  Cancel
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </AppLayout>
  );
}