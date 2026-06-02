import { Request, Response } from "express";
import { ProjectsService } from "../services/projects.service";

const svc = new ProjectsService();

export class ProjectController {
  list = async (req: Request, res: Response) => {
    const data = await svc.list(req.orgId);
    res.json({ data });
  };

  get = async (req: Request, res: Response) => {
    const data = await svc.get(req.orgId, req.params.projectId);
    res.json({ data });
  };

  create = async (req: Request, res: Response) => {
    const data = await svc.create(req.orgId, req.user.userId, req.body);
    res.status(201).json({ data });
  };

  update = async (req: Request, res: Response) => {
    const data = await svc.update(req.orgId, req.params.projectId, req.body);
    res.json({ data });
  };

  delete = async (req: Request, res: Response) => {
    await svc.delete(req.orgId, req.params.projectId);
    res.status(204).send();
  };
}
