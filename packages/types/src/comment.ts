export interface Comment {
  id: string;
  taskId: string;
  orgId: string;
  userId: string;
  author?: { id: string; name: string; avatarUrl: string | null };
  body: string;
  createdAt: string;
  updatedAt: string;
}
