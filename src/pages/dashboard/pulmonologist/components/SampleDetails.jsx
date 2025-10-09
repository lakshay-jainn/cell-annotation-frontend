import { useState } from "react";
import {
  LYMPH_NODE_STATIONS,
  NEEDLE_SIZES,
  SAMPLE_TYPES,
  MICROSCOPE_MANUFACTURERS,
  MAGNIFICATIONS,
  STAINS,
  CAMERA_MANUFACTURERS,
} from "../../../../utils/constants.js";

const SampleDetails = ({ patientId, onSubmit, onBack }) => {
  const [formData, setFormData] = useState({
    lymphNodeStation: "",
    needleSize: "",
    sampleType: "",
    microscope: "",
    customMicroscope: "",
    magnification: "",
    stain: "",
    camera: "",
    customCamera: "",
  });

  const lymphNodeStations = LYMPH_NODE_STATIONS;
  const needleSizes = NEEDLE_SIZES;
  const sampleTypes = SAMPLE_TYPES;
  const microscopeManufacturers = MICROSCOPE_MANUFACTURERS;
  const magnifications = MAGNIFICATIONS;
  const stains = STAINS;
  const cameraManufacturers = CAMERA_MANUFACTURERS;

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const isFormValid = () => {
    return (
      formData.lymphNodeStation &&
      formData.needleSize &&
      formData.sampleType &&
      formData.microscope &&
      formData.magnification &&
      formData.stain &&
      formData.camera &&
      (formData.microscope !== "Others" || formData.customMicroscope) &&
      (formData.camera !== "Others" || formData.customCamera)
    );
  };

  return (
    <div className="flex justify-center">
      <div className="bg-white rounded-xl shadow-xl p-8 w-full max-w-4xl">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-slate-800 mb-2">
            Sample Details
          </h2>
          <div className="bg-slate-100 p-4 rounded-lg mt-4">
            <p className="text-slate-700">
              Patient ID:{" "}
              <strong className="text-slate-900">{patientId}</strong>
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <label
                htmlFor="lymphNodeStation"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Lymph Node Station *
              </label>
              <select
                id="lymphNodeStation"
                value={formData.lymphNodeStation}
                onChange={(e) =>
                  handleInputChange("lymphNodeStation", e.target.value)
                }
                required
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-base transition-colors focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 bg-white"
              >
                <option value="">Select station</option>
                {lymphNodeStations.map((station) => (
                  <option key={station} value={station}>
                    {station}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="needleSize"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Needle Size *
              </label>
              <select
                id="needleSize"
                value={formData.needleSize}
                onChange={(e) =>
                  handleInputChange("needleSize", e.target.value)
                }
                required
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-base transition-colors focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 bg-white"
              >
                <option value="">Select size</option>
                {needleSizes.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="sampleType"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Sample Type *
              </label>
              <select
                id="sampleType"
                value={formData.sampleType}
                onChange={(e) =>
                  handleInputChange("sampleType", e.target.value)
                }
                required
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-base transition-colors focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 bg-white"
              >
                <option value="">Select type</option>
                {sampleTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="microscope"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Microscope *
              </label>
              <select
                id="microscope"
                value={formData.microscope}
                onChange={(e) =>
                  handleInputChange("microscope", e.target.value)
                }
                required
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-base transition-colors focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 bg-white"
              >
                <option value="">Select manufacturer</option>
                {microscopeManufacturers.map((manufacturer) => (
                  <option key={manufacturer} value={manufacturer}>
                    {manufacturer}
                  </option>
                ))}
              </select>
            </div>

            {formData.microscope === "Others" && (
              <div>
                <label
                  htmlFor="customMicroscope"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Custom Microscope *
                </label>
                <input
                  type="text"
                  id="customMicroscope"
                  value={formData.customMicroscope}
                  onChange={(e) =>
                    handleInputChange("customMicroscope", e.target.value)
                  }
                  placeholder="Enter microscope details"
                  required
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-base transition-colors focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
              </div>
            )}

            <div>
              <label
                htmlFor="magnification"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Magnification *
              </label>
              <select
                id="magnification"
                value={formData.magnification}
                onChange={(e) =>
                  handleInputChange("magnification", e.target.value)
                }
                required
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-base transition-colors focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 bg-white"
              >
                <option value="">Select magnification</option>
                {magnifications.map((mag) => (
                  <option key={mag} value={mag}>
                    {mag}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="stain"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Stain *
              </label>
              <select
                id="stain"
                value={formData.stain}
                onChange={(e) => handleInputChange("stain", e.target.value)}
                required
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-base transition-colors focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 bg-white"
              >
                <option value="">Select stain</option>
                {stains.map((stain) => (
                  <option key={stain} value={stain}>
                    {stain}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="camera"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Camera *
              </label>
              <select
                id="camera"
                value={formData.camera}
                onChange={(e) => handleInputChange("camera", e.target.value)}
                required
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-base transition-colors focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 bg-white"
              >
                <option value="">Select manufacturer</option>
                {cameraManufacturers.map((manufacturer) => (
                  <option key={manufacturer} value={manufacturer}>
                    {manufacturer}
                  </option>
                ))}
              </select>
            </div>

            {formData.camera === "Others" && (
              <div>
                <label
                  htmlFor="customCamera"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Custom Camera *
                </label>
                <input
                  type="text"
                  id="customCamera"
                  value={formData.customCamera}
                  onChange={(e) =>
                    handleInputChange("customCamera", e.target.value)
                  }
                  placeholder="Enter camera details"
                  required
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-base transition-colors focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
              </div>
            )}
          </div>

          <div className="flex gap-4 justify-end">
            <button
              type="button"
              onClick={onBack}
              className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              Back
            </button>
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 hover:transform hover:-translate-y-0.5 hover:shadow-lg"
              disabled={!isFormValid()}
            >
              Capture Image
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SampleDetails;
