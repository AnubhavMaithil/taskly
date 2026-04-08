import { getRedisClient } from "../config/redis";

export function getTasksCacheKey(userId: string) {
  return `tasks:user:${userId}`;
}

export async function invalidateUserTasksCache(userId: string) {
  const client = getRedisClient();

  if (!client.isOpen) {
    return;
  }

  await client.del(getTasksCacheKey(userId));
}
