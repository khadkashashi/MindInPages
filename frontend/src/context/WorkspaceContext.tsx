import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { listWorkspaces, type Workspace } from "../api/workspaces";
import { canEditRole } from "../utils/roles";

interface WorkspaceContextType {
  workspaces: Workspace[];
  currentWorkspace: Workspace | null;
  setCurrentWorkspace: (w: Workspace) => void;
  canEdit: boolean;
  loading: boolean;
  refresh: () => void;
}

const STORAGE_KEY = "current_workspace_id";
const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [currentId, setCurrentId] = useState<number | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? Number(saved) : null;
  });
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(() => {
    listWorkspaces()
      .then((res) => {
        setWorkspaces(res.data);
        // keep the saved selection if it still exists, otherwise fall back to the first workspace
        setCurrentId((prev) =>
          prev && res.data.some((w) => w.id === prev) ? prev : res.data[0]?.id ?? null
        );
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const setCurrentWorkspace = (w: Workspace) => {
    localStorage.setItem(STORAGE_KEY, String(w.id));
    setCurrentId(w.id);
  };

  const currentWorkspace = workspaces.find((w) => w.id === currentId) ?? null;
  const canEdit = canEditRole(currentWorkspace?.my_role);

  return (
    <WorkspaceContext.Provider
      value={{ workspaces, currentWorkspace, setCurrentWorkspace, canEdit, loading, refresh }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) throw new Error("useWorkspace must be used within WorkspaceProvider");
  return ctx;
}