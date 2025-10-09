import { useState } from "react";
import PatientIdentifier from "./components/PatientIdentifier";
import SampleDetails from "./components/SampleDetails";
import ImageCapture from "./components/ImageCapture";
import useGlobalAuth from "../../../hooks/useAuth";
import PageHeader from "../../../components/ui/PageHeader.jsx";
import UserInfoCard from "../../../components/ui/UserInfoCard.jsx";
import ProgressSteps from "../../../components/ui/ProgressSteps.jsx";

export default function PulmogolistPage() {
  const [currentStep, setCurrentStep] = useState("patient");
  const { name, hospital, location, Logout } = useGlobalAuth();
  const [sampleData, setSampleData] = useState({
    patientId: "",
    lymphNodeStation: "",
    needleSize: "",
    sampleType: "",
    microscope: "",
    magnification: "",
    stain: "",
    camera: "",
  });

  const steps = [
    { key: "patient", label: "Patient ID" },
    { key: "details", label: "Sample Details" },
    { key: "capture", label: "Image Capture" },
  ];

  const handlePatientSubmit = (patientId) => {
    setSampleData((prev) => ({ ...prev, patientId }));
    setCurrentStep("details");
  };

  const handleDetailsSubmit = (details) => {
    setSampleData((prev) => ({ ...prev, ...details }));
    setCurrentStep("capture");
  };

  const handleNewSlide = () => {
    setCurrentStep("capture");
  };

  const handleNewNode = () => {
    setSampleData((prev) => ({
      ...prev,
      lymphNodeStation: "",
      needleSize: "",
      sampleType: "",
      microscope: "",
      customMicroscope: "",
      magnification: "",
      stain: "",
      camera: "",
      customCamera: "",
    }));
    setCurrentStep("details");
  };

  const handleNewPatient = () => {
    setSampleData({
      patientId: "",
      lymphNodeStation: "",
      needleSize: "",
      sampleType: "",
      microscope: "",
      magnification: "",
      stain: "",
      camera: "",
    });
    setCurrentStep("patient");
  };

  return (
    <div className="min-h-screen overflow-x-hidden flex flex-col bg-slate-50">
      <PageHeader
        title="Pulmonology Sample Analysis System"
        subtitle="Digital Pathology & TBNA Sample Management"
        backgroundColor="#1e40af"
        gradientTo="#3b82f6"
      />

      <main className="flex-1 max-w-6xl mx-auto p-8 w-full">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
          <UserInfoCard
            name={name}
            hospital={hospital}
            location={location}
            accentColor="blue"
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

        <ProgressSteps currentStep={currentStep} steps={steps} />

        {currentStep === "patient" && (
          <PatientIdentifier onSubmit={handlePatientSubmit} />
        )}

        {currentStep === "details" && (
          <SampleDetails
            patientId={sampleData.patientId}
            onSubmit={handleDetailsSubmit}
            onBack={() => setCurrentStep("patient")}
          />
        )}

        {currentStep === "capture" && (
          <ImageCapture
            sampleData={sampleData}
            onNewSlide={handleNewSlide}
            onNewNode={handleNewNode}
            onNewPatient={handleNewPatient}
          />
        )}
      </main>
    </div>
  );
}
