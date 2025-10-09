import { Outlet, Navigate, useLocation } from "react-router-dom";
import useGlobalAuth from "../../hooks/useAuth";
import { USER_ROLES, ROUTES } from "../../utils/constants";

function ProtectedRoute({ restrictedTo, redirectTo }) {
  const location = useLocation();
  const { isLoggedIn, role } = useGlobalAuth();

  if (isLoggedIn) {
    if (restrictedTo.includes(role)) {
      return <Outlet />;
    } else {
      return (
        <Navigate to={ROUTES.UNAUTHORIZED} state={{ from: location }} replace />
      );
    }
  } else {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }
}
export default ProtectedRoute;
