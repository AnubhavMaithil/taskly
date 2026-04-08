import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./config/env";
import { errorHandler } from "./middleware/error-handler";
import { notFoundHandler } from "./middleware/not-found";
import { authRouter } from "./routes/auth.routes";
import { taskRouter } from "./routes/task.routes";

export function createApp() {
  const app = express();

  app.use(
    cors({
      origin: true,
      credentials: true
    })
    // cors({
    //   origin: env.frontendUrl,
    //   credentials: true
    // })
  );
  app.use(helmet());
  app.use(morgan("dev"));
  app.use(express.json());
  app.use(cookieParser());

  app.get("/health", (_request, response) => {
    response.json({ ok: true });
  });

  app.use("/api/auth", authRouter);
  app.use("/api/tasks", taskRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
