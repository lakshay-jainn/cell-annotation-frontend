import useGlobalAuth from "../../hooks/useAuth";
import { Outlet, Navigate } from "react-router-dom";
import { USER_ROLES, ROUTES } from "../../utils/constants";

function UnprotectedRoute() {
  const { isLoggedIn, role } = useGlobalAuth();

  if (!isLoggedIn) {
    return <Outlet />;
  } else if (role === USER_ROLES.UPLOADER) {
    return <Navigate to={ROUTES.PULMONOLOGIST} replace />;
  } else if (role === USER_ROLES.ANNONATOR) {
    return <Navigate to={ROUTES.PATHOLOGIST} replace />;
  } else if (role === USER_ROLES.ADMIN) {
    return <Navigate to={ROUTES.ADMIN} replace />;
  }

  // Default fallback for unknown roles
  return <Navigate to={ROUTES.LOGIN} replace />;
}
export default UnprotectedRoute;
