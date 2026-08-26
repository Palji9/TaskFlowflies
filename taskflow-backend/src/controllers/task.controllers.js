import { Task } from "../models/task.models.js";
import { SubTask } from "../models/subtask.models.js";
import { Project } from "../models/project.models.js";
import { Activity } from "../models/activity.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ActivityTypeEnum } from "../utils/constants.js";

const buildAttachments = (files = []) =>
  files.map((f) => ({ url: `/images/${f.filename}`, mimetype: f.mimetype, size: f.size }));

export const getTasks = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const { status, type, priority, assignee } = req.query;

  const filter = { project: projectId };
  if (status) filter.status = status;
  if (type) filter.type = type;
  if (priority) filter.priority = priority;
  if (assignee) filter.assignee = assignee;

  const tasks = await Task.find(filter)
    .populate("assignee", "username fullName avatar")
    .populate("createdBy", "username")
    .lean();

  return res.status(200).json(new ApiResponse(200, tasks, "Tasks fetched"));
});

export const getTaskById = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.taskId)
    .populate("assignee", "username fullName avatar")
    .populate("createdBy", "username")
    .lean();

  if (!task) throw new ApiError(404, "Task not found");

  const subtasks = await SubTask.find({ task: task._id })
    .populate("createdBy", "username")
    .lean();

  return res.status(200).json(new ApiResponse(200, { task, subtasks }, "Task fetched"));
});

export const createTask = asyncHandler(async (req, res) => {
  const { title, description, status, type, priority, due_date, assignee } = req.body;
  const { projectId } = req.params;

  const project = await Project.findById(projectId);
  if (!project) throw new ApiError(404, "Project not found");

  const task = await Task.create({
    title, description, status, type, priority,
    due_date: due_date || null,
    assignee: assignee || null,
    project: projectId,
    workspace: project.workspace,
    createdBy: req.user._id,
    attachments: buildAttachments(req.files),
  });

  await Activity.create({
    workspace: project.workspace,
    project: projectId,
    task: task._id,
    actor: req.user._id,
    type: ActivityTypeEnum.TASK_CREATED,
    message: `${req.user.username} created task "${task.title}"`,
  });

  const populated = await Task.findById(task._id)
    .populate("assignee", "username fullName avatar")
    .lean();

  return res.status(201).json(new ApiResponse(201, populated, "Task created"));
});

export const updateTask = asyncHandler(async (req, res) => {
  const { title, description, status, type, priority, due_date, assignee } = req.body;

  const task = await Task.findById(req.params.taskId);
  if (!task) throw new ApiError(404, "Task not found");

  const previousStatus = task.status;

  if (title !== undefined) task.title = title;
  if (description !== undefined) task.description = description;
  if (status !== undefined) task.status = status;
  if (type !== undefined) task.type = type;
  if (priority !== undefined) task.priority = priority;
  if (due_date !== undefined) task.due_date = due_date;
  if (assignee !== undefined) task.assignee = assignee || null;
  if (req.files?.length) task.attachments.push(...buildAttachments(req.files));

  await task.save();

  const activityType =
    status && status !== previousStatus
      ? ActivityTypeEnum.TASK_STATUS_CHANGED
      : ActivityTypeEnum.TASK_UPDATED;

  const activityMessage =
    status && status !== previousStatus
      ? `${req.user.username} changed status of "${task.title}" from ${previousStatus} to ${status}`
      : `${req.user.username} updated task "${task.title}"`;

  await Activity.create({
    workspace: task.workspace,
    project: task.project,
    task: task._id,
    actor: req.user._id,
    type: activityType,
    message: activityMessage,
  });

  const populated = await Task.findById(task._id)
    .populate("assignee", "username fullName avatar")
    .lean();

  return res.status(200).json(new ApiResponse(200, populated, "Task updated"));
});

export const deleteTask = asyncHandler(async (req, res) => {
  const task = await Task.findByIdAndDelete(req.params.taskId);
  if (!task) throw new ApiError(404, "Task not found");

  await SubTask.deleteMany({ task: req.params.taskId });

  await Activity.create({
    workspace: task.workspace,
    project: task.project,
    actor: req.user._id,
    type: ActivityTypeEnum.TASK_DELETED,
    message: `${req.user.username} deleted task "${task.title}"`,
  });

  return res.status(200).json(new ApiResponse(200, {}, "Task deleted"));
});
