import { Router } from "express";
import { getTasks, getTaskById, createTask, updateTask, deleteTask } from "../controllers/task.controllers.js";
import { createSubTask, updateSubTask, deleteSubTask } from "../controllers/subtask.controllers.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";
import { validateProjectPermission } from "../middlewares/role.middlewares.js";
import { validate } from "../middlewares/validator.middlewares.js";
import { upload } from "../middlewares/multer.middlewares.js";
import { taskValidator, subtaskValidator } from "../validators/index.js";
import { ProjectRolesEnum } from "../utils/constants.js";

const router = Router({ mergeParams: true }); // inherits :workspaceId & :projectId
router.use(verifyJWT);

const member = validateProjectPermission([]);
const canManage = [ProjectRolesEnum.ADMIN, ProjectRolesEnum.PROJECT_ADMIN];

router.route("/")
  .get(member, getTasks)
  .post(member, upload.array("attachments", 5), taskValidator(), validate, createTask);

router.route("/:taskId")
  .get(member, getTaskById)
  .put(member, upload.array("attachments", 5), updateTask)
  .delete(validateProjectPermission(canManage), deleteTask);

router.route("/:taskId/subtasks")
  .post(member, upload.array("attachments", 5), subtaskValidator(), validate, createSubTask);

router.route("/:taskId/subtasks/:subTaskId")
  .put(member, upload.array("attachments", 5), updateSubTask)
  .delete(validateProjectPermission(canManage), deleteSubTask);

export default router;
