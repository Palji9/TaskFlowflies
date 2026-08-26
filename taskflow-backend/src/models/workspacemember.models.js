import mongoose, { Schema } from "mongoose";
import { AvailableWorkspaceRoles, WorkspaceRolesEnum } from "../utils/constants.js";

const workspaceMemberSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    workspace: { type: Schema.Types.ObjectId, ref: "Workspace", required: true },
    role: {
      type: String,
      enum: AvailableWorkspaceRoles,
      default: WorkspaceRolesEnum.MEMBER,
    },
  },
  { timestamps: true }
);

workspaceMemberSchema.index({ user: 1, workspace: 1 }, { unique: true });

export const WorkspaceMember = mongoose.model("WorkspaceMember", workspaceMemberSchema);
