import { getRedisClient } from "../config/redis";

const CACHE_TTL = 60; // 1 minute

export function getTasksCacheKey(userId: string) {
  return `tasks:user:${userId}`;
}

export const CacheService = {
  getTasksCache: async (userId: string) => {
    try {
      const client = getRedisClient();
      if (!client.isOpen) return null;
      
      const cached = await client.get(getTasksCacheKey(userId));
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.error("Cache GET error:", error);
      return null;
    }
  },

  setTasksCache: async (userId: string, payload: any) => {
    try {
      const client = getRedisClient();
      if (!client.isOpen) return;
      
      await client.set(getTasksCacheKey(userId), JSON.stringify(payload), {
        EX: CACHE_TTL
      });
    } catch (error) {
      console.error("Cache SET error:", error);
    }
  },

  invalidateTasksCache: async (userId: string) => {
    try {
      const client = getRedisClient();
      if (!client.isOpen) return;
      
      await client.del(getTasksCacheKey(userId));
    } catch (error) {
      console.error("Cache INVALIDATE error:", error);
    }
  }
};
