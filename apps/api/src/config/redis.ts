import Redis from "ioredis";
import { logger } from "../utils/logger";

let redis: Redis;

export function getRedis(): Redis {
  if (!redis) {
    redis = new Redis(process.env.REDIS_URL!, {
      maxRetriesPerRequest: 3,
      lazyConnect: true,
    });

    redis.on("error", (err) => {
      logger.error({ err }, "Redis error");
    });

    redis.on("connect", () => {
      logger.debug("Redis connected");
    });
  }
  return redis;
}
