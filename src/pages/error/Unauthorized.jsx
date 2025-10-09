import { Link } from "react-router-dom";
import { ROUTES } from "../../utils/constants";
import useGlobalAuth from "../../hooks/useAuth";

export default function Unauthorized() {
  const { logout } = useGlobalAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Unauthorized Icon */}
          <div className="mx-auto w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mb-6">
            <svg
              className="w-12 h-12 text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m0 0v2m0-2h2m-2 0H10m4-8V7a3 3 0 00-6 0v4M7 21h10a2 2 0 002-2V11a2 2 0 00-2-2H7a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
          </div>

          {/* Error Message */}
          <h1 className="text-6xl font-bold text-red-600 mb-4">403</h1>
          <h2 className="text-2xl font-semibold text-slate-700 mb-4">
            Access Denied
          </h2>
          <p className="text-slate-600 mb-8">
            You don't have permission to access this page. Please check your
            user role or contact an administrator.
          </p>

          {/* Action Buttons */}
          <div className="space-y-4">
            <button
              onClick={() => window.history.back()}
              className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              Go Back
            </button>

            <Link
              to={ROUTES.HOME}
              className="block w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              Go to Home
            </Link>

            <button
              onClick={handleLogout}
              className="block w-full bg-red-100 hover:bg-red-200 text-red-700 font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              Logout & Login as Different User
            </button>
          </div>

          {/* Additional Info */}
          <div className="mt-8 pt-6 border-t border-slate-200">
            <p className="text-sm text-slate-500">
              If you need access to this page, please contact your
              administrator.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
