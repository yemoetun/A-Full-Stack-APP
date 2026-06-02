import { OrgRole } from "./user";

export interface Member {
  userId: string;
  orgId: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  role: OrgRole;
  joinedAt: string;
}

export interface Invite {
  id: string;
  orgId: string;
  email: string;
  role: OrgRole;
  expiresAt: string;
  createdAt: string;
}
