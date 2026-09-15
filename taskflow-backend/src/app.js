import express from "express";
import cookieParser from "cookie-parser";
import morgan from "morgan";

import authRouter from "./routes/auth.routes.js";
import workspaceRouter from "./routes/workspace.routes.js";
import projectRouter from "./routes/project.routes.js";
import taskRouter from "./routes/task.routes.js";
import noteRouter from "./routes/note.routes.js";
import { errorHandler } from "./middlewares/error.middlewares.js";

const app = express();

const parseOrigins = (rawValue = "") =>
  rawValue
    .split(/\s*(?:,|\|\|)\s*/)
    .map((origin) => origin.trim())
    .filter(Boolean);

const configuredOrigins = parseOrigins(process.env.CORS_ORIGIN);
const invalidOrigins = configuredOrigins.filter((origin) => {
  try {
    const parsedOrigin = new URL(origin);
    return !["http:", "https:"].includes(parsedOrigin.protocol)
      || parsedOrigin.origin !== origin;
  } catch {
    return true;
  }
});

if (invalidOrigins.length > 0) {
  throw new Error(`Invalid CORS_ORIGIN value(s): ${invalidOrigins.join(", ")}`);
}

if (process.env.NODE_ENV === "production" && configuredOrigins.length === 0) {
  throw new Error("CORS_ORIGIN must contain at least one allowed origin in production");
}

const allowedOrigins = new Set(configuredOrigins);

const isAllowedOrigin = (origin) => !origin || allowedOrigins.has(origin);

app.use((req, res, next) => {
  const requestOrigin = req.headers.origin;

  if (requestOrigin && isAllowedOrigin(requestOrigin)) {
    res.setHeader("Access-Control-Allow-Origin", requestOrigin);
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With, Accept");
    res.setHeader("Vary", "Origin");
  }

  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }

  next();
});

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());
app.use(morgan("dev"));

// ── Root / default welcome ─────────────────────────────────────────────
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "TaskFlow API is running and everything is working fine ✅",
    version: "1.0.0",
    endpoints: {
      healthcheck: "/api/v1/healthcheck",
      auth: "/api/v1/auth",
      workspaces: "/api/v1/workspaces"
    }
  });
});

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
