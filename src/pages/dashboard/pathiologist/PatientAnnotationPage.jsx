import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import axiosClient from "../../../../services/api/axios/axiosClient";
import useGlobalAuth from "../../../../hooks/useAuth";
import PageHeader from "../../../../components/ui/PageHeader.jsx";
import UserInfoCard from "../../../../components/ui/UserInfoCard.jsx";
import LoadingScreen from "../annotation/components/LoadingScreen";
import ImageQualityCheck from "../annotation/components/ImageQualityCheck";
import AnnotationView from "../annotation/components/AnnotationView";
import FinalAssessment from "../annotation/components/FinalAssessment";

export default function PatientAnnotationPage() {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const { name, location, hospital } = useGlobalAuth();

  // Patient and slide state
  const [patient, setPatient] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(null);
  const [loading, setLoading] = useState(true);

  // Workflow state
  const [currentStep, setCurrentStep] = useState("quality-check"); // 'quality-check' | 'annotation' | 'final-assessment'
  const [slideAnnotations, setSlideAnnotations] = useState({}); // Store annotations per slide
  const [allSlidesCompleted, setAllSlidesCompleted] = useState(false);

  // Fetch next slide for the patient
  const fetchNextSlide = async () => {
    try {
      setLoading(true);
      const response = await axiosClient.get(
        `/patient/${patientId}/next-slide`
      );
      setCurrentSlide(response.data);
      setCurrentStep("quality-check");
    } catch (error) {
      if (error.response?.status === 404) {
        // No more slides - all completed
        setAllSlidesCompleted(true);
        setCurrentStep("final-assessment");
      } else {
        console.error("Error fetching next slide:", error);
        toast.error("Failed to load next slide");
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch patient info
  const fetchPatient = async () => {
    try {
      const response = await axiosClient.get(`/patient/${patientId}/samples`);
      setPatient(response.data);
    } catch (error) {
      console.error("Error fetching patient:", error);
      toast.error("Failed to load patient information");
    }
  };

  useEffect(() => {
    fetchPatient();
    fetchNextSlide();
  }, [patientId]);

  const handleQualityCheckComplete = (isGoodQuality) => {
    if (!isGoodQuality) {
      // Skip to next slide if quality is poor
      handleSlideAnnotated(null, false);
    } else {
      // Proceed to annotation
      setCurrentStep("annotation");
    }
  };

  const handleSlideAnnotated = async (
    annotationData,
    hasGoodQuality = true
  ) => {
    if (hasGoodQuality && annotationData) {
      // Store annotation for this slide
      setSlideAnnotations((prev) => ({
        ...prev,
        [currentSlide.sample.job_id]: annotationData,
      }));

      // Save annotation to backend
      try {
        const formData = new FormData();
        formData.append("job_id", currentSlide.sample.job_id);
        formData.append("image_quality", "true");
        formData.append(
          "cellTypeCounts",
          JSON.stringify(annotationData.cellCounts)
        );

        if (annotationData.csvFile) {
          formData.append("annotations_csv", annotationData.csvFile);
        }

        await axiosClient.post("/annotate", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        toast.success("Slide annotation saved successfully");
      } catch (error) {
        console.error("Error saving annotation:", error);
        toast.error("Failed to save annotation");
        return;
      }
    } else if (!hasGoodQuality) {
      // Save poor quality annotation
      try {
        const formData = new FormData();
        formData.append("job_id", currentSlide.sample.job_id);
        formData.append("image_quality", "false");
        formData.append("cellTypeCounts", JSON.stringify({}));

        await axiosClient.post("/annotate", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        toast.success("Slide marked as poor quality");
      } catch (error) {
        console.error("Error saving poor quality annotation:", error);
        toast.error("Failed to save annotation");
        return;
      }
    }

    // Fetch next slide
    fetchNextSlide();
  };

  const handleFinalAssessmentComplete = async (assessmentData) => {
    try {
      await axiosClient.post(`/patient/${patientId}/complete`, assessmentData);
      toast.success("Patient annotation completed successfully!");
      navigate("/dashboard/pathologist");
    } catch (error) {
      console.error("Error completing patient annotation:", error);
      toast.error("Failed to complete patient annotation");
    }
  };

  if (loading && !allSlidesCompleted) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <PageHeader
        title={`Patient ${
          patient?.user_typed_id || "Unknown"
        } - Slide Annotation`}
        subtitle="Digital Pathology Analysis Workflow"
        backgroundColor="#166534"
        gradientTo="#16a34a"
      />

      <main className="flex-1 max-w-7xl mx-auto p-8 w-full">
        <UserInfoCard
          name={name}
          hospital={hospital}
          location={location}
          accentColor="green"
        />

        {/* Progress indicator */}
        {patient && (
          <div className="mb-6 bg-white rounded-lg shadow-sm p-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-slate-800">
                Patient: {patient.user_typed_id}
              </h3>
              <div className="text-sm text-slate-600">
                Progress: {Object.keys(slideAnnotations).length} /{" "}
                {patient.samples?.length || 0} slides completed
              </div>
            </div>
          </div>
        )}

        {/* Workflow Steps */}
        {currentStep === "quality-check" && currentSlide && (
          <ImageQualityCheck
            imageUrl={currentSlide.image.url}
            onComplete={handleQualityCheckComplete}
            sampleId={currentSlide.sample.job_id}
          />
        )}

        {currentStep === "annotation" && currentSlide && (
          <AnnotationView
            sampleId={currentSlide.sample.job_id}
            imageUrl={currentSlide.image.url}
            csvUrl={currentSlide.csv.url}
            onComplete={handleSlideAnnotated}
            showBackButton={false}
          />
        )}

        {currentStep === "final-assessment" && allSlidesCompleted && (
          <FinalAssessment
            patientId={patientId}
            onComplete={handleFinalAssessmentComplete}
            slideAnnotations={slideAnnotations}
          />
        )}
      </main>
    </div>
  );
}
