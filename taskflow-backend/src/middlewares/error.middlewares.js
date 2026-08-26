import { ApiError } from "../utils/ApiError.js";

export const errorHandler = (err, req, res, next) => {
  let error = err;
  if (!(error instanceof ApiError)) {
    error = new ApiError(
      error.statusCode || 500,
      error.message || "Something went wrong",
      error?.errors || [],
      err.stack
    );
  }
  return res.status(error.statusCode).json({
    ...error,
    message: error.message,
    ...(process.env.NODE_ENV === "development" ? { stack: error.stack } : {}),
  });
};
