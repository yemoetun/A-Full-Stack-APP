import { Request, Response } from "express";
import { FilesService } from "../services/files.service";
import { Errors } from "../utils/errors";

const svc = new FilesService();

export class FileController {
  list = async (req: Request, res: Response) => {
    const data = await svc.list(req.orgId, req.params.taskId);
    res.json({ data });
  };

  upload = async (req: Request, res: Response) => {
    if (!req.file) throw Errors.badRequest("No file provided");
    const data = await svc.upload(req.orgId, req.params.taskId, req.user.userId, req.file);
    res.status(201).json({ data });
  };

  delete = async (req: Request, res: Response) => {
    await svc.delete(req.orgId, req.params.fileId, req.user.userId);
    res.status(204).send();
  };
}
