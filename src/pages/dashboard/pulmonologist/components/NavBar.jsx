import React from "react";
import { NavLink } from "react-router-dom";

export default function NavBar() {
  return (
    <nav className="flex gap-4">
      <NavLink
        to="/pulmonologist/upload"
        className={({ isActive }) =>
          `px-4 py-2 rounded-lg font-semibold transition-colors ` +
          (isActive ? "bg-blue-600 text-white" : "bg-slate-200 text-blue-700")
        }
      >
        Upload
      </NavLink>
      <NavLink
        to="/pulmonologist/patients"
        className={({ isActive }) =>
          `px-4 py-2 rounded-lg font-semibold transition-colors ` +
          (isActive ? "bg-blue-600 text-white" : "bg-slate-200 text-blue-700")
        }
      >
        Patients
      </NavLink>
    </nav>
  );
}
