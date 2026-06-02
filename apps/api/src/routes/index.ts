import { Router } from "express";
import { authRoutes } from "./auth.routes";
import { orgRoutes } from "./orgs.routes";
import { healthRoutes } from "./health.routes";

export const router = Router();

// Public
router.use("/health", healthRoutes);
router.use("/auth", authRoutes);

// Org-scoped (auth + tenant resolved inside each router)
router.use("/orgs", orgRoutes);
