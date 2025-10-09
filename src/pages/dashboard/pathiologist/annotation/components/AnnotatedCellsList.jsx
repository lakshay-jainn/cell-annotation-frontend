const AnnotatedCellsList = ({
  cellTypeCounts,
  annotatedCells,
  removeAnnotation,
}) => {
  if (Object.keys(cellTypeCounts).length === 0) {
    return null;
  }

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200">
      <h3 className="font-medium text-gray-900 mb-3">Annotated Cells</h3>
      <div className="space-y-2">
        {Object.entries(cellTypeCounts).map(([cellType, count]) => (
          <div
            key={cellType}
            className="flex items-center justify-between text-sm"
          >
            <span className="text-gray-700">{cellType}</span>
            <div className="flex items-center gap-2">
              <span className="font-medium text-blue-600">{count}</span>
              <button
                onClick={() => {
                  const cellsToRemove = annotatedCells.filter(
                    (a) => a.cellType === cellType
                  );
                  cellsToRemove.forEach((cell) =>
                    removeAnnotation(cell.cellIndex)
                  );
                }}
                className="text-red-500 hover:text-red-700 text-xs"
              >
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AnnotatedCellsList;
