import express from "express";
import authRoutes from "./auth.routes.js";
import taskRoutes from "./tasks.routes.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const app = express.Router();

app.use("/auth", authRoutes);
app.use("/task", authMiddleware, taskRoutes);

export default app;
