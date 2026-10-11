import {type ReactNode, useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useWorkspace } from "../context/WorkspaceContext";
import { getMe } from "../api/auth";

const navItems = [
  { label: "Dashboard", path: "/dashboard" },
  { label: "Notes", path: "/notes" },
  { label: "Tasks", path: "/tasks" },
  { label: "Flashcards", path: "/flashcards" },
  { label: "Members", path: "/members" },
];

export default function AppLayout({ children }: { children: ReactNode }) {
  const { logout } = useAuth();
  const { currentWorkspace } = useWorkspace();
  const location = useLocation();
  const [email, setEmail] = useState("");

  useEffect(() => {
    getMe()
      .then((res) => setEmail(res.data.email))
      .catch(() => setEmail(""));
  }, []);

  return (
    <div className="min-h-screen bg-[#f5f1ea]" style={{ fontFamily: "Inter, sans-serif" }}>
      <header className="border-b border-[#e3dbcb] bg-white/60">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <span
              className="text-xl font-semibold text-[#3d342a]"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              MindInPages
            </span>
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={
                    location.pathname.startsWith(item.path)
                      ? "text-[#3d342a]"
                      : "text-[#9c8a6f] hover:text-[#3d342a]"
                  }
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right leading-tight">
              <p className="text-xs text-[#6b5f50]">{email}</p>
              {currentWorkspace && (
                <p className="text-xs text-[#9c8a6f]">
                  {currentWorkspace.name} ·{" "}
                  <span className="font-semibold text-[#3d342a]">
                    {currentWorkspace.role ?? "unknown role"}
                  </span>
                </p>
              )}
            </div>
            <button
              onClick={logout}
              className="text-sm font-medium text-[#6b5f50] hover:text-[#3d342a]"
            >
              Log Out
            </button>
          </div>
        </div>
      </header>
      <div className="max-w-6xl mx-auto px-6 py-10">{children}</div>
    </div>
  );
}