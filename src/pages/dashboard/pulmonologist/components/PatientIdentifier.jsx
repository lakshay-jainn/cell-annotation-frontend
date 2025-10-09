import { useState } from "react"

const PatientIdentifier = ({ onSubmit }) => {
  const [patientId, setPatientId] = useState("")

  const handleSubmit = (e) => {
    e.preventDefault()
    if (patientId.trim()) {
      onSubmit(patientId.trim())
    }
  }

  return (
    <div className="flex justify-center">
      <div className="bg-white rounded-xl shadow-xl p-8 w-full max-w-2xl">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-slate-800 mb-2">Patient Identification</h2>
          <p className="text-slate-600">Enter the patient identifier to begin sample analysis</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label htmlFor="patientId" className="block text-sm font-semibold text-gray-700 mb-2">
              Patient ID *
            </label>
            <input
              type="text"
              id="patientId"
              value={patientId}
              onChange={(e) => setPatientId(e.target.value)}
              placeholder="Enter patient identifier"
              required
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-base transition-colors focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 hover:transform hover:-translate-y-0.5 hover:shadow-lg"
            disabled={!patientId.trim()}
          >
            Enter Details of Sample
          </button>
        </form>
      </div>
    </div>
  )
}

export default PatientIdentifier
