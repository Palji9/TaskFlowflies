import mongoose, { Schema } from "mongoose";
import { ActivityTypeEnum } from "../utils/constants.js";

const activitySchema = new Schema(
  {
    workspace: { type: Schema.Types.ObjectId, ref: "Workspace", required: true },
    project: { type: Schema.Types.ObjectId, ref: "Project", default: null },
    task: { type: Schema.Types.ObjectId, ref: "Task", default: null },
    actor: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: {
      type: String,
      enum: Object.values(ActivityTypeEnum),
      required: true,
    },
    // Human-readable description generated at creation time
    message: { type: String, required: true },
  },
  { timestamps: true }
);

// Only keep last 500 activities per workspace (TTL-style cleanup via index)
activitySchema.index({ workspace: 1, createdAt: -1 });

export const Activity = mongoose.model("Activity", activitySchema);
