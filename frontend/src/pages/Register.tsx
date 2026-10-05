import { useState, type FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { register as registerApi, login as loginApi } from "../api/auth";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await registerApi({ email, username, password });
      // auto-login right after registering, so the user lands straight in the app
      const res = await loginApi({ email, password });
      login(res.data.access, res.data.refresh);
      navigate("/dashboard");
    } catch (err: any) {
      const data = err?.response?.data;
      const firstError = data ? Object.values(data)[0] : null;
      setError(
        Array.isArray(firstError) ? firstError[0] : "Could not create account."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-[#f5f1ea] px-4"
      style={{ fontFamily: "Inter, sans-serif" }}
    >
      <div className="w-full max-w-sm bg-white/70 border border-[#e3dbcb] rounded-2xl shadow-lg p-8">
        <h1
          className="text-2xl font-semibold text-[#3d342a] mb-2 text-center"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          Create your account
        </h1>
        <p className="text-sm text-[#6b5f50] text-center mb-6">
          Start organizing your notes, tasks, and goals today.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#3d342a] mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-lg border border-[#e3dbcb] bg-white px-3 py-2 text-[#3d342a] focus:outline-none focus:ring-2 focus:ring-[#3d342a]/30"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#3d342a] mb-1">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full rounded-lg border border-[#e3dbcb] bg-white px-3 py-2 text-[#3d342a] focus:outline-none focus:ring-2 focus:ring-[#3d342a]/30"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#3d342a] mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              className="w-full rounded-lg border border-[#e3dbcb] bg-white px-3 py-2 text-[#3d342a] focus:outline-none focus:ring-2 focus:ring-[#3d342a]/30"
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#3d342a] text-[#f5f1ea] rounded-full py-2.5 font-medium hover:bg-[#2a2319] transition disabled:opacity-60"
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>
        <p className="mt-5 text-sm text-[#6b5f50] text-center">
          Already have an account?{" "}
          <Link to="/login" className="text-[#3d342a] font-medium hover:underline">
            Log In
          </Link>
        </p>
      </div>
    </div>
  );
}