import { Request, Response } from "express";
import { AuthService } from "../services/auth.service";
import type { RegisterInput, LoginInput, RefreshInput, AcceptInviteInput } from "../schemas/auth.schema";

const svc = new AuthService();

export class AuthController {
  register = async (req: Request, res: Response) => {
    const tokens = await svc.register(req.body as RegisterInput);
    res.status(201).json({ data: tokens });
  };

  login = async (req: Request, res: Response) => {
    const tokens = await svc.login(req.body as LoginInput);
    res.json({ data: tokens });
  };

  refresh = async (req: Request, res: Response) => {
    const tokens = await svc.refresh((req.body as RefreshInput).refreshToken);
    res.json({ data: tokens });
  };

  logout = async (req: Request, res: Response) => {
    await svc.logout(req.user.userId, req.body?.refreshToken);
    res.json({ data: { message: "Logged out" } });
  };

  me = async (req: Request, res: Response) => {
    const user = await svc.me(req.user.userId);
    res.json({ data: user });
  };

  acceptInvite = async (req: Request, res: Response) => {
    const tokens = await svc.acceptInvite(req.body as AcceptInviteInput);
    res.json({ data: tokens });
  };

  changePassword = async (req: Request, res: Response) => {
    const { currentPassword, newPassword } = req.body;
    await svc.changePassword(req.user.userId, currentPassword, newPassword);
    res.json({ data: { message: "Password updated" } });
  };

  googleRedirect = async (_req: Request, res: Response) => {
    const url = svc.getGoogleAuthUrl();
    res.redirect(url);
  };

  googleCallback = async (req: Request, res: Response) => {
    const { code } = req.query as { code: string };
    const { accessToken, refreshToken } = await svc.handleGoogleCallback(code);
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    res.redirect(
      `${frontendUrl}/auth/callback?accessToken=${accessToken}&refreshToken=${refreshToken}`
    );
  };
}
