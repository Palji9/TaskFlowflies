import { WorkspaceMember } from "../models/workspacemember.models.js";
import { ProjectMember } from "../models/projectmember.models.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

/**
 * Verifies the user is a member of req.params.workspaceId.
 * Optionally restricts to given workspace roles.
 */
export const validateWorkspacePermission = (roles = []) =>
  asyncHandler(async (req, _res, next) => {
    const { workspaceId } = req.params;
    if (!workspaceId) throw new ApiError(400, "Workspace id is missing");

    const membership = await WorkspaceMember.findOne({
      workspace: workspaceId,
      user: req.user._id,
    });

    if (!membership) throw new ApiError(403, "You are not a member of this workspace");

    req.workspaceMember = membership;

    if (roles.length && !roles.includes(membership.role)) {
      throw new ApiError(403, "You do not have permission to perform this action");
    }

    next();
  });

/**
 * Verifies the user is a member of req.params.projectId.
 * Optionally restricts to given project roles.
 */
export const validateProjectPermission = (roles = []) =>
  asyncHandler(async (req, _res, next) => {
    const { projectId } = req.params;
    if (!projectId) throw new ApiError(400, "Project id is missing");

    const membership = await ProjectMember.findOne({
      project: projectId,
      user: req.user._id,
    });

    if (!membership) throw new ApiError(403, "You are not a member of this project");

    req.projectMember = membership;

    if (roles.length && !roles.includes(membership.role)) {
      throw new ApiError(403, "You do not have permission to perform this action");
    }

    next();
  });
