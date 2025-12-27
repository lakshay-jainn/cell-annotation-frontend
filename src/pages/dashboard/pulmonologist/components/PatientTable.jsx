import { useState } from "react";

export default function PatientTable({
  patients,
  loading,
  error,
  onUploadReport,
  onDownloadReport,
  onRetry,
}) {
  // Log patients to check available fields including uploaded date
  console.log("Pulmo Patients data:", patients);

  const [downloading, setDownloading] = useState(new Set());

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
        <p className="text-slate-600 text-sm">{error}</p>
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
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
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  // ...existing code...

  const hasPatients = Array.isArray(patients) && patients.length > 0;
  return (
    <div className="flex justify-center">
      <div className="w-full max-w-3xl">
        {hasPatients ? (
          <table className="w-full border  border-slate-300 rounded-lg shadow-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-center text-xs font-bold text-slate-700 uppercase tracking-wider border-b border-slate-300">
                  Patient ID
                </th>
                <th className="px-6 py-3 text-center text-xs font-bold text-slate-700 uppercase tracking-wider border-b border-slate-300">
                  Uploaded At
                </th>
                <th className="px-6 py-3 text-center text-xs font-bold text-slate-700 uppercase tracking-wider border-b border-slate-300">
                  Images
                </th>
                <th className="px-6 py-3 text-center text-xs font-bold text-slate-700 uppercase tracking-wider border-b border-slate-300">
                  Final Report
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {patients.map((patient) => (
                <tr
                  key={patient.user_typed_id}
                  className="hover:bg-slate-50 transition-colors"
                >
                  <td className="px-6 py-4 text-center border-b border-slate-200 text-sm font-medium text-blue-700 break-all max-w-xs">
                    {patient.user_typed_id}
                  </td>
                  <td className="px-6 py-4 text-center border-b border-slate-200 text-sm text-slate-900">
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
                  <td className="px-6 py-4 text-center border-b border-slate-200 text-sm text-slate-900">
                    {patient.total_samples}
                  </td>
                  <td className="px-6 py-4 text-center border-b border-slate-200 text-sm text-slate-900">
                    {!patient.pulmonologist_report_s3_key ? (
                      <button
                        onClick={() => onUploadReport(patient)}
                        className="px-3 py-2 bg-blue-100 text-blue-800 rounded-xl font-semibold hover:bg-blue-200 transition-colors border border-blue-300"
                      >
                        Enter Report
                      </button>
                    ) : (
                      <button
                        onClick={() =>
                          onDownloadReport(patient, setDownloading)
                        }
                        disabled={downloading.has(patient.patient_id)}
                        className="px-3 py-2 bg-green-100 text-green-800 rounded-xl font-semibold hover:bg-green-200 transition-colors border border-green-300 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {downloading.has(patient.patient_id)
                          ? "Downloading..."
                          : "View Report"}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="py-12 text-center text-slate-500 text-lg font-semibold">
            No patients found.
          </div>
        )}
      </div>
    </div>
  );
}
