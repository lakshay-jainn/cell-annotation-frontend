import { useEffect, useState, useCallback } from "react";
import axiosClient from "../services/api/axios/axiosClient";
import toast from "react-hot-toast";

export default function useFetchPatientsPulmo(currentPage) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [patients, setPatients] = useState(null);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPatients, setTotalPatients] = useState(0);

  const fetchPatients = useCallback(async (page, retryCount = 0) => {
    const maxRetries = 3;
    try {
      setLoading(true);
      setError(null);
      const response = await axiosClient.get(
        `/pulmo/patients?page=${page}&per_page=10`
      );
      console.log(response);
      const data = response.data;

      // Sort: patients with pulmonologist_report_s3_key === null at the top
      const patientsData = [...data.patients].sort((a, b) => {
        if (!a.pulmonologist_report_s3_key && b.pulmonologist_report_s3_key)
          return -1;
        if (a.pulmonologist_report_s3_key && !b.pulmonologist_report_s3_key)
          return 1;
        return 0;
      });

      setPatients(patientsData);
      setTotalPages(data.pages);
      setTotalPatients(data.total);
    } catch (err) {
      console.error("Error fetching patients:", err);
      if (retryCount < maxRetries) {
        toast.error(`Retrying... (${retryCount + 1}/${maxRetries})`);
        setTimeout(() => fetchPatients(page, retryCount + 1), 1500);
        return;
      }
      setError("Failed to load patients");
      toast.error("Failed to load patients. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPatients(currentPage);
  }, [currentPage, fetchPatients]);

  const retry = useCallback(() => {
    fetchPatients(currentPage);
  }, [currentPage, fetchPatients]);

  return { patients, totalPages, totalPatients, loading, error, retry };
}
