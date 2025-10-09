const ImageQualityCheck = ({ showImageQualityCheck, handleImageQuality }) => {
  if (!showImageQualityCheck) return null;

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className="bg-white rounded-lg max-w-sm w-full shadow-xl border border-gray-200">
        <div className="p-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">
            Image Quality Check
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            Please review the image quality behind this dialog. Is it acceptable
            for annotation?
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => handleImageQuality(false)}
              className="flex-1 px-3 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 text-sm"
            >
              No - Poor Quality
            </button>
            <button
              onClick={() => handleImageQuality(true)}
              className="flex-1 px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
            >
              Yes - Good Quality
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageQualityCheck;
