import { Link } from "react-router-dom";
import heroImage from "../assets/motivation.jpg";
import deskImage from "../assets/deskdecodator.jpg";
import motivationImage from "../assets/aesthetic.jpg";

const features = [
  {
    title: "Notes with Version History",
    description:
      "Write and organize notes in folders and tags. Every edit is saved as a version you can review or restore.",
  },
  {
    title: "Tasks & Goals",
    description:
      "Track to-dos with priority and due dates, linked to longer-term goals with automatic progress tracking.",
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
      "Invite collaborators with role-based permissions, all scoped per workspace.",
  },
  {
    title: "Reminders & Notifications",
    description:
      "Set reminders on notes and tasks, and stay in the loop with in-app notifications.",
  },
];

export default function Landing() {
  return (
    <div
      className="min-h-screen bg-[#f5f1ea]"
      style={{ fontFamily: "Inter, sans-serif" }}
    >
      {/* Nav */}
      <nav className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
        <span
          className="text-xl font-semibold text-[#3d342a]"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          MindInPages
        </span>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-[#6b5f50]">
          <a href="#features" className="hover:text-[#3d342a]">
            Features
          </a>
          <a href="#about" className="hover:text-[#3d342a]">
            About
          </a>
          <Link to="/login" className="hover:text-[#3d342a]">
            Log In
          </Link>
        </div>
        <Link
          to="/register"
          className="bg-[#3d342a] text-[#f5f1ea] text-sm font-medium px-5 py-2.5 rounded-full hover:bg-[#2a2319] transition"
        >
          Join Now
        </Link>
      </nav>

      {/* Hero Section (Uses heroImage) */}
      <section className="max-w-6xl mx-auto px-6 pt-16 pb-28 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <div className="flex items-center gap-2 text-xs tracking-widest font-medium text-[#9c8a6f] mb-6">
            <span>✦</span>
            <span>LEARN. PLAN. GROW. SUCCEED.</span>
          </div>
          <h1
            className="text-5xl md:text-6xl font-semibold text-[#3d342a] leading-[1.05]"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Study Smart,
            <br />
            Achieve More
          </h1>
          <p className="mt-6 text-lg text-[#6b5f50] max-w-md leading-relaxed">
            Your all-in-one workspace for notes, tasks, goals, and spaced
            repetition - built to help you reach your goals step by step.
          </p>
          <Link
            to="/register"
            className="mt-8 inline-flex items-center gap-2 bg-[#3d342a] text-[#f5f1ea] px-7 py-3.5 rounded-full font-medium hover:bg-[#2a2319] transition"
          >
            Start Your Journey
            <span>→</span>
          </Link>
        </div>
        <div className="rounded-2xl overflow-hidden shadow-xl h-80 md:h-96">
          <img
            src={heroImage}
            alt="Study space aesthetic"
            className="w-full h-full object-cover"
          />
        </div>
      </section>

      {/* Showcase Section (Uses deskImage and motivationImage) */}
      {/* Showcase Section */}
      <section id="about" className="max-w-6xl mx-auto px-6 pb-28">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white/60 border border-[#e3dbcb] p-6 rounded-2xl flex flex-col items-center">
            <img
              src={deskImage}
              alt="Desk decorator"
              className="w-full h-70 object-cover rounded-xl mb-2"
            />
            <h3 className="text-xl font-semibold text-[#3d342a] mb-2">
              Organized Workspace
            </h3>
            <p className="text-[#6b5f50] text-sm text-center">
              Keep all your project materials, notes, and goals neatly arranged
              in one spot.
            </p>
          </div>

          <div className="bg-white/60 border border-[#e3dbcb] p-6 rounded-2xl flex flex-col items-center">
            <img
              src={motivationImage}
              alt="Daily motivation"
              className="w-full h-70 object-cover rounded-xl mb-2"
            />
            <h3 className="text-xl font-semibold text-[#3d342a] mb-2">
              Stay Inspired
            </h3>
            <p className="text-[#6b5f50] text-sm text-center">
              Track your daily study streaks and build consistency with spaced
              repetition.
            </p>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="max-w-6xl mx-auto px-6 pb-28">
        <h2
          className="text-3xl md:text-4xl font-semibold text-[#3d342a] text-center mb-14"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          Everything you need, in one place
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f) => (
            <div
              key={f.title}
              className="bg-white/60 border border-[#e3dbcb] p-7 rounded-2xl hover:shadow-md transition"
            >
              <h3
                className="text-lg font-semibold text-[#3d342a] mb-2"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                {f.title}
              </h3>
              <p className="text-[#6b5f50] text-sm leading-relaxed">
                {f.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#e3dbcb] py-8">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between text-sm text-[#9c8a6f]">
          <span>&copy; 2026 MindInPages. Built by Shashi Khadka.</span>
          <a
            href="https://github.com/khadkashashi"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#3d342a]"
          >
            GitHub
          </a>
        </div>
      </footer>
    </div>
  );
}
