const AppearanceControls = ({
  pointSize,
  setPointSize,
  pointColor,
  setPointColor,
}) => {
  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200">
      <h3 className="font-medium text-gray-900 mb-3">Appearance</h3>
      <div className="space-y-3">
        <div>
          <label className="block text-sm text-gray-600 mb-1">Point Size</label>
          <input
            type="range"
            min="2"
            max="12"
            value={pointSize}
            onChange={(e) => setPointSize(Number.parseInt(e.target.value))}
            className="w-full"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">
            Selected Color
          </label>
          <input
            type="color"
            value={pointColor}
            onChange={(e) => setPointColor(e.target.value)}
            className="w-full h-8 rounded border border-gray-300"
          />
        </div>
      </div>
    </div>
  );
};

export default AppearanceControls;
