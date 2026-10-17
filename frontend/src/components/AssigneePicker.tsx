import type { Member } from "../api/workspaces";

export default function AssigneePicker({
  members,
  selected,
  onChange,
}: {
  members: Member[];
  selected: number[];
  onChange: (ids: number[]) => void;
}) {
  const toggle = (id: number) =>
    onChange(selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id]);

  return (
    <div className="flex flex-wrap gap-2">
      {members.map((m) => (
        <button
          type="button"
          key={m.user}
          onClick={() => toggle(m.user)}
          className={`px-3 py-1 rounded-full text-xs font-medium transition ${
            selected.includes(m.user)
              ? "bg-[#3d342a] text-[#f5f1ea]"
              : "bg-white border border-[#e3dbcb] text-[#6b5f50] hover:bg-[#ece4d4]"
          }`}
        >
          {m.email}
        </button>
      ))}
    </div>
  );
}