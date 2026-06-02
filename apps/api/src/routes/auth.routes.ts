import { Router } from "express";
import { rateLimiter } from "../middleware/rateLimiter.middleware";
import { validate } from "../middleware/validate.middleware";
import { authenticate } from "../middleware/auth.middleware";
import { AuthController } from "../controllers/auth.controller";
import {
  registerSchema,
  loginSchema,
  refreshSchema,
  acceptInviteSchema,
} from "../schemas/auth.schema";

export const authRoutes = Router();
const ctrl = new AuthController();

// Google OAuth — no rate limit (browser redirect, not API call)
authRoutes.get("/google",          ctrl.googleRedirect);
authRoutes.get("/google/callback", ctrl.googleCallback);

// Strict rate limit on credential-based auth routes
authRoutes.use(rateLimiter("auth"));
authRoutes.post("/register", validate(registerSchema), ctrl.register);
authRoutes.post("/login",    validate(loginSchema),    ctrl.login);
authRoutes.post("/refresh",  validate(refreshSchema),  ctrl.refresh);
authRoutes.post("/logout",   authenticate,             ctrl.logout);
authRoutes.get("/me",        authenticate,             ctrl.me);
authRoutes.post("/accept-invite", validate(acceptInviteSchema), ctrl.acceptInvite);
authRoutes.patch("/password",     authenticate,                 ctrl.changePassword);
