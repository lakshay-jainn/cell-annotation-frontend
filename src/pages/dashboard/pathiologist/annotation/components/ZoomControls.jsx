const ZoomControls = ({ zoom, zoomByFactor, fitToScreen }) => {
  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200">
      <h3 className="font-medium text-gray-900 mb-3">Zoom & Pan</h3>
      <div className="flex gap-2 mb-2">
        <button
          onClick={() => zoomByFactor(1 / 1.15)}
          className="px-3 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 text-sm"
        >
          −
        </button>
        <button
          onClick={fitToScreen}
          className="flex-1 px-3 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 text-sm"
        >
          Fit
        </button>
        <button
          onClick={() => zoomByFactor(1.15)}
          className="px-3 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 text-sm"
        >
          +
        </button>
      </div>
      <div className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded">
        Zoom: {zoom.toFixed(2)}× | Use buttons to zoom, right-click + drag to
        pan
      </div>
    </div>
  );
};

export default ZoomControls;
