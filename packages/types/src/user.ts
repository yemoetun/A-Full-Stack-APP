export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  createdAt: string;
}

export interface UserWithOrgs extends User {
  orgs: { id: string; name: string; slug: string; role: OrgRole }[];
}

export type OrgRole = "owner" | "admin" | "member" | "viewer";
