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

const defaultAllowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "https://task-flowflies.vercel.app",
  "https://task-flowflies-1358apcfc-dmt20.vercel.app",
];

const parseOrigins = (rawValue = "") =>
  rawValue
    .split(/\s*(?:,|\|\|)\s*/)
    .map((origin) => origin.trim())
    .filter((origin) => origin && origin !== "*");

const configuredOrigins = parseOrigins(process.env.CORS_ORIGIN);
const allowedOrigins = [...new Set([...defaultAllowedOrigins, ...configuredOrigins])];

app.use((req, res, next) => {
  const requestOrigin = req.headers.origin;

  if (requestOrigin && allowedOrigins.includes(requestOrigin)) {
    res.setHeader("Access-Control-Allow-Origin", requestOrigin);
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Vary", "Origin");
  }

  next();
});

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, origin);
    }

    console.warn(`CORS blocked origin: ${origin}`);
    return callback(new Error("Origin not allowed by CORS"));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
};

app.options("*", cors(corsOptions));
app.use(cors(corsOptions));

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
