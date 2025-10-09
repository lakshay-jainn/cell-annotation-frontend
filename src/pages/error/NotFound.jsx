import { Link } from "react-router-dom";
import { ROUTES } from "../../utils/constants";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* 404 Icon */}
          <div className="mx-auto w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-6">
            <svg
              className="w-12 h-12 text-slate-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 0a6 6 0 110-12 6 6 0 010 12z"
              />
            </svg>
          </div>

          {/* Error Message */}
          <h1 className="text-6xl font-bold text-slate-800 mb-4">404</h1>
          <h2 className="text-2xl font-semibold text-slate-700 mb-4">
            Page Not Found
          </h2>
          <p className="text-slate-600 mb-8">
            The page you're looking for doesn't exist or has been moved.
          </p>

          {/* Action Buttons */}
          <div className="space-y-4">
            <Link
              to={ROUTES.HOME}
              className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              Go to Home
            </Link>

            <Link
              to={ROUTES.LOGIN}
              className="block w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              Go to Login
            </Link>
          </div>

          {/* Additional Info */}
          <div className="mt-8 pt-6 border-t border-slate-200">
            <p className="text-sm text-slate-500">
              If you believe this is an error, please contact support.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
