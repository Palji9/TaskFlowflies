import crypto from "crypto";
import jwt from "jsonwebtoken";
import { User } from "../models/user.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  sendEmail,
  emailVerificationMailgenContent,
  forgotPasswordMailgenContent,
} from "../utils/mail.js";

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
};

const generateTokens = async (userId) => {
  const user = await User.findById(userId);
  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();
  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });
  return { accessToken, refreshToken };
};

export const registerUser = asyncHandler(async (req, res) => {
  const { email, username, password, fullName } = req.body;

  const existing = await User.findOne({ $or: [{ username }, { email }] });
  if (existing) throw new ApiError(409, "User with this email or username already exists");

  const user = await User.create({ email, username, password, fullName, isEmailVerified: false });

  const { unHashedToken, hashedToken, tokenExpiry } = user.generateTemporaryToken();
  user.emailVerificationToken = hashedToken;
  user.emailVerificationExpiry = tokenExpiry;
  await user.save({ validateBeforeSave: false });

  const verificationUrl = `${req.protocol}://${req.get("host")}/api/v1/auth/verify-email/${unHashedToken}`;
  await sendEmail({
    email: user.email,
    subject: "Verify your email — TaskFlow",
    mailgenContent: emailVerificationMailgenContent(user.username, verificationUrl),
  });

  const created = await User.findById(user._id).select(
    "-password -refreshToken -emailVerificationToken -emailVerificationExpiry"
  );

  return res.status(201).json(
    new ApiResponse(201, { user: created }, "Registered successfully. Please verify your email.")
  );
});

export const loginUser = asyncHandler(async (req, res) => {
  const { email, username, password } = req.body;
  if (!email && !username) throw new ApiError(400, "Email or username is required");

  const user = await User.findOne({ $or: [{ username }, { email }] });
  if (!user) throw new ApiError(404, "User does not exist");

  const valid = await user.isPasswordCorrect(password);
  if (!valid) throw new ApiError(401, "Invalid credentials");

  const { accessToken, refreshToken } = await generateTokens(user._id);

  const loggedIn = await User.findById(user._id).select(
    "-password -refreshToken -emailVerificationToken -emailVerificationExpiry"
  );

  return res
    .status(200)
    .cookie("accessToken", accessToken, cookieOptions)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .json(new ApiResponse(200, { user: loggedIn, accessToken, refreshToken }, "Logged in successfully"));
});

export const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, { $unset: { refreshToken: 1 } });
  return res
    .status(200)
    .clearCookie("accessToken", cookieOptions)
    .clearCookie("refreshToken", cookieOptions)
    .json(new ApiResponse(200, {}, "Logged out"));
});

export const getCurrentUser = asyncHandler(async (req, res) => {
  return res.status(200).json(new ApiResponse(200, req.user, "Current user fetched"));
});

export const verifyEmail = asyncHandler(async (req, res) => {
  const { verificationToken } = req.params;
  if (!verificationToken) throw new ApiError(400, "Verification token is missing");

  const hashedToken = crypto.createHash("sha256").update(verificationToken).digest("hex");
  const user = await User.findOne({
    emailVerificationToken: hashedToken,
    emailVerificationExpiry: { $gt: Date.now() },
  });

  if (!user) throw new ApiError(400, "Token is invalid or expired");

  user.emailVerificationToken = undefined;
  user.emailVerificationExpiry = undefined;
  user.isEmailVerified = true;
  await user.save({ validateBeforeSave: false });

  return res.status(200).json(new ApiResponse(200, { isEmailVerified: true }, "Email verified successfully"));
});

export const resendEmailVerification = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) throw new ApiError(404, "User not found");
  if (user.isEmailVerified) throw new ApiError(409, "Email is already verified");

  const { unHashedToken, hashedToken, tokenExpiry } = user.generateTemporaryToken();
  user.emailVerificationToken = hashedToken;
  user.emailVerificationExpiry = tokenExpiry;
  await user.save({ validateBeforeSave: false });

  const verificationUrl = `${req.protocol}://${req.get("host")}/api/v1/auth/verify-email/${unHashedToken}`;
  await sendEmail({
    email: user.email,
    subject: "Verify your email — TaskFlow",
    mailgenContent: emailVerificationMailgenContent(user.username, verificationUrl),
  });

  return res.status(200).json(new ApiResponse(200, {}, "Verification email resent"));
});

export const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingToken = req.cookies.refreshToken || req.body.refreshToken;
  if (!incomingToken) throw new ApiError(401, "Unauthorized request");

  try {
    const decoded = jwt.verify(incomingToken, process.env.REFRESH_TOKEN_SECRET);
    const user = await User.findById(decoded?._id);
    if (!user || incomingToken !== user.refreshToken)
      throw new ApiError(401, "Refresh token is expired or already used");

    const { accessToken, refreshToken } = await generateTokens(user._id);

    return res
      .status(200)
      .cookie("accessToken", accessToken, cookieOptions)
      .cookie("refreshToken", refreshToken, cookieOptions)
      .json(new ApiResponse(200, { accessToken, refreshToken }, "Access token refreshed"));
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid refresh token");
  }
});

export const forgotPasswordRequest = asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) throw new ApiError(404, "User does not exist");

  const { unHashedToken, hashedToken, tokenExpiry } = user.generateTemporaryToken();
  user.forgotPasswordToken = hashedToken;
  user.forgotPasswordExpiry = tokenExpiry;
  await user.save({ validateBeforeSave: false });

  const resetUrl = `${process.env.FORGOT_PASSWORD_REDIRECT_URL}/${unHashedToken}`;
  await sendEmail({
    email: user.email,
    subject: "Password reset request — TaskFlow",
    mailgenContent: forgotPasswordMailgenContent(user.username, resetUrl),
  });

  return res.status(200).json(new ApiResponse(200, {}, "Password reset email sent"));
});

export const resetForgottenPassword = asyncHandler(async (req, res) => {
  const hashedToken = crypto.createHash("sha256").update(req.params.resetToken).digest("hex");
  const user = await User.findOne({
    forgotPasswordToken: hashedToken,
    forgotPasswordExpiry: { $gt: Date.now() },
  });

  if (!user) throw new ApiError(400, "Token is invalid or expired");

  user.forgotPasswordToken = undefined;
  user.forgotPasswordExpiry = undefined;
  user.password = req.body.newPassword;
  await user.save({ validateBeforeSave: false });

  return res.status(200).json(new ApiResponse(200, {}, "Password reset successfully"));
});

export const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id);
  const valid = await user.isPasswordCorrect(oldPassword);
  if (!valid) throw new ApiError(400, "Old password is incorrect");
  user.password = newPassword;
  await user.save({ validateBeforeSave: false });
  return res.status(200).json(new ApiResponse(200, {}, "Password changed successfully"));
});
