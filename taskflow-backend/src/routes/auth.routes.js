import { Router } from "express";
import {
  registerUser, loginUser, logoutUser, getCurrentUser,
  verifyEmail, resendEmailVerification, refreshAccessToken,
  forgotPasswordRequest, resetForgottenPassword, changeCurrentPassword,
} from "../controllers/auth.controllers.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";
import { validate } from "../middlewares/validator.middlewares.js";
import {
  userRegisterValidator, userLoginValidator,
  userForgotPasswordValidator, userResetForgottenPasswordValidator,
  userChangeCurrentPasswordValidator,
} from "../validators/auth.validators.js";

const router = Router();

router.post("/register", userRegisterValidator(), validate, registerUser);
router.post("/login", userLoginValidator(), validate, loginUser);
router.get("/verify-email/:verificationToken", verifyEmail);
router.post("/refresh-token", refreshAccessToken);
router.post("/forgot-password", userForgotPasswordValidator(), validate, forgotPasswordRequest);
router.post("/reset-password/:resetToken", userResetForgottenPasswordValidator(), validate, resetForgottenPassword);

// Protected
router.post("/logout", verifyJWT, logoutUser);
router.get("/current-user", verifyJWT, getCurrentUser);
router.post("/resend-email-verification", verifyJWT, resendEmailVerification);
router.post("/change-password", verifyJWT, userChangeCurrentPasswordValidator(), validate, changeCurrentPassword);

export default router;
