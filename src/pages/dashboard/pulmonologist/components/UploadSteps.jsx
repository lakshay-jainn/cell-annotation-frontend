import ProgressSteps from "../../../../components/ui/ProgressSteps";
import PatientIdentifier from "./PatientIdentifier";
import SampleDetails from "./SampleDetails";
import ImageCapture from "./ImageCapture";

import { useState } from "react";

export default function UploadSteps() {
  const [currentStep, setCurrentStep] = useState("patient");
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
    <>
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
    </>
  );
}
