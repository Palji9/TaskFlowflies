import { Workspace } from "../models/workspace.models.js";
import { WorkspaceMember } from "../models/workspacemember.models.js";
import { Project } from "../models/project.models.js";
import { Task } from "../models/task.models.js";
import { Activity } from "../models/activity.models.js";
import { User } from "../models/user.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { WorkspaceRolesEnum, ActivityTypeEnum } from "../utils/constants.js";

// ── Get all workspaces the user belongs to ───────────────────────────
export const getWorkspaces = asyncHandler(async (req, res) => {
  const memberships = await WorkspaceMember.find({ user: req.user._id })
    .populate("workspace")
    .lean();

  const workspaces = memberships
    .filter((m) => m.workspace)
    .map((m) => ({ ...m.workspace, role: m.role }));

  return res.status(200).json(new ApiResponse(200, workspaces, "Workspaces fetched"));
});

// ── Get single workspace with projects + members ─────────────────────
export const getWorkspaceById = asyncHandler(async (req, res) => {
  const { workspaceId } = req.params;

  const workspace = await Workspace.findById(workspaceId).lean();
  if (!workspace) throw new ApiError(404, "Workspace not found");

  const [members, projects] = await Promise.all([
    WorkspaceMember.find({ workspace: workspaceId })
      .populate("user", "username email fullName avatar")
      .lean(),
    Project.find({ workspace: workspaceId }).lean(),
  ]);

  // Attach task counts to each project
  const projectsWithStats = await Promise.all(
    projects.map(async (p) => {
      const tasks = await Task.find({ project: p._id })
        .populate("assignee", "username avatar")
        .lean();
      return { ...p, tasks };
    })
  );

  return res.status(200).json(
    new ApiResponse(200, { ...workspace, members, projects: projectsWithStats }, "Workspace fetched")
  );
});

// ── Create workspace ─────────────────────────────────────────────────
export const createWorkspace = asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  const workspace = await Workspace.create({
    name,
    description,
    owner: req.user._id,
  });

  // Creator becomes OWNER
  await WorkspaceMember.create({
    user: req.user._id,
    workspace: workspace._id,
    role: WorkspaceRolesEnum.OWNER,
  });

  return res.status(201).json(new ApiResponse(201, workspace, "Workspace created"));
});

// ── Update workspace ─────────────────────────────────────────────────
export const updateWorkspace = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  const workspace = await Workspace.findByIdAndUpdate(
    req.params.workspaceId,
    { $set: { name, description } },
    { new: true }
  );
  if (!workspace) throw new ApiError(404, "Workspace not found");
  return res.status(200).json(new ApiResponse(200, workspace, "Workspace updated"));
});

// ── Delete workspace ─────────────────────────────────────────────────
export const deleteWorkspace = asyncHandler(async (req, res) => {
  const { workspaceId } = req.params;
  const workspace = await Workspace.findByIdAndDelete(workspaceId);
  if (!workspace) throw new ApiError(404, "Workspace not found");

  await Promise.all([
    WorkspaceMember.deleteMany({ workspace: workspaceId }),
    Project.deleteMany({ workspace: workspaceId }),
    Task.deleteMany({ workspace: workspaceId }),
    Activity.deleteMany({ workspace: workspaceId }),
  ]);

  return res.status(200).json(new ApiResponse(200, {}, "Workspace deleted"));
});

// ── Workspace members ─────────────────────────────────────────────────
export const getWorkspaceMembers = asyncHandler(async (req, res) => {
  const members = await WorkspaceMember.find({ workspace: req.params.workspaceId })
    .populate("user", "username email fullName avatar isEmailVerified")
    .lean();
  return res.status(200).json(new ApiResponse(200, members, "Members fetched"));
});

export const addWorkspaceMember = asyncHandler(async (req, res) => {
  const { email, role } = req.body;

  const user = await User.findOne({ email });
  if (!user) throw new ApiError(404, "No user found with this email");

  const existing = await WorkspaceMember.findOne({
    user: user._id,
    workspace: req.params.workspaceId,
  });
  if (existing) throw new ApiError(409, "User is already a member of this workspace");

  const member = await WorkspaceMember.create({
    user: user._id,
    workspace: req.params.workspaceId,
    role,
  });

  await Activity.create({
    workspace: req.params.workspaceId,
    actor: req.user._id,
    type: ActivityTypeEnum.MEMBER_ADDED,
    message: `${req.user.username} added ${user.username} to the workspace`,
  });

  return res.status(201).json(new ApiResponse(201, member, "Member added"));
});

export const updateWorkspaceMemberRole = asyncHandler(async (req, res) => {
  const { role } = req.body;
  const member = await WorkspaceMember.findOneAndUpdate(
    { workspace: req.params.workspaceId, user: req.params.userId },
    { $set: { role } },
    { new: true }
  );
  if (!member) throw new ApiError(404, "Member not found");
  return res.status(200).json(new ApiResponse(200, member, "Member role updated"));
});

export const removeWorkspaceMember = asyncHandler(async (req, res) => {
  const member = await WorkspaceMember.findOneAndDelete({
    workspace: req.params.workspaceId,
    user: req.params.userId,
  });
  if (!member) throw new ApiError(404, "Member not found");

  await Activity.create({
    workspace: req.params.workspaceId,
    actor: req.user._id,
    type: ActivityTypeEnum.MEMBER_REMOVED,
    message: `${req.user.username} removed a member from the workspace`,
  });

  return res.status(200).json(new ApiResponse(200, {}, "Member removed"));
});

// ── Workspace stats (for dashboard StatsGrid) ────────────────────────
export const getWorkspaceStats = asyncHandler(async (req, res) => {
  const { workspaceId } = req.params;

  const [projects, tasks] = await Promise.all([
    Project.find({ workspace: workspaceId }).lean(),
    Task.find({ workspace: workspaceId }).lean(),
  ]);

  const now = new Date();

  const stats = {
    totalProjects: projects.length,
    activeProjects: projects.filter(
      (p) => p.status !== "CANCELLED" && p.status !== "COMPLETED"
    ).length,
    completedProjects: projects.filter((p) => p.status === "COMPLETED").length,
    totalTasks: tasks.length,
    myTasks: tasks.filter(
      (t) => t.assignee?.toString() === req.user._id.toString()
    ).length,
    overdueIssues: tasks.filter(
      (t) => t.due_date && new Date(t.due_date) < now && t.status !== "DONE"
    ).length,
    completedTasks: tasks.filter((t) => t.status === "DONE").length,
  };

  return res.status(200).json(new ApiResponse(200, stats, "Stats fetched"));
});

// ── Activity feed ────────────────────────────────────────────────────
export const getWorkspaceActivity = asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit) || 20;

  const activities = await Activity.find({ workspace: req.params.workspaceId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate("actor", "username avatar")
    .populate("project", "name")
    .populate("task", "title")
    .lean();

  return res.status(200).json(new ApiResponse(200, activities, "Activity fetched"));
});
