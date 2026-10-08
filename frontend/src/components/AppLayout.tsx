import type { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useWorkspace } from "../context/WorkspaceContext";

const navItems = [
  { label: "Dashboard", path: "/dashboard" },
  { label: "Notes", path: "/notes" },
  { label: "Tasks", path: "/tasks" },
  { label: "Flashcards", path: "/flashcards" },
];

export default function AppLayout({ children }: { children: ReactNode }) {
  const { logout } = useAuth();
  const { currentWorkspace } = useWorkspace();
  const location = useLocation();

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
                    location.pathname === item.path
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
            {currentWorkspace && (
              <span className="text-sm text-[#6b5f50]">{currentWorkspace.name}</span>
            )}
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