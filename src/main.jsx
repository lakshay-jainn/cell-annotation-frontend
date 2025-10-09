import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Toaster } from "react-hot-toast";
import "./styles/globals.css";
import { USER_ROLES, ROUTES } from "./utils/constants";
import PulmogolistPage from "./pages/dashboard/pulmonologist";
import PathiologistPage from "./pages/dashboard/pathiologist";
import HomePage from "./pages/auth/home";
import LoginPage from "./pages/auth/login";
import RegisterPage from "./pages/auth/register";
import NotFound from "./pages/error/NotFound";
import Unauthorized from "./pages/error/Unauthorized";
import {
  RouterProvider,
  createBrowserRouter,
  createRoutesFromElements,
  Route,
} from "react-router-dom";
import AuthProvider from "./context/AuthContext";
import UnprotectedRoute from "./components/auth/UnprotectedRoute.jsx";
import ProtectedRoute from "./components/auth/ProtectedRoute.jsx";
import AnnotationPage from "./pages/dashboard/pathiologist/annotation";

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route path="/" element={<UnprotectedRoute />}>
        <Route index element={<HomePage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
      </Route>

      <Route
        path="/"
        element={
          <ProtectedRoute
            restrictedTo={[USER_ROLES.UPLOADER]}
            redirectTo={ROUTES.LOGIN}
          />
        }
      >
        <Route path="pulmonologist" element={<PulmogolistPage />}></Route>
      </Route>

      <Route
        path="/"
        element={
          <ProtectedRoute
            restrictedTo={[USER_ROLES.ANNONATOR]}
            redirectTo={ROUTES.LOGIN}
          />
        }
      >
        <Route path="pathologist" element={<PathiologistPage />}></Route>
        <Route path="sample/:jobId" element={<AnnotationPage />} />
        <Route
          path="patient/:patientId/annotate"
          element={<AnnotationPage />}
        />
      </Route>

      {/* Error pages */}
      <Route path="/unauthorized" element={<Unauthorized />} />
      <Route path="/404" element={<NotFound />} />

      {/* Catch-all route for 404 */}
      <Route path="*" element={<NotFound />} />
    </>
  )
);
createRoot(document.getElementById("root")).render(
  <AuthProvider>
    <Toaster position="top-right" />
    <RouterProvider router={router} />
  </AuthProvider>
);
