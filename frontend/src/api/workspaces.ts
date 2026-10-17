import api from "./client";

export type Role = "OWNER" | "ADMIN" | "EDITOR" | "VIEWER";

export interface Member {
  id: number;
  user: number;
  email: string;
  username: string;
  role: Role;
  is_me: boolean;
  joined_at: string;
}

export interface Invitation {
  id: number;
  email: string;
  role: Role;
  created_at: string;
}

export interface Workspace {
  id: number;
  name: string;
  owner: number;
  created_at: string;
  my_role: Role | null;
  members: Member[];
  pending_invitations: Invitation[];
  seat_limit: number | null;
}

export interface InviteResult {
  email: string;
  status: "added" | "invited" | "already_member" | "already_invited" | "invalid" | "limit_reached";
  detail: string;
}

export const listWorkspaces = () => api.get<Workspace[]>("/workspaces/");

export const createWorkspace = (name: string) =>
  api.post<Workspace>("/workspaces/", { name });

export const inviteMembers = (workspaceId: number, emails: string[], role: Role) =>
  api.post<{ results: InviteResult[] }>(`/workspaces/${workspaceId}/invite_members/`, { emails, role });

export const changeMemberRole = (workspaceId: number, memberId: number, role: Role) =>
  api.post<Member>(`/workspaces/${workspaceId}/change_role/`, { member_id: memberId, role });

export const removeMember = (workspaceId: number, memberId: number) =>
  api.post(`/workspaces/${workspaceId}/remove_member/`, { member_id: memberId });

export const cancelInvitation = (workspaceId: number, invitationId: number) =>
  api.post(`/workspaces/${workspaceId}/cancel_invitation/`, { invitation_id: invitationId });

export const leaveWorkspace = (workspaceId: number) =>
  api.post(`/workspaces/${workspaceId}/leave/`);