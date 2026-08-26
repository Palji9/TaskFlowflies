// ── Workspace-level roles ────────────────────────────────────────────
export const WorkspaceRolesEnum = {
  OWNER: "OWNER",
  ADMIN: "ADMIN",
  MEMBER: "MEMBER",
};
export const AvailableWorkspaceRoles = Object.values(WorkspaceRolesEnum);

// ── Project-level roles ──────────────────────────────────────────────
export const ProjectRolesEnum = {
  ADMIN: "admin",
  PROJECT_ADMIN: "project_admin",
  MEMBER: "member",
};
export const AvailableProjectRoles = Object.values(ProjectRolesEnum);

// ── Project statuses ─────────────────────────────────────────────────
export const ProjectStatusEnum = {
  PLANNING: "PLANNING",
  ACTIVE: "ACTIVE",
  ON_HOLD: "ON_HOLD",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
};
export const AvailableProjectStatuses = Object.values(ProjectStatusEnum);

// ── Task statuses ────────────────────────────────────────────────────
export const TaskStatusEnum = {
  TODO: "TODO",
  IN_PROGRESS: "IN_PROGRESS",
  DONE: "DONE",
};
export const AvailableTaskStatuses = Object.values(TaskStatusEnum);

// ── Task types ───────────────────────────────────────────────────────
export const TaskTypeEnum = {
  TASK: "TASK",
  BUG: "BUG",
  FEATURE: "FEATURE",
  IMPROVEMENT: "IMPROVEMENT",
  OTHER: "OTHER",
};
export const AvailableTaskTypes = Object.values(TaskTypeEnum);

// ── Task priorities ──────────────────────────────────────────────────
export const TaskPriorityEnum = {
  LOW: "LOW",
  MEDIUM: "MEDIUM",
  HIGH: "HIGH",
};
export const AvailableTaskPriorities = Object.values(TaskPriorityEnum);

// ── Activity event types ─────────────────────────────────────────────
export const ActivityTypeEnum = {
  PROJECT_CREATED: "PROJECT_CREATED",
  PROJECT_UPDATED: "PROJECT_UPDATED",
  PROJECT_DELETED: "PROJECT_DELETED",
  TASK_CREATED: "TASK_CREATED",
  TASK_UPDATED: "TASK_UPDATED",
  TASK_DELETED: "TASK_DELETED",
  TASK_STATUS_CHANGED: "TASK_STATUS_CHANGED",
  MEMBER_ADDED: "MEMBER_ADDED",
  MEMBER_REMOVED: "MEMBER_REMOVED",
  NOTE_CREATED: "NOTE_CREATED",
};
