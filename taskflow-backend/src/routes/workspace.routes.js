import { Router } from "express";
import {
  getWorkspaces, getWorkspaceById, createWorkspace,
  updateWorkspace, deleteWorkspace,
  getWorkspaceMembers, addWorkspaceMember,
  updateWorkspaceMemberRole, removeWorkspaceMember,
  getWorkspaceStats, getWorkspaceActivity,
} from "../controllers/workspace.controllers.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";
import { validateWorkspacePermission } from "../middlewares/role.middlewares.js";
import { validate } from "../middlewares/validator.middlewares.js";
import { workspaceValidator, addWorkspaceMemberValidator } from "../validators/index.js";
import { WorkspaceRolesEnum } from "../utils/constants.js";

const router = Router();
router.use(verifyJWT);

const ownerOrAdmin = [WorkspaceRolesEnum.OWNER, WorkspaceRolesEnum.ADMIN];

router.route("/").get(getWorkspaces).post(workspaceValidator(), validate, createWorkspace);

router.route("/:workspaceId")
  .get(validateWorkspacePermission([]), getWorkspaceById)
  .put(validateWorkspacePermission(ownerOrAdmin), workspaceValidator(), validate, updateWorkspace)
  .delete(validateWorkspacePermission([WorkspaceRolesEnum.OWNER]), deleteWorkspace);

router.get("/:workspaceId/stats", validateWorkspacePermission([]), getWorkspaceStats);
router.get("/:workspaceId/activity", validateWorkspacePermission([]), getWorkspaceActivity);

router.route("/:workspaceId/members")
  .get(validateWorkspacePermission([]), getWorkspaceMembers)
  .post(validateWorkspacePermission(ownerOrAdmin), addWorkspaceMemberValidator(), validate, addWorkspaceMember);

router.route("/:workspaceId/members/:userId")
  .put(validateWorkspacePermission(ownerOrAdmin), updateWorkspaceMemberRole)
  .delete(validateWorkspacePermission(ownerOrAdmin), removeWorkspaceMember);

export default router;
