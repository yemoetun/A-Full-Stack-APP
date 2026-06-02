import { Request, Response } from "express";
import { MembersService } from "../services/members.service";
import type { OrgRole } from "@projectflow/types";

const svc = new MembersService();

export class MemberController {
  list = async (req: Request, res: Response) => {
    const data = await svc.list(req.orgId);
    res.json({ data });
  };

  invite = async (req: Request, res: Response) => {
    const data = await svc.invite(req.orgId, req.user.userId, req.body);
    res.status(201).json({ data });
  };

  updateRole = async (req: Request, res: Response) => {
    await svc.updateRole(req.orgId, req.params.userId, req.body.role as OrgRole);
    res.json({ data: { message: "Role updated" } });
  };

  remove = async (req: Request, res: Response) => {
    await svc.remove(req.orgId, req.params.userId, req.user.userId);
    res.status(204).send();
  };
}
