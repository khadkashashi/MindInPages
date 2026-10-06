import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { WorkspaceProvider } from "./context/WorkspaceContext";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Notes from "./pages/Notes";
import NoteDetail from "./pages/NoteDetail";
import Tasks from "./pages/Tasks";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <WorkspaceProvider>
              <Dashboard />
            </WorkspaceProvider>
          </ProtectedRoute>
        }
      />
      <Route
        path="/notes"
        element={
          <ProtectedRoute>
            <WorkspaceProvider>
              <Notes />
            </WorkspaceProvider>
          </ProtectedRoute>
        }
      />
      <Route
        path="/notes/:id"
        element={
          <ProtectedRoute>
            <WorkspaceProvider>
              <NoteDetail />
            </WorkspaceProvider>
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" />} />
            <Route
        path="/tasks"
        element={
          <ProtectedRoute>
            <WorkspaceProvider>
              <Tasks />
            </WorkspaceProvider>
          </ProtectedRoute>
        }
      />
    </Routes>
    
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}