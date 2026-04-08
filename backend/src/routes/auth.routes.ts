import { Router } from "express";
import { getProfile, login, logout, signup } from "../controllers/auth.controller";
import { requireAuth } from "../middleware/auth";

const authRouter = Router();

authRouter.post("/signup", signup);
authRouter.post("/login", login);
authRouter.post("/logout", logout);
authRouter.get("/me", requireAuth, getProfile);

export { authRouter };
