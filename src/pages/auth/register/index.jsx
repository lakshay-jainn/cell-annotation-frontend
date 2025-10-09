import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import { SignupAPI } from "../../../services/api/services/authService";
import useGlobalAuth from "../../../hooks/useAuth";
import AuthCard from "../../../components/ui/AuthCard.jsx";
import { USER_ROLES, USER_TYPES, ROUTES } from "../../../utils/constants";
import { getRegisterErrorMessage } from "../../../utils/authErrors";
import RegisterForm from "./components/RegisterForm";

export default function RegisterPage() {
  const location = useLocation();
  const { Login } = useGlobalAuth();
  const { currentUserType } = location.state?.from.state || {
    currentUserType: USER_TYPES.PATHOLOGIST,
  };
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegisterSubmit = async ({
    userType,
    name,
    hospital,
    location: userLocation,
    email,
    password,
    gtoken,
  }) => {
    setIsLoading(true);
    const role =
      userType === USER_TYPES.PATHOLOGIST
        ? USER_ROLES.ANNONATOR
        : USER_ROLES.UPLOADER;

    try {
      const data = await SignupAPI({
        role: role,
        name: name,
        hospital: hospital,
        location: userLocation,
        email: email,
        password: password,
        gtoken: gtoken,
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
      console.error("Registration error:", error);
      const errorMessage = getRegisterErrorMessage(error);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthCard subtitle="Register to access your portal">
      <RegisterForm
        onSubmit={handleRegisterSubmit}
        isLoading={isLoading}
        initialUserType={currentUserType}
      />
    </AuthCard>
  );
}
