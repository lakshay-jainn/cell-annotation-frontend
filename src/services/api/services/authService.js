import axiosClient from "../axios/axiosClient";
import { executeWithRetry } from "../../../utils/retryHelper";

export async function SigninAPI(data) {
  const response = await executeWithRetry(
    () => axiosClient.post("/login", data),
    { maxRetries: 3, delayMs: 1500 }
  );

  return response.data;
}

export async function SignupAPI(data) {
  const response = await executeWithRetry(
    () => axiosClient.post("/register", data),
    { maxRetries: 3, delayMs: 1500 }
  );

  return response.data;
}
