import axiosClient from "../../../../../services/api/axios/axiosClient";
import { executeWithRetry } from "../../../../../utils/retryHelper";

export async function uploadPulmoReport(patientId, reportFile) {
  const formData = new FormData();
  formData.append("patientId", patientId);
  formData.append("report", reportFile);
  const response = await executeWithRetry(
    () =>
      axiosClient.post("/pulmo/upload-report", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      }),
    { maxRetries: 3, delayMs: 1500 }
  );
  return response.data;
}
