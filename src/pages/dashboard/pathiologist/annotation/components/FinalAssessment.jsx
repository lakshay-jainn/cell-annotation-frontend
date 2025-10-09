import { useState, useEffect } from "react";
import FormField from "../../../../../components/ui/FormField";
import SubmitButton from "../../../../../components/ui/SubmitButton";
import axiosClient from "../../../../../services/api/axios/axiosClient";
import toast from "react-hot-toast";

const FinalAssessment = ({ patientId, onComplete }) => {
  const [formData, setFormData] = useState({
    adequacy: true,
    inadequacy_reason: "",
    provisional_diagnosis: false,
    provisional_diagnosis_reason: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [annotationSummary, setAnnotationSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch annotation summary when component mounts
  useEffect(() => {
    const fetchAnnotationSummary = async () => {
      try {
        const response = await axiosClient.get(
          `/patient/${patientId}/annotation-summary`
        );

        // Sort slides by annotation timestamp to maintain annotation order
        const sortedData = {
          ...response.data,
          slides_summary:
            response.data.slides_summary?.sort((a, b) => {
              // Sort by annotated_at timestamp (earliest first)
              if (!a.annotated_at) return 1; // Put non-annotated slides at the end
              if (!b.annotated_at) return -1;
              return new Date(a.annotated_at) - new Date(b.annotated_at);
            }) || [],
        };

        setAnnotationSummary(sortedData);
      } catch (error) {
        console.error("Failed to fetch annotation summary:", error);
      } finally {
        setLoading(false);
      }
    };

    if (patientId) {
      fetchAnnotationSummary();
    }
  }, [patientId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await onComplete(formData);
    } catch (error) {
      console.error("Error in final assessment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleDownloadReport = async () => {
    try {
      const response = await axiosClient.get(
        `/patient/${patientId}/download-report`,
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
      let filename = `patient_${
        annotationSummary?.user_typed_id || patientId
      }_report.csv`;

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
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading annotation summary...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-slate-800 mb-2">
            Final Patient Assessment
          </h2>
          <p className="text-slate-600">
            Review all slide annotations and provide your final assessment for
            Patient: {annotationSummary?.user_typed_id}
          </p>
        </div>

        {/* Detailed Annotation Summary */}
        {annotationSummary && (
          <div className="mb-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-slate-800">
                Annotation Summary
              </h3>
              <button
                onClick={handleDownloadReport}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-200 flex items-center space-x-2"
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
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <span>Download Report</span>
              </button>
            </div>

            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {annotationSummary.total_slides}
                </div>
                <div className="text-sm text-blue-800">Slides Annotated</div>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-green-600">
                  {Object.values(annotationSummary.total_cell_counts).reduce(
                    (sum, count) => sum + count,
                    0
                  )}
                </div>
                <div className="text-sm text-green-800">
                  Total Cells Identified
                </div>
              </div>
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {Object.keys(annotationSummary.total_cell_counts).length}
                </div>
                <div className="text-sm text-purple-800">Cell Types Found</div>
              </div>
            </div>

            {/* Total Cell Counts */}
            <div className="mb-6 p-6 bg-slate-50 rounded-lg">
              <h4 className="text-lg font-semibold text-slate-800 mb-4">
                Total Cell Counts Across All Slides
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {Object.entries(annotationSummary.total_cell_counts).map(
                  ([cellType, count]) => (
                    <div
                      key={cellType}
                      className="bg-white border rounded-lg p-3"
                    >
                      <div className="font-medium text-slate-700 text-sm mb-1">
                        {cellType}
                      </div>
                      <div className="text-xl font-bold text-blue-600">
                        {count}
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>

            {/* Per-Slide Breakdown */}
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-slate-800 mb-4">
                Cell Counts Per Slide
              </h4>
              <div className="space-y-4">
                {annotationSummary.slides_summary.map((slide, index) => (
                  <div key={slide.slide_id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-center mb-3">
                      <div>
                        <h5 className="font-medium text-slate-800">
                          Slide {index + 1}:{" "}
                          {slide.slide_name || slide.slide_id}
                        </h5>
                        <p className="text-sm text-slate-600">
                          Quality:{" "}
                          <span
                            className={`font-medium ${
                              slide.image_quality
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            {slide.image_quality ? "Good" : "Poor"}
                          </span>
                          {slide.annotated_at && (
                            <>
                              {" "}
                              • Annotated:{" "}
                              {new Date(
                                slide.annotated_at
                              ).toLocaleDateString()}
                            </>
                          )}
                        </p>
                      </div>
                      <div className="text-sm text-slate-500">
                        {Object.values(slide.cell_counts).reduce(
                          (sum, count) => sum + count,
                          0
                        )}{" "}
                        total cells
                      </div>
                    </div>

                    {Object.keys(slide.cell_counts).length > 0 ? (
                      <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                        {Object.entries(slide.cell_counts).map(
                          ([cellType, count]) => (
                            <div
                              key={cellType}
                              className="bg-slate-100 rounded p-2 text-center"
                            >
                              <div
                                className="text-xs text-slate-600 mb-1 truncate"
                                title={cellType}
                              >
                                {cellType}
                              </div>
                              <div className="font-semibold text-slate-800">
                                {count}
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    ) : (
                      <p className="text-slate-500 text-sm italic">
                        No cells annotated in this slide
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Adequacy Assessment */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Sample Adequacy *
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="adequacy"
                  value="true"
                  checked={formData.adequacy === true}
                  onChange={(e) => handleInputChange("adequacy", true)}
                  className="mr-2"
                  required
                />
                <span>Adequate for diagnosis</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="adequacy"
                  value="false"
                  checked={formData.adequacy === false}
                  onChange={(e) => handleInputChange("adequacy", false)}
                  className="mr-2"
                />
                <span>Not adequate for diagnosis</span>
              </label>
            </div>
          </div>

          {/* Inadequacy Reason */}
          {!formData.adequacy && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Reason for Inadequacy *
              </label>
              <textarea
                value={formData.inadequacy_reason}
                onChange={(e) =>
                  handleInputChange("inadequacy_reason", e.target.value)
                }
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-base transition-colors focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                rows={3}
                placeholder="Please specify the reason why the sample is not adequate..."
                required={!formData.adequacy}
              />
            </div>
          )}

          {/* Provisional Diagnosis */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Provisional Diagnosis Available *
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="provisional_diagnosis"
                  value="true"
                  checked={formData.provisional_diagnosis === true}
                  onChange={(e) =>
                    handleInputChange("provisional_diagnosis", true)
                  }
                  className="mr-2"
                  required
                />
                <span>Yes, provisional diagnosis can be made</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="provisional_diagnosis"
                  value="false"
                  checked={formData.provisional_diagnosis === false}
                  onChange={(e) =>
                    handleInputChange("provisional_diagnosis", false)
                  }
                  className="mr-2"
                />
                <span>No, provisional diagnosis cannot be made</span>
              </label>
            </div>
          </div>

          {/* Provisional Diagnosis Reason */}
          {formData.provisional_diagnosis && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Provisional Diagnosis Details *
              </label>
              <textarea
                value={formData.provisional_diagnosis_reason}
                onChange={(e) =>
                  handleInputChange(
                    "provisional_diagnosis_reason",
                    e.target.value
                  )
                }
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-base transition-colors focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                rows={4}
                placeholder="Please provide your provisional diagnosis and supporting details..."
                required={formData.provisional_diagnosis}
              />
            </div>
          )}

          <div className="flex space-x-4 pt-6">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-green-500 hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 hover:transform hover:-translate-y-0.5 hover:shadow-lg"
            >
              {isSubmitting
                ? "Completing Assessment..."
                : "Complete Patient Assessment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FinalAssessment;
