import { Request, Response, NextFunction } from "express";
import { RateLimiterRedis } from "rate-limiter-flexible";
import { getRedis } from "../config/redis";
import { RATE_LIMITS } from "@projectflow/config";
import { Errors } from "../utils/errors";

type LimiterKey = keyof typeof RATE_LIMITS;

const limiters: Partial<Record<LimiterKey, RateLimiterRedis>> = {};

function getLimiter(key: LimiterKey): RateLimiterRedis {
  if (!limiters[key]) {
    limiters[key] = new RateLimiterRedis({
      storeClient: getRedis(),
      keyPrefix: `rl:${key}`,
      points: RATE_LIMITS[key].points,
      duration: RATE_LIMITS[key].duration,
    });
  }
  return limiters[key]!;
}

export function rateLimiter(key: LimiterKey) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const identifier = req.user?.userId ?? req.ip ?? "anonymous";
    try {
      const result = await getLimiter(key).consume(identifier);
      res.setHeader("X-RateLimit-Limit", RATE_LIMITS[key].points);
      res.setHeader("X-RateLimit-Remaining", result.remainingPoints);
      next();
    } catch {
      res.setHeader("Retry-After", String(RATE_LIMITS[key].duration));
      throw Errors.tooManyRequests();
    }
  };
}
