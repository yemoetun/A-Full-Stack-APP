import { Router } from "express";
import { getPool } from "../config/database";
import { getRedis } from "../config/redis";

export const healthRoutes = Router();

healthRoutes.get("/", async (_req, res) => {
  const checks: Record<string, "ok" | "error"> = {};

  // DB check
  try {
    await getPool().query("SELECT 1");
    checks.database = "ok";
  } catch {
    checks.database = "error";
  }

  // Redis check
  try {
    await getRedis().ping();
    checks.redis = "ok";
  } catch {
    checks.redis = "error";
  }

  const healthy = Object.values(checks).every((v) => v === "ok");
  res.status(healthy ? 200 : 503).json({
    status: healthy ? "healthy" : "degraded",
    checks,
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || "1.0.0",
  });
});
