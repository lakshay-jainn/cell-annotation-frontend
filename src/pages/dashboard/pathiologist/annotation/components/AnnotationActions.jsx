const AnnotationActions = ({
  selectedCells,
  loadingAutoSelect,
  runAutoSelectCumulative,
  undoLast,
  clearAll,
  strictness,
  setStrictness,
}) => {
  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200">
      <h3 className="font-medium text-gray-900 mb-3">Actions</h3>

      {/* Strictness Control */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Detection Strictness: {strictness}/10
        </label>
        <input
          type="range"
          min="1"
          max="10"
          value={strictness}
          onChange={(e) => setStrictness(parseInt(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>Lenient (More Cells)</span>
          <span>Strict (Fewer Cells)</span>
        </div>
      </div>

      <div className="space-y-2">
        <button
          onClick={runAutoSelectCumulative}
          disabled={selectedCells.size < 1 || loadingAutoSelect}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
        >
          {loadingAutoSelect ? "Detecting..." : "Find Similar"}
        </button>
        {selectedCells.size < 1 && (
          <p className="text-xs text-amber-600">
            Select at least 1 cell to find similar cells
          </p>
        )}

        <div className="flex gap-2">
          <button
            onClick={undoLast}
            className="flex-1 px-3 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 text-sm"
          >
            Undo
          </button>
          <button
            onClick={clearAll}
            className="flex-1 px-3 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 text-sm"
          >
            Clear All
          </button>
        </div>
      </div>
    </div>
  );
};

export default AnnotationActions;
