import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";

import authRouter from "./routes/auth.routes.js";
import workspaceRouter from "./routes/workspace.routes.js";
import projectRouter from "./routes/project.routes.js";
import taskRouter from "./routes/task.routes.js";
import noteRouter from "./routes/note.routes.js";
import { errorHandler } from "./middlewares/error.middlewares.js";

const app = express();

const allowedOrigins = process.env.CORS_ORIGIN?.split(",").map((origin) => origin.trim());

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins?.includes("*") || allowedOrigins?.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error("Origin not allowed by CORS"));
  },
  credentials: true,
}));

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());
app.use(morgan("dev"));

// ── Health check ──────────────────────────────────────────────────────
app.get("/api/v1/healthcheck", (req, res) => {
  res.status(200).json({ success: true, message: "TaskFlow API is healthy 🔥" });
});

// ── Routes ────────────────────────────────────────────────────────────
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/workspaces", workspaceRouter);

// Projects, tasks, notes are nested under workspaces
app.use("/api/v1/workspaces/:workspaceId/projects", projectRouter);
app.use("/api/v1/workspaces/:workspaceId/projects/:projectId/tasks", taskRouter);
app.use("/api/v1/workspaces/:workspaceId/projects/:projectId/notes", noteRouter);

app.use(errorHandler);

export default app;
