import { createApp } from "./app";
import { connectDatabase } from "./config/db";
import { env } from "./config/env";
import { connectRedis } from "./config/redis";

async function bootstrap() {
  await connectDatabase();

  try {
    await connectRedis();
  } catch (error) {
    console.warn("Redis unavailable at startup. Continuing without cache.", error);
  }

  const app = createApp();

  app.listen(env.port, () => {
    console.log(`Backend running on http://localhost:${env.port}`);
  });
}

void bootstrap();
