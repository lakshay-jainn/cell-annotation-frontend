import { useEffect, useState } from "react";
import axiosClient from "../services/api/axios/axiosClient";
import toast from "react-hot-toast";

export default function useFetchPatientsPulmo(currentPage) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [patients, setPatients] = useState(null);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPatients, setTotalPatients] = useState(0);
  useEffect(() => {
    const fetchPatients = async (page) => {
      try {
        setLoading(true);
        const response = await axiosClient.get(`/pulmo/patients?page=${page}`);
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
      } catch (error) {
        // setError(error.message);
        console.error("Error fetching patients:", error);
        toast.error("Failed to load patients. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchPatients(currentPage);
  }, [currentPage]);
  return { patients, totalPages, totalPatients, loading, error };
}
