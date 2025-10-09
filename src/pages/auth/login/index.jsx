import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import { SigninAPI } from "../../../services/api/services/authService";
import useGlobalAuth from "../../../hooks/useAuth";
import AuthCard from "../../../components/ui/AuthCard.jsx";
import { USER_ROLES, USER_TYPES, ROUTES } from "../../../utils/constants";
import { getLoginErrorMessage } from "../../../utils/authErrors";
import LoginForm from "./components/LoginForm";

export default function LoginPage() {
  const location = useLocation();
  const { Login } = useGlobalAuth();
  const { currentUserType } = location.state?.from.state || {
    currentUserType: USER_TYPES.PATHOLOGIST,
  };
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLoginSubmit = async ({ userType, email, password }) => {
    setIsLoading(true);
    const role =
      userType === USER_TYPES.PATHOLOGIST
        ? USER_ROLES.ANNONATOR
        : USER_ROLES.UPLOADER;

    try {
      const data = await SigninAPI({
        role: role,
        email: email,
        password: password,
      });
      Login(data.token);
      toast.success(`Welcome ${userType}!`);

      // Navigate to appropriate portal
      if (userType === USER_TYPES.PULMONOLOGIST) {
        navigate(ROUTES.PULMONOLOGIST);
      } else {
        navigate(ROUTES.PATHOLOGIST);
      }
    } catch (error) {
      console.error("Login error:", error);
      const errorMessage = getLoginErrorMessage(error);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthCard subtitle="Sign in to access your portal">
      <LoginForm
        onSubmit={handleLoginSubmit}
        isLoading={isLoading}
        initialUserType={currentUserType}
      />
    </AuthCard>
  );
}
