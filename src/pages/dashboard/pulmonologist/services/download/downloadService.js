import axiosClient from "../../../../../services/api/axios/axiosClient";
import { executeWithRetry } from "../../../../../utils/retryHelper";

export async function downloadPulmoReport(patientId) {
  const response = await executeWithRetry(
    () => axiosClient.get(`/pulmo/${patientId}/report`),
    { maxRetries: 3, delayMs: 1500 }
  );
  // Expect response.data.url to be the download URL
  return response.data.report_url;
}
