const StatisticsPanel = ({
  cellPredictions,
  selectedCells,
  annotatedCells,
}) => {
  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200">
      <h3 className="font-medium text-gray-900 mb-3">Statistics</h3>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">Total Cells:</span>
          <span className="font-medium">{cellPredictions.length}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Selected:</span>
          <span className="font-medium text-blue-600">
            {selectedCells.size}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Annotated:</span>
          <span className="font-medium text-green-600">
            {annotatedCells.length}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Progress:</span>
          <span className="font-medium">
            {cellPredictions.length > 0
              ? Math.round(
                  (annotatedCells.length / cellPredictions.length) * 100
                )
              : 0}
            %
          </span>
        </div>
      </div>
    </div>
  );
};

export default StatisticsPanel;
