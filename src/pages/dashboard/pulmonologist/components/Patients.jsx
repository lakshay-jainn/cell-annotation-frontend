import { downloadPulmoReport } from "../services/download/downloadService";
import { useState, useEffect } from "react";
import Pagination from "../../../../components/ui/Pagination";
import PatientTable from "./PatientTable";
import useFetchPatientsPulmo from "../../../../hooks/useFetchPatientsPulmo";
import { uploadPulmoReport } from "../services/upload/uploadService";
import toast from "react-hot-toast";
export default function Patients() {
  const handleDownloadReport = async (patient, setDownloading) => {
    if (!patient.pulmonologist_report_s3_key) return;
    setDownloading((prev) => new Set(prev).add(patient.patient_id));
    try {
      const url = await downloadPulmoReport(patient.patient_id);
      if (url) {
        // Open in new tab or trigger download
        window.open(url, "_blank");
      } else {
        toast.error("No download URL received.");
      }
    } catch (error) {
      toast.error("Failed to download report. Please try again.");
    } finally {
      setDownloading((prev) => {
        const newSet = new Set(prev);
        newSet.delete(patient.patient_id);
        return newSet;
      });
    }
  };
  const [currentPage, setCurrentPage] = useState(1);
  const [patientsState, setPatientsState] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formPatient, setFormPatient] = useState(null);
  const [formFile, setFormFile] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  const { patients, totalPages, totalPatients, loading, error } =
    useFetchPatientsPulmo(currentPage);

  // Sync patients from API to local state for UI updates
  useEffect(() => {
    setPatientsState(patients);
  }, [patients]);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleUploadReport = (patient) => {
    setFormPatient(patient);
    setFormFile(null);
    setShowForm(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formFile || !formPatient) return;
    setFormLoading(true);
    try {
      const data = await uploadPulmoReport(formPatient.patient_id, formFile);
      setPatientsState((prev) =>
        prev.map((p) =>
          p.patient_id === formPatient.patient_id
            ? { ...p, pulmonologist_report_s3_key: data.s3_key }
            : p
        )
      );
      toast.success("Report uploaded!");
      setShowForm(false);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Upload failed");
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div>
      <PatientTable
        patients={patientsState}
        loading={loading}
        error={error}
        onUploadReport={handleUploadReport}
        onDownloadReport={handleDownloadReport}
      />
      <Pagination
        currentPage={currentPage}
        totalItems={totalPatients}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
      {showForm && (
        <div className="fixed inset-0 bg-transparent backdrop-blur-sm bg-opacity-60 flex items-center justify-center z-50">
          <form
            className="relative bg-white rounded-lg shadow-lg p-6 w-full max-w-md border-2 border-blue-600"
            onSubmit={handleFormSubmit}
          >
            <button
              type="button"
              className="absolute top-3 right-3 text-slate-400 hover:text-blue-600 text-xl font-bold"
              onClick={() => setShowForm(false)}
              aria-label="Close modal"
              disabled={formLoading}
            >
              &times;
            </button>
            <h2 className="text-lg font-bold mb-4">
              Upload Report for {formPatient?.user_typed_id}
            </h2>
            <input
              type="file"
              accept=".pdf,.doc,.docx,.csv,.txt"
              onChange={(e) => setFormFile(e.target.files[0])}
              className="mb-4 block w-full border border-slate-300 rounded px-3 py-2"
              required
            />
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                className="px-4 py-2 bg-slate-200 rounded hover:bg-slate-300"
                onClick={() => setShowForm(false)}
                disabled={formLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-semibold"
                disabled={formLoading || !formFile}
              >
                {formLoading ? "Uploading..." : "Upload"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
