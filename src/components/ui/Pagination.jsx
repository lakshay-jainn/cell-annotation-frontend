const Pagination = ({ currentPage, totalPages, totalItems, onPageChange }) => {
  if (totalPages <= 1) return null;

  return (
    <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between">
      <div className="text-sm text-slate-700">
        Showing page {currentPage} of {totalPages} ({totalItems} total samples)
      </div>
      <div className="flex items-center space-x-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-1 text-sm border border-slate-300 rounded-md hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>

        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
          const pageNum =
            Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
          if (pageNum > totalPages) return null;

          return (
            <button
              key={pageNum}
              onClick={() => onPageChange(pageNum)}
              className={`px-3 py-1 text-sm border rounded-md ${
                pageNum === currentPage
                  ? "bg-green-600 text-white border-green-600"
                  : "border-slate-300 hover:bg-slate-50"
              }`}
            >
              {pageNum}
            </button>
          );
        })}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-1 text-sm border border-slate-300 rounded-md hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Pagination;
