import { getRedis } from "../config/redis";

const DEFAULT_TTL = 60; // seconds

export const cache = {
  async get<T>(key: string): Promise<T | null> {
    const val = await getRedis().get(key);
    return val ? (JSON.parse(val) as T) : null;
  },

  async set(key: string, value: unknown, ttl = DEFAULT_TTL): Promise<void> {
    await getRedis().set(key, JSON.stringify(value), "EX", ttl);
  },

  async del(key: string): Promise<void> {
    await getRedis().del(key);
  },

  async delPattern(pattern: string): Promise<void> {
    const keys = await getRedis().keys(pattern);
    if (keys.length) await getRedis().del(...keys);
  },

  // Cache key helpers (consistent naming)
  keys: {
    projects: (orgId: string) => `org:${orgId}:projects`,
    project:  (orgId: string, projectId: string) => `org:${orgId}:project:${projectId}`,
    tasks:    (orgId: string, projectId: string) => `org:${orgId}:project:${projectId}:tasks`,
    members:  (orgId: string) => `org:${orgId}:members`,
    me:       (userId: string) => `user:${userId}:me`,
  },
};
