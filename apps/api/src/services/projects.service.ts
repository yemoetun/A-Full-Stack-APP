import { getPool } from "../config/database";
import { cache } from "./cache.service";
import { Errors } from "../utils/errors";
import type { CreateProjectInput, UpdateProjectInput } from "../schemas/project.schema";

export class ProjectsService {
  private pool = getPool();

  async list(orgId: string) {
    const cacheKey = cache.keys.projects(orgId);
    const cached = await cache.get(cacheKey);
    if (cached) return cached;

    const { rows } = await this.pool.query(
      `SELECT p.*,
              COUNT(t.id) FILTER (WHERE t.status != 'done') AS open_task_count
       FROM projects p
       LEFT JOIN tasks t ON t.project_id = p.id AND t.org_id = p.org_id
       WHERE p.org_id = $1
       GROUP BY p.id
       ORDER BY p.created_at DESC`,
      [orgId]
    );

    await cache.set(cacheKey, rows, 30);
    return rows;
  }

  async get(orgId: string, projectId: string) {
    const cacheKey = cache.keys.project(orgId, projectId);
    const cached = await cache.get(cacheKey);
    if (cached) return cached;

    const { rows } = await this.pool.query(
      "SELECT * FROM projects WHERE id = $1 AND org_id = $2",
      [projectId, orgId]
    );
    if (!rows.length) throw Errors.notFound("Project");

    await cache.set(cacheKey, rows[0], 60);
    return rows[0];
  }

  async create(orgId: string, userId: string, input: CreateProjectInput) {
    const { rows } = await this.pool.query(
      `INSERT INTO projects (org_id, name, description, created_by)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [orgId, input.name, input.description ?? null, userId]
    );
    await cache.del(cache.keys.projects(orgId));
    return rows[0];
  }

  async update(orgId: string, projectId: string, input: UpdateProjectInput) {
    await this.get(orgId, projectId); // ensures it exists + belongs to org

    const fields: string[] = [];
    const values: unknown[] = [];
    let i = 1;

    if (input.name !== undefined)        { fields.push(`name = $${i++}`);        values.push(input.name); }
    if (input.description !== undefined) { fields.push(`description = $${i++}`); values.push(input.description); }
    if (input.status !== undefined)      { fields.push(`status = $${i++}`);      values.push(input.status); }

    if (!fields.length) throw Errors.badRequest("No fields to update");

    values.push(projectId, orgId);
    const { rows } = await this.pool.query(
      `UPDATE projects SET ${fields.join(", ")} WHERE id = $${i++} AND org_id = $${i} RETURNING *`,
      values
    );

    await cache.del(cache.keys.projects(orgId));
    await cache.del(cache.keys.project(orgId, projectId));
    return rows[0];
  }

  async delete(orgId: string, projectId: string) {
    await this.get(orgId, projectId);
    await this.pool.query("DELETE FROM projects WHERE id = $1 AND org_id = $2", [projectId, orgId]);
    await cache.del(cache.keys.projects(orgId));
    await cache.del(cache.keys.project(orgId, projectId));
  }
}
