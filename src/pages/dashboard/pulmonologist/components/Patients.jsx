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
        const link = document.createElement("a");
        link.href = url;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
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
  const [formText, setFormText] = useState("");
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
    setFormText("");
    setShowForm(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formText.trim() || !formPatient) return;
    setFormLoading(true);
    try {
      // Convert text to a Blob (text file)
      const blob = new Blob([formText], { type: "text/plain" });
      const file = new File([blob], "clinical_notes.txt", {
        type: "text/plain",
      });

      const data = await uploadPulmoReport(formPatient.patient_id, file);
      setPatientsState((prev) =>
        prev.map((p) =>
          p.patient_id === formPatient.patient_id
            ? { ...p, pulmonologist_report_s3_key: data.s3_key }
            : p
        )
      );
      toast.success("Clinical notes uploaded!");
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
            className="relative bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl border-2 border-blue-600 max-h-96 overflow-y-auto"
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
              Enter Clinical Notes for {formPatient?.user_typed_id}
            </h2>
            <textarea
              value={formText}
              onChange={(e) => setFormText(e.target.value)}
              placeholder="Enter your clinical notes here..."
              className="mb-4 block w-full border border-slate-300 rounded px-3 py-2 h-64 resize-none overflow-y-auto"
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
                disabled={formLoading || !formText.trim()}
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
