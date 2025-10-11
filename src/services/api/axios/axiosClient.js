import axios from "axios";
import { logout } from "./authBridge";

const axiosClient = axios.create({
  baseURL: "http://54.197.100.41:8000/api/v1",
  timeout: 120000, // 120 second timeout (increased for image processing APIs)
});

axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle token expiration
    if (error.response?.data?.token === false) {
      logout(); // Trigger logout on unauthorized access
      return Promise.reject(error);
    }

    // Enhance error object with more context
    if (error.response) {
      // Server responded with error status
      const enhancedError = {
        ...error,
        message: error.response.data?.message || error.message,
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
      };
      return Promise.reject(enhancedError);
    } else if (error.request) {
      // Network error - no response received
      const networkError = {
        ...error,
        message: "Network error - please check your internet connection",
        type: "network",
      };
      return Promise.reject(networkError);
    } else {
      // Something else happened
      const unknownError = {
        ...error,
        message: error.message || "An unexpected error occurred",
        type: "unknown",
      };
      return Promise.reject(unknownError);
    }
  }
);

export default axiosClient;
