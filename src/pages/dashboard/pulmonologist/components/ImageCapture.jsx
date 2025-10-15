import { useState, useRef } from "react";
import toast from "react-hot-toast";
import axiosClient from "../../../../services/api/axios/axiosClient";
import { API_ENDPOINTS } from "../../../../utils/constants";

const ImageCapture = ({ sampleData, onNewSlide, onNewNode, onNewPatient }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadComplete, setUploadComplete] = useState(false);
  const [uploadResponse, setUploadResponse] = useState(null);
  const [showFinishModal, setShowFinishModal] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type.startsWith("image/")) {
        setSelectedFile(file);
        setUploadComplete(false);
      } else {
        toast.error("Please select a valid image file");
      }
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error("Please select an image first");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("image", selectedFile);
    formData.append("patientId", sampleData.patientId);
    formData.append("lymphNodeStation", sampleData.lymphNodeStation);
    formData.append("needleSize", sampleData.needleSize);
    formData.append("sampleType", sampleData.sampleType);
    formData.append("microscope", sampleData.microscope);
    // if (sampleData.customMicroscope) {
    //   formData.append("customMicroscope", sampleData.customMicroscope)
    // }
    formData.append("magnification", sampleData.magnification);
    formData.append("stain", sampleData.stain);
    formData.append("camera", sampleData.camera);
    // if (sampleData.customCamera) {
    //   formData.append("customCamera", sampleData.customCamera)
    // }

    try {
      const response = await axiosClient.post(
        API_ENDPOINTS.UPLOAD_IMAGE,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      toast.success("Image uploaded successfully!");
      setUploadResponse(response?.data ?? null);
      setUploadComplete(true);
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload image. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const resetFileInput = () => {
    setSelectedFile(null);
    setUploadComplete(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="flex justify-center">
      <div className="bg-white rounded-xl shadow-xl p-8 w-full max-w-4xl">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-slate-800 mb-4">
            Image Capture & Upload
          </h2>
          <div className="bg-slate-100 p-4 rounded-lg text-left">
            <p className="mb-1">
              <strong className="text-slate-900">Patient ID:</strong>{" "}
              <span className="text-slate-700">{sampleData.patientId}</span>
            </p>
            <p className="mb-1">
              <strong className="text-slate-900">Lymph Node Station:</strong>{" "}
              <span className="text-slate-700">
                {sampleData.lymphNodeStation}
              </span>
            </p>
            <p>
              <strong className="text-slate-900">Sample Type:</strong>{" "}
              <span className="text-slate-700">{sampleData.sampleType}</span>
            </p>
          </div>
        </div>
        {showFinishModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl p-6 mx-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-semibold text-slate-800 mb-2">
                    Upload Confirmation
                  </h2>
                  <p className="text-slate-600 mb-4">
                    Image uploaded successfully. Below is the summary and
                    metadata for the upload.
                  </p>
                </div>
                <button
                  aria-label="Close"
                  onClick={() => setShowFinishModal(false)}
                  className="text-slate-500 hover:text-slate-700"
                >
                  ✕
                </button>
              </div>

              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-700">
                <div>
                  <p className="mb-1">
                    <strong>File Name:</strong> {selectedFile?.name}
                  </p>
                  <p className="mb-1">
                    <strong>File Size:</strong>{" "}
                    {selectedFile
                      ? `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB`
                      : "-"}
                  </p>
                  <p className="mb-1">
                    <strong>Patient ID:</strong> {sampleData.patientId}
                  </p>
                  <p className="mb-1">
                    <strong>Lymph Node Station:</strong>{" "}
                    {sampleData.lymphNodeStation}
                  </p>
                  <p className="mb-1">
                    <strong>Sample Type:</strong> {sampleData.sampleType}
                  </p>
                </div>
                <div>
                  <p className="mb-1">
                    <strong>Needle Size:</strong> {sampleData.needleSize ?? "-"}
                  </p>
                  <p className="mb-1">
                    <strong>Microscope:</strong> {sampleData.microscope ?? "-"}
                  </p>
                  <p className="mb-1">
                    <strong>Magnification:</strong>{" "}
                    {sampleData.magnification ?? "-"}
                  </p>
                  <p className="mb-1">
                    <strong>Stain:</strong> {sampleData.stain ?? "-"}
                  </p>
                  <p className="mb-1">
                    <strong>Camera:</strong> {sampleData.camera ?? "-"}
                  </p>
                </div>
              </div>

              {uploadResponse && (
                <div className="mt-4 bg-slate-50 p-3 rounded border border-slate-200 text-sm">
                  <h4 className="font-semibold mb-2">Server Response</h4>
                  <pre className="whitespace-pre-wrap text-xs text-slate-600">
                    {JSON.stringify(uploadResponse, null, 2)}
                  </pre>
                </div>
              )}

              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => setShowFinishModal(false)}
                  className="bg-gray-100 hover:bg-gray-200 text-slate-700 font-semibold py-2 px-4 rounded"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    resetFileInput();
                    setShowFinishModal(false);
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="mb-8">
          <div className="mb-4">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
              id="imageUpload"
            />
            <label
              htmlFor="imageUpload"
              className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 hover:bg-blue-50 hover:border-blue-400 cursor-pointer transition-colors"
            >
              <svg
                className="w-12 h-12 text-gray-400 mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              <span className="text-gray-600 font-medium">
                {selectedFile ? selectedFile.name : "Choose Image File"}
              </span>
            </label>
          </div>

          {selectedFile && (
            <div className="bg-slate-50 p-6 rounded-lg border border-slate-200">
              <div className="mb-4">
                <p className="mb-2">
                  <strong className="text-slate-900">Selected:</strong>{" "}
                  <span className="text-slate-700">{selectedFile.name}</span>
                </p>
                <p>
                  <strong className="text-slate-900">Size:</strong>{" "}
                  <span className="text-slate-700">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </span>
                </p>
              </div>
              <button
                onClick={handleUpload}
                disabled={uploading}
                className="w-full bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
              >
                {uploading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Uploading...
                  </>
                ) : (
                  "Upload Image"
                )}
              </button>
            </div>
          )}
        </div>

        {uploadComplete && (
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-8 text-green-600 font-semibold text-lg">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <p>Image uploaded successfully!</p>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-slate-800 mb-6">
                What would you like to do next?
              </h3>
              <div className="flex gap-4 justify-center flex-wrap">
                <button
                  onClick={() => {
                    onNewSlide();
                    resetFileInput();
                  }}
                  className="bg-blue-100 cursor-pointer hover:bg-blue-200 text-blue-700 font-semibold py-3 px-6 rounded-lg transition-colors border border-blue-300"
                >
                  Capture New Slide
                </button>
                <button
                  onClick={() => {
                    onNewNode();
                    resetFileInput();
                  }}
                  className="bg-blue-100 cursor-pointer hover:bg-blue-200 text-blue-700 font-semibold py-3 px-6 rounded-lg transition-colors border border-blue-300"
                >
                  Capture New Node
                </button>
                <button
                  onClick={() => {
                    onNewPatient();
                    resetFileInput();
                  }}
                  className="bg-blue-100 cursor-pointer hover:bg-blue-200 text-blue-700 font-semibold py-3 px-6 rounded-lg transition-colors border border-blue-300"
                >
                  New Patient
                </button>
                <button
                  onClick={() => {
                    // open finish confirmation modal
                    setShowFinishModal(true);
                  }}
                  className="bg-red-200 border-1 border-red-600 cursor-pointer hover:bg-red-300 text-red-600 font-semibold py-3 px-6 rounded-lg transition-colors"
                >
                  Finish
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageCapture;
