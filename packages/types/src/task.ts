export type TaskStatus = "backlog" | "todo" | "in_progress" | "in_review" | "done";
export type TaskPriority = "none" | "low" | "medium" | "high" | "urgent";

export interface Task {
  id: string;
  projectId: string;
  orgId: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeId: string | null;
  assignee?: { id: string; name: string; avatarUrl: string | null };
  dueDate: string | null;
  position: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  commentCount?: number;
  fileCount?: number;
}
