import { Request, Response } from "express";
import { TasksService } from "../services/tasks.service";

const svc = new TasksService();

export class TaskController {
  list = async (req: Request, res: Response) => {
    const data = await svc.list(req.orgId, req.params.projectId);
    res.json({ data });
  };

  get = async (req: Request, res: Response) => {
    const data = await svc.get(req.orgId, req.params.taskId);
    res.json({ data });
  };

  create = async (req: Request, res: Response) => {
    const data = await svc.create(req.orgId, req.params.projectId, req.user.userId, req.body);
    res.status(201).json({ data });
  };

  update = async (req: Request, res: Response) => {
    const data = await svc.update(req.orgId, req.params.taskId, req.body);
    res.json({ data });
  };

  move = async (req: Request, res: Response) => {
    const data = await svc.move(req.orgId, req.params.taskId, req.body);
    res.json({ data });
  };

  delete = async (req: Request, res: Response) => {
    await svc.delete(req.orgId, req.params.taskId);
    res.status(204).send();
  };
}
