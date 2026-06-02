export type ProjectStatus = "active" | "archived" | "completed";

export interface Project {
  id: string;
  orgId: string;
  name: string;
  description: string | null;
  status: ProjectStatus;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  taskCount?: number;
}
