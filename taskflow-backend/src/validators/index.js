import { body } from "express-validator";
import {
  AvailableWorkspaceRoles, AvailableProjectRoles,
  AvailableProjectStatuses, AvailableTaskStatuses,
  AvailableTaskTypes, AvailableTaskPriorities,
} from "../utils/constants.js";

export const workspaceValidator = () => [
  body("name").trim().notEmpty().withMessage("Workspace name is required"),
  body("description").optional().trim(),
];

export const addWorkspaceMemberValidator = () => [
  body("email").isEmail().withMessage("Valid email is required"),
  body("role").isIn(AvailableWorkspaceRoles).withMessage("Invalid role"),
];

export const projectValidator = () => [
  body("name").trim().notEmpty().withMessage("Project name is required"),
  body("description").optional().trim(),
  body("status").optional().isIn(AvailableProjectStatuses).withMessage("Invalid project status"),
  body("priority").optional().isIn(AvailableTaskPriorities).withMessage("Invalid priority"),
  body("start_date").optional().isISO8601().withMessage("start_date must be a valid date"),
  body("end_date").optional().isISO8601().withMessage("end_date must be a valid date"),
  body("progress").optional().isInt({ min: 0, max: 100 }).withMessage("progress must be 0-100"),
];

export const addProjectMemberValidator = () => [
  body("email").isEmail().withMessage("Valid email is required"),
  body("role").isIn(AvailableProjectRoles).withMessage("Invalid role"),
];

export const taskValidator = () => [
  body("title").trim().notEmpty().withMessage("Task title is required"),
  body("description").optional().trim(),
  body("status").optional().isIn(AvailableTaskStatuses).withMessage("Invalid task status"),
  body("type").optional().isIn(AvailableTaskTypes).withMessage("Invalid task type"),
  body("priority").optional().isIn(AvailableTaskPriorities).withMessage("Invalid task priority"),
  body("due_date").optional().isISO8601().withMessage("due_date must be a valid ISO date"),
  body("assignee").optional().isMongoId().withMessage("assignee must be a valid user id"),
];

export const subtaskValidator = () => [
  body("title").trim().notEmpty().withMessage("Subtask title is required"),
];

export const noteValidator = () => [
  body("content").trim().notEmpty().withMessage("Note content is required"),
];
