import mongoose, { Schema } from "mongoose";
import { AvailableProjectStatuses, ProjectStatusEnum, AvailableTaskPriorities, TaskPriorityEnum } from "../utils/constants.js";

const projectSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    workspace: { type: Schema.Types.ObjectId, ref: "Workspace", required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    status: { type: String, enum: AvailableProjectStatuses, default: ProjectStatusEnum.PLANNING },
    priority: { type: String, enum: AvailableTaskPriorities, default: TaskPriorityEnum.MEDIUM },
    start_date: { type: Date, default: null },
    end_date: { type: Date, default: null },
    progress: { type: Number, min: 0, max: 100, default: 0 },
  },
  { timestamps: true }
);

export const Project = mongoose.model("Project", projectSchema);
