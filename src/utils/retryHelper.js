/**
 * Retry helper utility for API calls
 * Implements exponential backoff with configurable retry attempts
 */

const DEFAULT_CONFIG = {
  maxRetries: 3,
  delayMs: 1500,
  backoffMultiplier: 1, // Set to > 1 for exponential backoff
};

/**
 * Executes an async function with automatic retry on failure
 * @param {Function} asyncFn - The async function to execute
 * @param {Object} config - Configuration object
 * @param {number} config.maxRetries - Maximum number of retries (default: 3)
 * @param {number} config.delayMs - Delay between retries in milliseconds (default: 1500)
 * @param {number} config.backoffMultiplier - Multiplier for exponential backoff (default: 1)
 * @returns {Promise} - Resolves with the result or rejects after all retries exhausted
 */
export async function executeWithRetry(asyncFn, config = DEFAULT_CONFIG) {
  const { maxRetries, delayMs, backoffMultiplier } = {
    ...DEFAULT_CONFIG,
    ...config,
  };

  let lastError;
  let currentDelay = delayMs;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await asyncFn();
    } catch (error) {
      lastError = error;

      // Don't retry if it's the last attempt
      if (attempt === maxRetries) {
        throw error;
      }

      // Wait before retrying
      console.log(
        `Retry attempt ${attempt + 1}/${maxRetries} after ${currentDelay}ms`
      );
      await new Promise((resolve) => setTimeout(resolve, currentDelay));

      // Increase delay for next attempt if using exponential backoff
      if (backoffMultiplier > 1) {
        currentDelay *= backoffMultiplier;
      }
    }
  }

  throw lastError;
}

/**
 * Higher-order function that wraps an async function with retry logic
 * @param {Function} asyncFn - The async function to wrap
 * @param {Object} config - Configuration object (same as executeWithRetry)
 * @returns {Function} - Wrapped function that includes retry logic
 */
export function withRetry(asyncFn, config = DEFAULT_CONFIG) {
  return async (...args) => {
    return executeWithRetry(() => asyncFn(...args), config);
  };
}
