import { Request, Response } from "express";
import { getPool } from "../config/database";
import { Errors } from "../utils/errors";

export class OrgController {
  private pool = getPool();

  create = async (req: Request, res: Response) => {
    const { name } = req.body;
    if (!name?.trim()) throw Errors.badRequest("Org name is required");

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

    // Ensure slug uniqueness
    const { rows: existing } = await this.pool.query(
      "SELECT id FROM orgs WHERE slug = $1", [slug]
    );
    const finalSlug = existing.length ? `${slug}-${Date.now()}` : slug;

    const client = await this.pool.connect();
    try {
      await client.query("BEGIN");
      const { rows: orgs } = await client.query(
        "INSERT INTO orgs (name, slug) VALUES ($1, $2) RETURNING *",
        [name, finalSlug]
      );
      await client.query(
        "INSERT INTO org_members (org_id, user_id, role) VALUES ($1, $2, 'owner')",
        [orgs[0].id, req.user.userId]
      );
      await client.query("COMMIT");
      res.status(201).json({ data: orgs[0] });
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  };

  listMine = async (req: Request, res: Response) => {
    const { rows } = await this.pool.query(
      `SELECT o.*, om.role FROM orgs o
       JOIN org_members om ON om.org_id = o.id
       WHERE om.user_id = $1 ORDER BY o.created_at`,
      [req.user.userId]
    );
    res.json({ data: rows });
  };

  get = async (req: Request, res: Response) => {
    const { rows } = await this.pool.query(
      "SELECT * FROM orgs WHERE id = $1", [req.orgId]
    );
    res.json({ data: rows[0] });
  };

  update = async (req: Request, res: Response) => {
    const { name } = req.body;
    const { rows } = await this.pool.query(
      "UPDATE orgs SET name = $1 WHERE id = $2 RETURNING *",
      [name, req.orgId]
    );
    res.json({ data: rows[0] });
  };

  delete = async (req: Request, res: Response) => {
    await this.pool.query("DELETE FROM orgs WHERE id = $1", [req.orgId]);
    res.status(204).send();
  };
}
