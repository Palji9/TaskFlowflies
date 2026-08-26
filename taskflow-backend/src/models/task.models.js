import mongoose, { Schema } from "mongoose";
import {
  AvailableTaskStatuses, TaskStatusEnum,
  AvailableTaskTypes, TaskTypeEnum,
  AvailableTaskPriorities, TaskPriorityEnum,
} from "../utils/constants.js";

const taskSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    project: { type: Schema.Types.ObjectId, ref: "Project", required: true },
    workspace: { type: Schema.Types.ObjectId, ref: "Workspace", required: true },
    status: {
      type: String,
      enum: AvailableTaskStatuses,
      default: TaskStatusEnum.TODO,
    },
    type: {
      type: String,
      enum: AvailableTaskTypes,
      default: TaskTypeEnum.TASK,
    },
    priority: {
      type: String,
      enum: AvailableTaskPriorities,
      default: TaskPriorityEnum.MEDIUM,
    },
    due_date: { type: Date, default: null },
    assignee: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    attachments: {
      type: [{ url: String, mimetype: String, size: Number }],
      default: [],
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

export const Task = mongoose.model("Task", taskSchema);
