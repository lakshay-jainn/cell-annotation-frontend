import { useState } from "react";
import StatusBadge from "../../../../components/ui/StatusBadge.jsx";
import Papa from "papaparse";

const SampleTable = ({ samples, loading, onSampleClick }) => {
  const handleDownloadAnnotations = (sample) => {
    console.log(sample);
    let Annotations = {};
    if (!sample.image_quality) {
      Annotations = [
        ["Particulars", ""],
        ["image_quality", "Rejected"],
      ];
    } else {
      Annotations = [
        ["Particulars", "", "", "Cell Name", "Cell Count"],
        ["image_quality", "Accepted", "", "", ""],
        ["adequacy", sample.adequacy ? "Adequate" : "Not Adequate", "", "", ""],
        ["inaqdequacy_reason", sample.inaqdequacy_reason || "", "", "", ""],
        [
          "provisional_diagnosis",
          sample.provisional_diagnosis ? "Yes" : "No",
          "",
          "",
          "",
        ],
        [
          "provisional_diagonosis_reason",
          sample.provisional_diagnosis_reason || "",
          "",
          "",
          "",
        ],
      ];
      let i = 1;
      for (const cell of Object.keys(sample.cells)) {
        Annotations[i][3] = cell;
        Annotations[i][4] = sample.cells[cell];
        i++;
      }
    }
    console.log(Annotations);
    const csvData = Papa.unparse(Annotations);
    const csvBlob = new Blob([csvData], { type: "text/csv" });
    const url = URL.createObjectURL(csvBlob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "data.csv";
    document.body.appendChild(a);

    a.click();

    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleRowClick = (sample) => {
    if (sample.annotated) {
      return;
    }
    onSampleClick(sample);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
              Sample ID
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
              Annotation Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
              Annotated At
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
              Download Annotation
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-slate-200">
          {samples.map((sample) => (
            <tr
              key={sample.job_id}
              className={`hover:bg-slate-50 ${
                sample.annotated ? "" : "cursor-pointer"
              } transition-colors`}
              onClick={() => handleRowClick(sample)}
            >
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div
                    className={`text-sm font-medium ${
                      sample.annotated ? "text-slate-800" : "text-blue-600"
                    }`}
                  >
                    {sample.job_id}
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <StatusBadge
                  status={sample.annotated ? "Annotated" : "Not Annotated"}
                />
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                {sample.annotated_at
                  ? new Date(sample.annotated_at).toLocaleDateString()
                  : "N/A"}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                {sample.annotated_at ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownloadAnnotations(sample);
                    }}
                    className="cursor-pointer px-3 py-2 bg-green-100 text-green-800 rounded-xl font-semibold"
                  >
                    Download
                  </button>
                ) : (
                  "N/A"
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SampleTable;
