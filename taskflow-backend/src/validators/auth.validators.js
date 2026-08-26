import { body } from "express-validator";

export const userRegisterValidator = () => [
  body("email").trim().isEmail().withMessage("Valid email is required"),
  body("username").trim().notEmpty().withMessage("Username is required")
    .isLowercase().withMessage("Username must be lowercase")
    .isLength({ min: 3 }).withMessage("Username must be at least 3 characters"),
  body("password").trim().notEmpty().withMessage("Password is required")
    .isLength({ min: 8 }).withMessage("Password must be at least 8 characters"),
  body("fullName").optional().trim(),
];

export const userLoginValidator = () => [
  body("email").optional().isEmail().withMessage("Valid email is required"),
  body("username").optional().trim(),
  body("password").notEmpty().withMessage("Password is required"),
];

export const userForgotPasswordValidator = () => [
  body("email").isEmail().withMessage("Valid email is required"),
];

export const userResetForgottenPasswordValidator = () => [
  body("newPassword").notEmpty().withMessage("New password is required"),
];

export const userChangeCurrentPasswordValidator = () => [
  body("oldPassword").notEmpty().withMessage("Old password is required"),
  body("newPassword").notEmpty().withMessage("New password is required"),
];
