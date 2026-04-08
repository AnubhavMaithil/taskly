import { createClient } from "redis";
import { env } from "./env";

let redisClient: ReturnType<typeof createClient> | null = null;

export function getRedisClient() {
  if (!redisClient) {
    redisClient = createClient({ url: env.redisUrl });
    redisClient.on("error", (error) => {
      console.error("Redis error", error);
    });
  }

  return redisClient;
}

export async function connectRedis() {
  const client = getRedisClient();

  if (!client.isOpen) {
    await client.connect();
  }

  return client;
}
