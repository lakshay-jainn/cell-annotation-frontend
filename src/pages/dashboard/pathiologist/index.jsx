import { useState, useEffect } from "react";
import axiosClient from "../../../services/api/axios/axiosClient";
import useGlobalAuth from "../../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import PageHeader from "../../../components/ui/PageHeader.jsx";
import UserInfoCard from "../../../components/ui/UserInfoCard.jsx";
import PatientTable from "./components/PatientTable";
import Pagination from "../../../components/ui/Pagination.jsx";
import { toast } from "react-hot-toast";
import { executeWithRetry } from "../../../utils/retryHelper";
export default function PathiologistPage() {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPatients, setTotalPatients] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const { name, location, hospital, Logout } = useGlobalAuth();

  const fetchPatients = async (page) => {
    try {
      setLoading(true);
      setError(false);
      const response = await executeWithRetry(
        () => axiosClient.get(`/patients?page=${page}`),
        { maxRetries: 3, delayMs: 1500 }
      );
      console.log(response);
      const data = response.data;

      const patientsData = [...data.items];

      setPatients(patientsData);
      setCurrentPage(data.page);
      setTotalPages(data.pages);
      setTotalPatients(data.total);

      const completed = data.items.filter(
        (patient) => patient.annotation_completed
      ).length;
      setCompletedCount(completed);
    } catch (err) {
      console.error("Error fetching patients:", err);
      setError(true);
      toast.error("Failed to load patients. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    fetchPatients(currentPage);
  };

  useEffect(() => {
    fetchPatients(currentPage);
  }, [currentPage]);

  const handlePatientClick = (patient) => {
    if (!patient.annotation_completed) {
      // Navigate to patient annotation workflow
      window.location.href = `/patient/${patient.patient_id}/annotate`;
    }
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <PageHeader
        title="Pathologist Review System"
        subtitle="Patient Analysis & Diagnostic Review"
        backgroundColor="#166534"
        gradientTo="#16a34a"
      />

      <main className="flex-1 max-w-7xl mx-auto p-8 w-full">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
          <UserInfoCard
            name={name}
            hospital={hospital}
            location={location}
            accentColor="green"
          />
          <div className="flex justify-center sm:justify-end">
            <button
              onClick={Logout}
              className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center gap-2"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              Logout
            </button>
          </div>
        </div>

        <div className="mb-6 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-green-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800">
                Thank you pathologist for your valuable contribution
                {completedCount > 0 &&
                  `, you have completed ${completedCount} patient(s)`}
                !
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200">
            <h2 className="text-xl font-semibold text-slate-800">
              Patient Review Queue
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Click on any patient to view their slides for annotation •{" "}
              {totalPatients} total patients
            </p>
          </div>

          <PatientTable
            patients={patients}
            loading={loading}
            error={error}
            onPatientClick={handlePatientClick}
            onRetry={handleRetry}
          />

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalPatients}
            onPageChange={handlePageChange}
          />
        </div>
      </main>
    </div>
  );
}
