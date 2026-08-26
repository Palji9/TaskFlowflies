import { Project } from "../models/project.models.js";
import { ProjectMember } from "../models/projectmember.models.js";
import { WorkspaceMember } from "../models/workspacemember.models.js";
import { Task } from "../models/task.models.js";
import { Activity } from "../models/activity.models.js";
import { User } from "../models/user.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ProjectRolesEnum, ActivityTypeEnum } from "../utils/constants.js";

export const getProjects = asyncHandler(async (req, res) => {
  const { workspaceId } = req.params;

  const memberships = await ProjectMember.find({ user: req.user._id }).lean();
  const projectIds = memberships.map((m) => m.project);

  const projects = await Project.find({
    workspace: workspaceId,
    _id: { $in: projectIds },
  }).lean();

  const roleMap = {};
  memberships.forEach((m) => {
    roleMap[m.project.toString()] = m.role;
  });

  const withRoles = projects.map((p) => ({
    ...p,
    role: roleMap[p._id.toString()],
  }));

  return res.status(200).json(new ApiResponse(200, withRoles, "Projects fetched"));
});

export const getProjectById = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.projectId).lean();
  if (!project) throw new ApiError(404, "Project not found");

  const [tasks, members] = await Promise.all([
    Task.find({ project: project._id })
      .populate("assignee", "username avatar fullName")
      .populate("createdBy", "username")
      .lean(),
    ProjectMember.find({ project: project._id })
      .populate("user", "username email fullName avatar")
      .lean(),
  ]);

  return res.status(200).json(
    new ApiResponse(200, { ...project, tasks, members }, "Project fetched")
  );
});

export const createProject = asyncHandler(async (req, res) => {
  const { name, description, status } = req.body;
  const { workspaceId } = req.params;

  const project = await Project.create({
    name,
    description,
    status,
    workspace: workspaceId,
    createdBy: req.user._id,
  });

  // Creator becomes project admin
  await ProjectMember.create({
    user: req.user._id,
    project: project._id,
    role: ProjectRolesEnum.ADMIN,
  });

  await Activity.create({
    workspace: workspaceId,
    project: project._id,
    actor: req.user._id,
    type: ActivityTypeEnum.PROJECT_CREATED,
    message: `${req.user.username} created project "${project.name}"`,
  });

  return res.status(201).json(new ApiResponse(201, project, "Project created"));
});

export const updateProject = asyncHandler(async (req, res) => {
  const { name, description, status } = req.body;

  const project = await Project.findByIdAndUpdate(
    req.params.projectId,
    { $set: { name, description, status } },
    { new: true }
  );
  if (!project) throw new ApiError(404, "Project not found");

  await Activity.create({
    workspace: project.workspace,
    project: project._id,
    actor: req.user._id,
    type: ActivityTypeEnum.PROJECT_UPDATED,
    message: `${req.user.username} updated project "${project.name}"`,
  });

  return res.status(200).json(new ApiResponse(200, project, "Project updated"));
});

export const deleteProject = asyncHandler(async (req, res) => {
  const project = await Project.findByIdAndDelete(req.params.projectId);
  if (!project) throw new ApiError(404, "Project not found");

  await Promise.all([
    ProjectMember.deleteMany({ project: project._id }),
    Task.deleteMany({ project: project._id }),
  ]);

  await Activity.create({
    workspace: project.workspace,
    actor: req.user._id,
    type: ActivityTypeEnum.PROJECT_DELETED,
    message: `${req.user.username} deleted project "${project.name}"`,
  });

  return res.status(200).json(new ApiResponse(200, {}, "Project deleted"));
});

export const getProjectMembers = asyncHandler(async (req, res) => {
  const members = await ProjectMember.find({ project: req.params.projectId })
    .populate("user", "username email fullName avatar")
    .lean();
  return res.status(200).json(new ApiResponse(200, members, "Members fetched"));
});

export const addProjectMember = asyncHandler(async (req, res) => {
  const { email, role } = req.body;

  const user = await User.findOne({ email });
  if (!user) throw new ApiError(404, "No user found with this email");

  // User must be a workspace member first
  const project = await Project.findById(req.params.projectId);
  const wsm = await WorkspaceMember.findOne({
    user: user._id,
    workspace: project.workspace,
  });
  if (!wsm) throw new ApiError(400, "User must be a workspace member before being added to a project");

  const existing = await ProjectMember.findOne({
    user: user._id,
    project: req.params.projectId,
  });
  if (existing) throw new ApiError(409, "User is already a member of this project");

  const member = await ProjectMember.create({
    user: user._id,
    project: req.params.projectId,
    role,
  });

  await Activity.create({
    workspace: project.workspace,
    project: project._id,
    actor: req.user._id,
    type: ActivityTypeEnum.MEMBER_ADDED,
    message: `${req.user.username} added ${user.username} to project "${project.name}"`,
  });

  return res.status(201).json(new ApiResponse(201, member, "Member added"));
});

export const updateProjectMemberRole = asyncHandler(async (req, res) => {
  const { role } = req.body;
  const member = await ProjectMember.findOneAndUpdate(
    { project: req.params.projectId, user: req.params.userId },
    { $set: { role } },
    { new: true }
  );
  if (!member) throw new ApiError(404, "Member not found");
  return res.status(200).json(new ApiResponse(200, member, "Role updated"));
});

export const removeProjectMember = asyncHandler(async (req, res) => {
  const member = await ProjectMember.findOneAndDelete({
    project: req.params.projectId,
    user: req.params.userId,
  });
  if (!member) throw new ApiError(404, "Member not found");

  const project = await Project.findById(req.params.projectId);
  await Activity.create({
    workspace: project.workspace,
    project: project._id,
    actor: req.user._id,
    type: ActivityTypeEnum.MEMBER_REMOVED,
    message: `${req.user.username} removed a member from project "${project.name}"`,
  });

  return res.status(200).json(new ApiResponse(200, {}, "Member removed"));
});
