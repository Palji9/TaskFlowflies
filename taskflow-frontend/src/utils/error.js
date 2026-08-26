import toast from "react-hot-toast";

export const getErrorMessage = (error) =>
  error?.response?.data?.message || error?.message || "Something went wrong";

export const toastError = (error) => toast.error(getErrorMessage(error));
