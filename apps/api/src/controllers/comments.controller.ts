import { Request, Response } from "express";
import { getPool } from "../config/database";
import { Errors } from "../utils/errors";

export class CommentController {
  private pool = getPool();

  list = async (req: Request, res: Response) => {
    const { rows } = await this.pool.query(
      `SELECT c.*, u.name AS author_name, u.avatar_url AS author_avatar
       FROM comments c JOIN users u ON u.id = c.user_id
       WHERE c.task_id = $1 AND c.org_id = $2
       ORDER BY c.created_at`,
      [req.params.taskId, req.orgId]
    );
    res.json({ data: rows });
  };

  create = async (req: Request, res: Response) => {
    const { body } = req.body;
    if (!body?.trim()) throw Errors.badRequest("Comment body is required");

    const { rows } = await this.pool.query(
      `INSERT INTO comments (task_id, org_id, user_id, body)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [req.params.taskId, req.orgId, req.user.userId, body]
    );
    res.status(201).json({ data: rows[0] });
  };

  update = async (req: Request, res: Response) => {
    const { rows } = await this.pool.query(
      "SELECT user_id FROM comments WHERE id = $1 AND org_id = $2",
      [req.params.commentId, req.orgId]
    );
    if (!rows.length) throw Errors.notFound("Comment");
    if (rows[0].user_id !== req.user.userId) throw Errors.forbidden("You can only edit your own comments");

    const { rows: updated } = await this.pool.query(
      "UPDATE comments SET body = $1 WHERE id = $2 RETURNING *",
      [req.body.body, req.params.commentId]
    );
    res.json({ data: updated[0] });
  };

  delete = async (req: Request, res: Response) => {
    const { rows } = await this.pool.query(
      "SELECT user_id FROM comments WHERE id = $1 AND org_id = $2",
      [req.params.commentId, req.orgId]
    );
    if (!rows.length) throw Errors.notFound("Comment");
    if (rows[0].user_id !== req.user.userId) throw Errors.forbidden("You can only delete your own comments");

    await this.pool.query("DELETE FROM comments WHERE id = $1", [req.params.commentId]);
    res.status(204).send();
  };
}
