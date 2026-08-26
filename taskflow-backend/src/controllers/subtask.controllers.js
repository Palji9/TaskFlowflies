import { SubTask } from "../models/subtask.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const buildAttachments = (files = []) =>
  files.map((f) => ({ url: `/images/${f.filename}`, mimetype: f.mimetype, size: f.size }));

export const createSubTask = asyncHandler(async (req, res) => {
  const subtask = await SubTask.create({
    title: req.body.title,
    task: req.params.taskId,
    createdBy: req.user._id,
    attachments: buildAttachments(req.files),
  });
  return res.status(201).json(new ApiResponse(201, subtask, "Subtask created"));
});

export const updateSubTask = asyncHandler(async (req, res) => {
  const { title, isCompleted } = req.body;
  const subtask = await SubTask.findById(req.params.subTaskId);
  if (!subtask) throw new ApiError(404, "Subtask not found");

  if (title !== undefined) subtask.title = title;
  if (isCompleted !== undefined) subtask.isCompleted = isCompleted;
  if (req.files?.length) subtask.attachments.push(...buildAttachments(req.files));

  await subtask.save();
  return res.status(200).json(new ApiResponse(200, subtask, "Subtask updated"));
});

export const deleteSubTask = asyncHandler(async (req, res) => {
  const subtask = await SubTask.findByIdAndDelete(req.params.subTaskId);
  if (!subtask) throw new ApiError(404, "Subtask not found");
  return res.status(200).json(new ApiResponse(200, {}, "Subtask deleted"));
});
