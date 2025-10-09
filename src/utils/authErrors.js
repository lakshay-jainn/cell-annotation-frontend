/**
 * Utility function to handle authentication errors with user-friendly messages
 * @param {Error} error - The error object from the API call
 * @returns {string} - User-friendly error message
 */
export const getAuthErrorMessage = (error) => {
  // Handle network errors (no response)
  if (error.type === "network" || !error.response) {
    return "Network error. Please check your internet connection and try again.";
  }

  const { status, data } = error.response || error;

  // Handle different HTTP status codes
  switch (status) {
    case 400:
      // Bad Request - validation errors
      if (data?.message) {
        return data.message;
      }
      if (data?.errors && typeof data.errors === "object") {
        // Handle validation errors object
        const errorMessages = Object.values(data.errors).flat();
        return errorMessages.join(". ");
      }
      return "Invalid request. Please check your input and try again.";

    case 401:
      // Unauthorized - invalid credentials
      if (
        data?.message?.toLowerCase().includes("invalid") ||
        data?.message?.toLowerCase().includes("wrong") ||
        data?.message?.toLowerCase().includes("incorrect")
      ) {
        return "Invalid email or password. Please check your credentials.";
      }
      return "Authentication failed. Please check your credentials.";

    case 403:
      // Forbidden - account disabled or not verified
      if (
        data?.message?.toLowerCase().includes("disabled") ||
        data?.message?.toLowerCase().includes("suspended")
      ) {
        return "Your account has been disabled. Please contact support.";
      }
      if (
        data?.message?.toLowerCase().includes("verify") ||
        data?.message?.toLowerCase().includes("confirm")
      ) {
        return "Please verify your email address before logging in.";
      }
      return "Access denied. Please contact support if you believe this is an error.";

    case 404:
      // Not Found - user doesn't exist
      return "Account not found. Please check your email or register first.";

    case 409:
      // Conflict - account already exists (for registration)
      return "An account with this email already exists. Please try logging in instead.";

    case 422:
      // Unprocessable Entity - validation errors
      if (data?.errors && typeof data.errors === "object") {
        const errorMessages = Object.values(data.errors).flat();
        return errorMessages.join(". ");
      }
      if (data?.message) {
        return data.message;
      }
      return "Please check your input data and try again.";

    case 429:
      // Too Many Requests - rate limiting
      return "Too many attempts. Please wait a few minutes before trying again.";

    case 500:
    case 502:
    case 503:
    case 504:
      // Server errors
      return "Server error. Please try again later or contact support if the problem persists.";

    default:
      // Unknown error
      if (data?.message && typeof data.message === "string") {
        return data.message;
      }
      return "An unexpected error occurred. Please try again.";
  }
};

/**
 * Utility function to handle login-specific errors
 * @param {Error} error - The error object from login API call
 * @returns {string} - User-friendly error message for login
 */
export const getLoginErrorMessage = (error) => {
  // First try the general auth error handler
  const generalMessage = getAuthErrorMessage(error);

  // Add login-specific context if it's a generic message
  if (generalMessage === "An unexpected error occurred. Please try again.") {
    return "Login failed. Please check your credentials and try again.";
  }

  return generalMessage;
};

/**
 * Utility function to handle registration-specific errors
 * @param {Error} error - The error object from registration API call
 * @returns {string} - User-friendly error message for registration
 */
export const getRegisterErrorMessage = (error) => {
  // First try the general auth error handler
  const generalMessage = getAuthErrorMessage(error);

  // Handle registration-specific cases
  if (error.response?.status === 409) {
    return "An account with this email already exists. Please try logging in instead.";
  }

  // Add registration-specific context if it's a generic message
  if (generalMessage === "An unexpected error occurred. Please try again.") {
    return "Registration failed. Please check your information and try again.";
  }

  return generalMessage;
};
