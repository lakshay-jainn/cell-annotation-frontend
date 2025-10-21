import { Outlet } from "react-router-dom";
import NavBar from "./components/NavBar.jsx";
import useGlobalAuth from "../../../hooks/useAuth";
import PageHeader from "../../../components/ui/PageHeader.jsx";
import UserInfoCard from "../../../components/ui/UserInfoCard.jsx";
export default function PulmogolistPage() {
  const { name, hospital, location, Logout } = useGlobalAuth();

  return (
    <div className="min-h-screen overflow-x-hidden flex flex-col bg-slate-50">
      <PageHeader
        title="Pulmonology Sample Analysis System"
        subtitle="Digital Pathology & TBNA Sample Management"
        backgroundColor="#1e40af"
        gradientTo="#3b82f6"
      />

      <main className="flex-1 max-w-6xl mx-auto p-8 w-full">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 justify-center">
          <UserInfoCard
            name={name}
            hospital={hospital}
            location={location}
            accentColor="blue"
          />
          <div className="flex flex-col items-center sm:items-end gap-5 h-max">
            <button
              onClick={Logout}
              className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex gap-2 w-max"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              Logout
            </button>
            <NavBar />
          </div>
        </div>
        <Outlet />
      </main>
    </div>
  );
}
