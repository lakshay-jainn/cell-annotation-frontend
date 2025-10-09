import { useEffect, useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import toast from "react-hot-toast"

export default function AdminLoginPage() {

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [remember, setRemember] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // replace with real API call
      await new Promise((r) => setTimeout(r, 900))

      toast.success("Welcome, Admin!")

      // after successful login, navigate to admin dashboard
      navigate("/admin/dashboard")
    } catch (err) {
      toast.error("Login failed. Check credentials and try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Admin MedLab System</h1>
          <p className="text-slate-600">manage users</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Email */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-semibold text-slate-700">Email Address</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="admin@medlab.example"
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-semibold text-slate-700">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />

            </div>

            {/* Login button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 px-6 rounded-lg font-semibold text-white transition-colors cursor-pointer ${
                "bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400"
              } disabled:cursor-not-allowed`}
            >
              {isLoading ? "Signing in..." : "Sign in as Admin"}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 pt-6 border-t border-slate-200 text-center">
            <p className="text-sm text-slate-500">Admin actions are logged for security and compliance</p>
          </div>
        </div>
      </div>
    </div>
  )
}
