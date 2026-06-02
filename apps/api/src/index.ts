import "express-async-errors";
import { validateServerEnv } from "@projectflow/config";
import { createApp } from "./app";
import { logger } from "./utils/logger";

const env = validateServerEnv();

const app = createApp();

const server = app.listen(env.API_PORT, () => {
  logger.info({ port: env.API_PORT, env: env.NODE_ENV }, "🚀 API server started");
});

// Graceful shutdown
const shutdown = (signal: string) => {
  logger.info({ signal }, "Shutting down...");
  server.close(() => {
    logger.info("Server closed");
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 10_000); // force exit after 10s
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
process.on("uncaughtException", (err) => {
  logger.error({ err }, "Uncaught exception");
  process.exit(1);
});
process.on("unhandledRejection", (reason) => {
  logger.error({ reason }, "Unhandled rejection");
  process.exit(1);
});
