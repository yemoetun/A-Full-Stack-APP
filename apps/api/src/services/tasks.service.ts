import { getPool } from "../config/database";
import { cache } from "./cache.service";
import { Errors } from "../utils/errors";
import { rowToCamel, rowsToCamel } from "../utils/camel";
import type { CreateTaskInput, UpdateTaskInput, MoveTaskInput } from "../schemas/task.schema";

export class TasksService {
  private pool = getPool();

  async list(orgId: string, projectId: string) {
    const cacheKey = cache.keys.tasks(orgId, projectId);
    const cached = await cache.get(cacheKey);
    if (cached) return cached;

    const { rows } = await this.pool.query(
      `SELECT t.*,
              u.name AS assignee_name, u.avatar_url AS assignee_avatar,
              COUNT(c.id)::int AS comment_count,
              COUNT(f.id)::int AS file_count
       FROM tasks t
       LEFT JOIN users u ON u.id = t.assignee_id
       LEFT JOIN comments c ON c.task_id = t.id
       LEFT JOIN files f ON f.task_id = t.id
       WHERE t.project_id = $1 AND t.org_id = $2
       GROUP BY t.id, u.id
       ORDER BY t.status, t.position`,
      [projectId, orgId]
    );

    const camel = rowsToCamel(rows);
    await cache.set(cacheKey, camel, 15);
    return camel;
  }

  async get(orgId: string, taskId: string) {
    const { rows } = await this.pool.query(
      `SELECT t.*, u.name AS assignee_name, u.avatar_url AS assignee_avatar
       FROM tasks t
       LEFT JOIN users u ON u.id = t.assignee_id
       WHERE t.id = $1 AND t.org_id = $2`,
      [taskId, orgId]
    );
    if (!rows.length) throw Errors.notFound("Task");
    return rowToCamel(rows[0]);
  }

  async create(orgId: string, projectId: string, userId: string, input: CreateTaskInput) {
    // Get max position in the target status column
    const { rows: pos } = await this.pool.query(
      "SELECT MAX(position) as max FROM tasks WHERE project_id = $1 AND status = $2 AND org_id = $3",
      [projectId, input.status, orgId]
    );
    const position = (pos[0].max ?? 0) + 1000;

    const { rows } = await this.pool.query(
      `INSERT INTO tasks (project_id, org_id, title, description, status, priority, assignee_id, due_date, position, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      [projectId, orgId, input.title, input.description ?? null, input.status,
       input.priority, input.assigneeId ?? null, input.dueDate ?? null, position, userId]
    );

    await cache.del(cache.keys.tasks(orgId, projectId));
    return rowToCamel(rows[0]);
  }

  async update(orgId: string, taskId: string, input: UpdateTaskInput) {
    const task = await this.get(orgId, taskId);

    const fields: string[] = [];
    const values: unknown[] = [];
    let i = 1;

    const allowed = ["title", "description", "status", "priority", "assignee_id", "due_date"] as const;
    const inputMap: Record<string, unknown> = {
      title: input.title,
      description: input.description,
      status: input.status,
      priority: input.priority,
      assignee_id: input.assigneeId,
      due_date: input.dueDate,
    };

    for (const col of allowed) {
      if (inputMap[col] !== undefined) {
        fields.push(`${col} = $${i++}`);
        values.push(inputMap[col]);
      }
    }
    if (!fields.length) throw Errors.badRequest("No fields to update");

    values.push(taskId, orgId);
    const { rows } = await this.pool.query(
      `UPDATE tasks SET ${fields.join(", ")} WHERE id = $${i++} AND org_id = $${i} RETURNING *`,
      values
    );

    await cache.del(cache.keys.tasks(orgId, (task as any).projectId));
    return rowToCamel(rows[0]);
  }

  async move(orgId: string, taskId: string, input: MoveTaskInput) {
    const task = await this.get(orgId, taskId);
    const { rows } = await this.pool.query(
      "UPDATE tasks SET status = $1, position = $2 WHERE id = $3 AND org_id = $4 RETURNING *",
      [input.status, input.position, taskId, orgId]
    );
    await cache.del(cache.keys.tasks(orgId, (task as any).projectId));
    return rowToCamel(rows[0]);
  }

  async delete(orgId: string, taskId: string) {
    const task = await this.get(orgId, taskId);
    await this.pool.query("DELETE FROM tasks WHERE id = $1 AND org_id = $2", [taskId, orgId]);
    await cache.del(cache.keys.tasks(orgId, (task as any).projectId));
  }
}
