import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const { logout } = useAuth();
  return (
    <div style={{ maxWidth: 600, margin: "4rem auto" }}>
      <h1>Dashboard</h1>
      <p>You're logged in.</p>
      <button onClick={logout}>Log Out</button>
    </div>
  );
}