const CellTypeAnnotation = ({
  selectedCells,
  selectedCellType,
  setSelectedCellType,
  cellTypeOther,
  setCellTypeOther,
  saveAnnotation,
  cellTypeOptions,
}) => {
  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200">
      <h3 className="font-medium text-gray-900 mb-3">Cell Type Annotation</h3>
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Cell Type
          </label>
          <select
            value={selectedCellType}
            onChange={(e) => setSelectedCellType(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          >
            <option value="">Select cell type</option>
            {cellTypeOptions.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        {selectedCellType === "Others" && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Specify Cell Type
            </label>
            <input
              type="text"
              value={cellTypeOther}
              onChange={(e) => setCellTypeOther(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              placeholder="Enter cell type"
            />
          </div>
        )}

        <button
          onClick={saveAnnotation}
          disabled={
            selectedCells.size === 0 ||
            !selectedCellType ||
            (selectedCellType === "Others" && !cellTypeOther)
          }
          className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
        >
          Save Annotation
        </button>
      </div>
    </div>
  );
};

export default CellTypeAnnotation;
