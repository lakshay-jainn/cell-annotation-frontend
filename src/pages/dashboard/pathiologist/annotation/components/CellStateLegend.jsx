const CellStateLegend = () => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">
        Cell Status Legend
      </h3>
      <div className="space-y-2">
        {/* Red - Unselected */}
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 rounded-full bg-red-500 border border-gray-800"></div>
          <span className="text-sm text-gray-600">Available for selection</span>
        </div>

        {/* Orange - Selected */}
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 rounded-full bg-[#008000] border border-gray-800"></div>
          <span className="text-sm text-gray-600">Currently selected</span>
        </div>

        {/* Gray - Disabled/Annotated */}
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 rounded-full bg-gray-400 border border-gray-800 opacity-50"></div>
          <span className="text-sm text-gray-600">
            Already annotated (disabled)
          </span>
        </div>
      </div>
      <div className="mt-3 pt-3 border-t border-gray-200">
        <p className="text-xs text-gray-500 italic">
          Note: Once a cell is annotated, it cannot be selected again to prevent
          duplicate annotations.
        </p>
      </div>
    </div>
  );
};

export default CellStateLegend;
