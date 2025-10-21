import axiosClient from "../../../../../services/api/axios/axiosClient";
export async function uploadPulmoReport(patientId, reportFile) {
  const formData = new FormData();
  formData.append("patientId", patientId);
  formData.append("report", reportFile);
  const response = await axiosClient.post("/pulmo/upload-report", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
}
