import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import { resolveTenant } from "../middleware/tenant.middleware";
import { validate } from "../middleware/validate.middleware";
import { upload } from "../middleware/upload.middleware";
import { OrgController } from "../controllers/orgs.controller";
import { ProjectController } from "../controllers/projects.controller";
import { TaskController } from "../controllers/tasks.controller";
import { CommentController } from "../controllers/comments.controller";
import { MemberController } from "../controllers/members.controller";
import { FileController } from "../controllers/files.controller";
import { createProjectSchema, updateProjectSchema } from "../schemas/project.schema";
import { createTaskSchema, updateTaskSchema, moveTaskSchema } from "../schemas/task.schema";
import { inviteMemberSchema } from "../schemas/member.schema";

export const orgRoutes = Router();

// All org routes require auth
orgRoutes.use(authenticate);

const orgCtrl     = new OrgController();
const projectCtrl = new ProjectController();
const taskCtrl    = new TaskController();
const commentCtrl = new CommentController();
const memberCtrl  = new MemberController();
const fileCtrl    = new FileController();

// ── Org ──────────────────────────────────────────────────────
orgRoutes.post("/", orgCtrl.create);
orgRoutes.get("/",  orgCtrl.listMine);

// ── Org-scoped routes (tenant check) ─────────────────────────
const org = Router({ mergeParams: true });
orgRoutes.use("/:orgId", resolveTenant(), org);

org.get("/",    orgCtrl.get);
org.patch("/",  resolveTenant("admin"), orgCtrl.update);
org.delete("/", resolveTenant("owner"), orgCtrl.delete);

// ── Projects ─────────────────────────────────────────────────
org.get(   "/projects",     projectCtrl.list);
org.post(  "/projects",     resolveTenant("member"), validate(createProjectSchema), projectCtrl.create);
org.get(   "/projects/:projectId", projectCtrl.get);
org.patch( "/projects/:projectId", resolveTenant("member"), validate(updateProjectSchema), projectCtrl.update);
org.delete("/projects/:projectId", resolveTenant("admin"),  projectCtrl.delete);

// ── Tasks ────────────────────────────────────────────────────
org.get(   "/projects/:projectId/tasks",          taskCtrl.list);
org.post(  "/projects/:projectId/tasks",          resolveTenant("member"), validate(createTaskSchema), taskCtrl.create);
org.get(   "/projects/:projectId/tasks/:taskId",  taskCtrl.get);
org.patch( "/projects/:projectId/tasks/:taskId",  resolveTenant("member"), validate(updateTaskSchema), taskCtrl.update);
org.delete("/projects/:projectId/tasks/:taskId",  resolveTenant("member"), taskCtrl.delete);
org.patch( "/projects/:projectId/tasks/:taskId/move", resolveTenant("member"), validate(moveTaskSchema), taskCtrl.move);

// ── Comments ─────────────────────────────────────────────────
org.get( "/tasks/:taskId/comments",     commentCtrl.list);
org.post("/tasks/:taskId/comments",     resolveTenant("member"), commentCtrl.create);
org.patch("/tasks/:taskId/comments/:commentId",  resolveTenant("member"), commentCtrl.update);
org.delete("/tasks/:taskId/comments/:commentId", resolveTenant("member"), commentCtrl.delete);

// ── Files ────────────────────────────────────────────────────
org.get( "/tasks/:taskId/files",    fileCtrl.list);
org.post("/tasks/:taskId/files",    resolveTenant("member"), upload.single("file"), fileCtrl.upload);
org.delete("/files/:fileId",        resolveTenant("member"), fileCtrl.delete);

// ── Members ──────────────────────────────────────────────────
org.get(   "/members",              memberCtrl.list);
org.post(  "/members/invite",       resolveTenant("admin"), validate(inviteMemberSchema), memberCtrl.invite);
org.patch( "/members/:userId/role", resolveTenant("admin"), memberCtrl.updateRole);
org.delete("/members/:userId",      resolveTenant("admin"), memberCtrl.remove);
