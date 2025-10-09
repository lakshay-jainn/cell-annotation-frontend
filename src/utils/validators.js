// Form validation functions

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid email
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {Object} Validation result with isValid and errors
 */
export const validatePassword = (password) => {
  const errors = [];

  if (!password) {
    errors.push("Password is required");
  } else {
    if (password.length < 8) {
      errors.push("Password must be at least 8 characters long");
    }
    if (!/(?=.*[a-z])/.test(password)) {
      errors.push("Password must contain at least one lowercase letter");
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      errors.push("Password must contain at least one uppercase letter");
    }
    if (!/(?=.*\d)/.test(password)) {
      errors.push("Password must contain at least one number");
    }
    if (!/(?=.*[!@#$%^&*])/.test(password)) {
      errors.push(
        "Password must contain at least one special character (!@#$%^&*)"
      );
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validate required fields
 * @param {Object} data - Data object to validate
 * @param {Array} requiredFields - Array of required field names
 * @returns {Object} Validation result
 */
export const validateRequiredFields = (data, requiredFields) => {
  const errors = {};

  requiredFields.forEach((field) => {
    if (
      !data[field] ||
      (typeof data[field] === "string" && data[field].trim() === "")
    ) {
      errors[field] = `${field} is required`;
    }
  });

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Validate file type
 * @param {File} file - File to validate
 * @param {Array} allowedTypes - Array of allowed MIME types
 * @returns {boolean} True if valid file type
 */
export const isValidFileType = (file, allowedTypes) => {
  if (!file) return false;
  return allowedTypes.includes(file.type);
};

/**
 * Validate file size
 * @param {File} file - File to validate
 * @param {number} maxSizeInMB - Maximum file size in MB
 * @returns {boolean} True if valid file size
 */
export const isValidFileSize = (file, maxSizeInMB) => {
  if (!file) return false;
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
  return file.size <= maxSizeInBytes;
};

/**
 * Validate phone number format (basic)
 * @param {string} phone - Phone number to validate
 * @returns {boolean} True if valid phone format
 */
export const isValidPhone = (phone) => {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ""));
};
