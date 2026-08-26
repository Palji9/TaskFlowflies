import { ProjectNote } from "../models/note.models.js";
import { Project } from "../models/project.models.js";
import { Activity } from "../models/activity.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ActivityTypeEnum } from "../utils/constants.js";

export const getNotes = asyncHandler(async (req, res) => {
  const notes = await ProjectNote.find({ project: req.params.projectId })
    .populate("createdBy", "username avatar")
    .lean();
  return res.status(200).json(new ApiResponse(200, notes, "Notes fetched"));
});

export const createNote = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.projectId);
  const note = await ProjectNote.create({
    content: req.body.content,
    project: req.params.projectId,
    workspace: project.workspace,
    createdBy: req.user._id,
  });

  await Activity.create({
    workspace: project.workspace,
    project: project._id,
    actor: req.user._id,
    type: ActivityTypeEnum.NOTE_CREATED,
    message: `${req.user.username} added a note to project "${project.name}"`,
  });

  return res.status(201).json(new ApiResponse(201, note, "Note created"));
});

export const updateNote = asyncHandler(async (req, res) => {
  const note = await ProjectNote.findByIdAndUpdate(
    req.params.noteId,
    { $set: { content: req.body.content } },
    { new: true }
  );
  if (!note) throw new ApiError(404, "Note not found");
  return res.status(200).json(new ApiResponse(200, note, "Note updated"));
});

export const deleteNote = asyncHandler(async (req, res) => {
  const note = await ProjectNote.findByIdAndDelete(req.params.noteId);
  if (!note) throw new ApiError(404, "Note not found");
  return res.status(200).json(new ApiResponse(200, {}, "Note deleted"));
});
