import { z } from "zod";

export const createTaskSchema = z.object({
  title: z.string().min(1).max(500),
  description: z.string().max(10000).optional(),
  status: z.enum(["backlog", "todo", "in_progress", "in_review", "done"]).default("backlog"),
  priority: z.enum(["none", "low", "medium", "high", "urgent"]).default("none"),
  assigneeId: z.string().uuid().nullable().optional(),
  dueDate: z.string().date().nullable().optional(),
});

export const updateTaskSchema = createTaskSchema.partial();

export const moveTaskSchema = z.object({
  status: z.enum(["backlog", "todo", "in_progress", "in_review", "done"]),
  position: z.number(),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type MoveTaskInput = z.infer<typeof moveTaskSchema>;
