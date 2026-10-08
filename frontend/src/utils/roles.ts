export type WorkspaceRole =
  | "OWNER"
  | "ADMIN"
  | "EDITOR"
  | "VIEWER";

export function canEditRole(role?: WorkspaceRole | null): boolean {
  return (
    role === "OWNER" ||
    role === "ADMIN" ||
    role === "EDITOR"
  );
}