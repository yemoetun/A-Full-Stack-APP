import { PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getS3, getPublicFileUrl } from "../config/storage";
import { getPool } from "../config/database";
import { Errors } from "../utils/errors";
import { v4 as uuidv4 } from "uuid";

export class FilesService {
  private pool = getPool();

  async list(orgId: string, taskId: string) {
    const { rows } = await this.pool.query(
      `SELECT f.*, u.name AS uploader_name
       FROM files f JOIN users u ON u.id = f.uploader_id
       WHERE f.task_id = $1 AND f.org_id = $2
       ORDER BY f.created_at DESC`,
      [taskId, orgId]
    );
    return rows.map((f) => ({ ...f, url: getPublicFileUrl(f.storage_key) }));
  }

  async upload(
    orgId: string,
    taskId: string,
    uploaderId: string,
    file: Express.Multer.File
  ) {
    const ext = file.originalname.split(".").pop();
    const storageKey = `${orgId}/${taskId}/${uuidv4()}.${ext}`;

    await getS3().send(new PutObjectCommand({
      Bucket: process.env.R2_BUCKET!,
      Key: storageKey,
      Body: file.buffer,
      ContentType: file.mimetype,
      ContentLength: file.size,
    }));

    const { rows } = await this.pool.query(
      `INSERT INTO files (org_id, task_id, uploader_id, filename, storage_key, size, mime_type)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [orgId, taskId, uploaderId, file.originalname, storageKey, file.size, file.mimetype]
    );

    return { ...rows[0], url: getPublicFileUrl(storageKey) };
  }

  async delete(orgId: string, fileId: string, userId: string) {
    const { rows } = await this.pool.query(
      "SELECT * FROM files WHERE id = $1 AND org_id = $2",
      [fileId, orgId]
    );
    if (!rows.length) throw Errors.notFound("File");

    // Only uploader or admin can delete
    if (rows[0].uploader_id !== userId) {
      throw Errors.forbidden("You can only delete files you uploaded");
    }

    await getS3().send(new DeleteObjectCommand({
      Bucket: process.env.R2_BUCKET!,
      Key: rows[0].storage_key,
    }));

    await this.pool.query("DELETE FROM files WHERE id = $1", [fileId]);
  }
}
