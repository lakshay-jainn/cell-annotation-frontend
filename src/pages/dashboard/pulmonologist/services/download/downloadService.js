import axiosClient from "../../../../../services/api/axios/axiosClient";

export async function downloadPulmoReport(patientId) {
  const response = await axiosClient.get(`/pulmo/${patientId}/report`);
  // Expect response.data.url to be the download URL
  return response.data.report_url;
}
