import { Router } from "express";
import { getNotes, createNote, updateNote, deleteNote } from "../controllers/note.controllers.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";
import { validateProjectPermission } from "../middlewares/role.middlewares.js";
import { validate } from "../middlewares/validator.middlewares.js";
import { noteValidator } from "../validators/index.js";
import { ProjectRolesEnum } from "../utils/constants.js";

const router = Router({ mergeParams: true });
router.use(verifyJWT);

const member = validateProjectPermission([]);
const canManage = [ProjectRolesEnum.ADMIN, ProjectRolesEnum.PROJECT_ADMIN];

router.route("/")
  .get(member, getNotes)
  .post(member, noteValidator(), validate, createNote);

router.route("/:noteId")
  .put(member, noteValidator(), validate, updateNote)
  .delete(validateProjectPermission(canManage), deleteNote);

export default router;
