import { Pool } from "pg";
import { logger } from "../utils/logger";

let pool: Pool;

export function getPool(): Pool {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      min: Number(process.env.DATABASE_POOL_MIN) || 2,
      max: Number(process.env.DATABASE_POOL_MAX) || 10,
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 5_000,
    });

    pool.on("error", (err) => {
      logger.error({ err }, "Postgres pool error");
    });

    pool.on("connect", () => {
      logger.debug("New DB connection established");
    });
  }
  return pool;
}
