import { useState } from "react";

export default function PatientTable({
  patients,
  loading,
  error,
  onUploadReport,
  onDownloadReport,
}) {
  const [downloading, setDownloading] = useState(new Set());

  if (error) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="bg-red-100 text-red-700 px-6 py-4 rounded-lg font-semibold">
          {error}
        </div>
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
