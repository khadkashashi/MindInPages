import { Link } from "react-router-dom";

const features = [
  {
    title: "Notes with Version History",
    description:
      "Write and organize notes in folders and tags. Every edit is saved as a version you can review or restore.",
  },
  {
    title: "Tasks & Goals",
    description:
      "Track to-dos with priority and due dates, and link them to longer-term goals with automatic progress tracking.",
  },
  {
    title: "Spaced Repetition Flashcards",
    description:
      "Turn notes into flashcards and review them on a schedule that adapts to how well you know each one.",
  },
  {
    title: "Full-Text Search",
    description:
      "Find anything instantly with PostgreSQL-powered search, ranked by relevance with highlighted matches.",
  },
  {
    title: "Team Workspaces",
    description:
      "Invite collaborators with role-based permissions — Owner, Admin, Editor, or Viewer — all scoped per workspace.",
  },
  {
    title: "Reminders & Notifications",
    description:
      "Set reminders on notes and tasks, and stay in the loop with in-app notifications for workspace activity.",
  },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
        <span className="text-xl font-bold text-gray-900">MindInPages</span>
        <div className="flex gap-4">
          <Link
            to="/login"
            className="text-gray-700 hover:text-blue-600 font-medium"
          >
            Log In
          </Link>
          <Link
            to="/register"
            className="bg-blue-600 text-white px-4 py-2 rounded-md font-medium hover:bg-blue-700 transition"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 pt-20 pb-24 text-center">
        <h1 className="text-5xl font-bold text-gray-900 leading-tight">
          Your all-in-one workspace for notes, tasks, and learning
        </h1>
        <p className="mt-6 text-lg text-gray-600 max-w-2xl mx-auto">
          MindInPages brings together notes, tasks, goals, and spaced
          repetition flashcards in one organized, searchable workspace —
          built for individuals and teams.
        </p>
        <div className="mt-8 flex gap-4 justify-center">
          <Link
            to="/register"
            className="bg-blue-600 text-white px-6 py-3 rounded-md font-medium hover:bg-blue-700 transition"
          >
            Get Started Free
          </Link>
          <Link
            to="/login"
            className="border border-gray-300 text-gray-700 px-6 py-3 rounded-md font-medium hover:bg-gray-50 transition"
          >
            Log In
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 pb-24">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
          Everything you need, in one place
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((f) => (
            <div
              key={f.title}
              className="p-6 rounded-xl border border-gray-200 hover:shadow-md transition"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {f.title}
              </h3>
              <p className="text-gray-600 text-sm">{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between text-sm text-gray-500">
          <span>&copy; 2026 MindInPages. Built by Shashi Khadka.</span>
          <a
            href="https://github.com/khadkashashi"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-blue-600"
          >
            GitHub
          </a>
        </div>
      </footer>
    </div>
  );
}