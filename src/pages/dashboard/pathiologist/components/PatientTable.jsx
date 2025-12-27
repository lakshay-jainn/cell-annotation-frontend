import { useState } from "react";
import StatusBadge from "../../../../components/ui/StatusBadge.jsx";
import Papa from "papaparse";
import axiosClient from "../../../../services/api/axios/axiosClient";
import toast from "react-hot-toast";

const PatientTable = ({
  patients,
  loading,
  error,
  onPatientClick,
  onRetry,
}) => {
  // Log patients to check available fields including uploaded date
  console.log("Patients data:", patients);

  const [downloadingReports, setDownloadingReports] = useState(new Set());

  const handleDownloadReport = async (patient) => {
    if (!patient.annotation_completed) {
      return;
    }

    setDownloadingReports((prev) => new Set(prev).add(patient.patient_id));

    try {
      const response = await axiosClient.get(
        `/patient/${patient.patient_id}/download-report`,
        {
          responseType: "blob",
        }
      );

      // Create blob link to download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;

      // Extract filename from response headers or use default
      const contentDisposition = response.headers["content-disposition"];
      let filename = `patient_${patient.user_typed_id}_report.csv`;

      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }

      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to download report:", error);
      toast.error("Failed to download report. Please try again.");
    } finally {
      setDownloadingReports((prev) => {
        const newSet = new Set(prev);
        newSet.delete(patient.patient_id);
        return newSet;
      });
    }
  };

  const handleRowClick = (patient) => {
    if (patient.annotation_completed) {
      return;
    }
    onPatientClick(patient);
  };

  const getProgressColor = (percentage) => {
    if (percentage === 100) return "bg-green-500";
    if (percentage >= 50) return "bg-yellow-500";
    return "bg-blue-500";
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center py-12 space-y-4">
        <div className="text-red-500">
          <svg
            className="w-12 h-12"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <p className="text-slate-600 text-sm">Failed to load patients</p>
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
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
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
              Patient ID
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
              Uploaded At
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
              Progress
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
              Annotation Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
              Slides Count
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
              Cell Summary
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
              Download Report
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-slate-200">
          {patients.map((patient) => (
            <tr
              key={patient.patient_id}
              className={`hover:bg-slate-50 ${
                patient.annotation_completed ? "" : "cursor-pointer"
              } transition-colors`}
              onClick={() => handleRowClick(patient)}
            >
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div
                    className={`text-sm font-medium ${
                      patient.annotation_completed
                        ? "text-slate-800"
                        : "text-blue-600"
                    }`}
                  >
                    {`...${patient.patient_id.slice(-5)}`}
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                {patient.uploaded_at || patient.created_at
                  ? new Date(
                      patient.uploaded_at || patient.created_at
                    ).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  : "N/A"}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="w-full bg-gray-200 rounded-full h-2 mr-3">
                    <div
                      className={`h-2 rounded-full ${getProgressColor(
                        patient.progress_percentage
                      )}`}
                      style={{ width: `${patient.progress_percentage}%` }}
                    ></div>
                  </div>
                  <div className="text-sm text-slate-600 min-w-[60px]">
                    {Math.round(patient.progress_percentage)}%
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <StatusBadge
                  status={
                    patient.annotation_completed ? "Completed" : "In Progress"
                  }
                />
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                {patient.annotated_samples} / {patient.total_samples}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                {patient.cell_summary ? (
                  <div className="flex flex-col">
                    <div className="text-sm font-medium text-slate-800">
                      {patient.cell_summary.total_cells} cells
                    </div>
                    <div className="text-xs text-slate-600">
                      {patient.cell_summary.cell_types} types
                    </div>
                  </div>
                ) : (
                  <span className="text-slate-400">-</span>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                {patient.annotation_completed ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownloadReport(patient);
                    }}
                    disabled={downloadingReports.has(patient.patient_id)}
                    className="cursor-pointer px-3 py-2 bg-green-100 text-green-800 rounded-xl font-semibold hover:bg-green-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
                  >
                    {downloadingReports.has(patient.patient_id) ? (
                      <>
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-green-800"></div>
                        <span>Downloading...</span>
                      </>
                    ) : (
                      <>
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
                            d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                        <span>Download</span>
                      </>
                    )}
                  </button>
                ) : (
                  "N/A"
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PatientTable;
