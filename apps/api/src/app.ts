import express, { Express } from "express";
import cors from "cors";
import helmet from "helmet";
import * as Sentry from "@sentry/node";
import { pinoHttp } from "pino-http";
import { logger } from "./utils/logger";
import { errorHandler } from "./middleware/errorHandler.middleware";
import { rateLimiter } from "./middleware/rateLimiter.middleware";
import { router } from "./routes";

export function createApp(): Express {
  const app = express();

  // Sentry
  if (process.env.SENTRY_DSN) {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      environment: process.env.NODE_ENV,
      tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
    });
  }

  // Security headers
  app.use(helmet());

  // CORS
  app.use(cors({
    origin: ["http://localhost:3000", process.env.FRONTEND_URL].filter(Boolean) as string[],
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Org-Id"],
  }));

  // Body parsing
  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: true }));

  // Request logging
  app.use(pinoHttp({ logger }));

  // Global rate limiter (loose — per-route limiters are stricter)
  app.use(rateLimiter("api"));

  // Routes
  app.use("/api/v1", router);

  // Global error handler
  app.use(errorHandler);

  return app;
}
