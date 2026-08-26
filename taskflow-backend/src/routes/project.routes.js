import { Router } from "express";
import {
  getProjects, getProjectById, createProject,
  updateProject, deleteProject,
  getProjectMembers, addProjectMember,
  updateProjectMemberRole, removeProjectMember,
} from "../controllers/project.controllers.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";
import { validateWorkspacePermission, validateProjectPermission } from "../middlewares/role.middlewares.js";
import { validate } from "../middlewares/validator.middlewares.js";
import { projectValidator, addProjectMemberValidator } from "../validators/index.js";
import { WorkspaceRolesEnum, ProjectRolesEnum } from "../utils/constants.js";

const router = Router({ mergeParams: true }); // inherits :workspaceId from parent
router.use(verifyJWT);

const wsMember = validateWorkspacePermission([]);
const wsManager = validateWorkspacePermission([WorkspaceRolesEnum.OWNER, WorkspaceRolesEnum.ADMIN]);
const canManage = [ProjectRolesEnum.ADMIN, ProjectRolesEnum.PROJECT_ADMIN];

router.route("/")
  .get(wsMember, getProjects)
  .post(wsMember, projectValidator(), validate, createProject);

router.route("/:projectId")
  .get(validateProjectPermission([]), getProjectById)
  .put(validateProjectPermission(canManage), projectValidator(), validate, updateProject)
  .delete(validateProjectPermission([ProjectRolesEnum.ADMIN]), deleteProject);

router.route("/:projectId/members")
  .get(validateProjectPermission([]), getProjectMembers)
  .post(validateProjectPermission(canManage), addProjectMemberValidator(), validate, addProjectMember);

router.route("/:projectId/members/:userId")
  .put(validateProjectPermission(canManage), updateProjectMemberRole)
  .delete(validateProjectPermission(canManage), removeProjectMember);

export default router;
