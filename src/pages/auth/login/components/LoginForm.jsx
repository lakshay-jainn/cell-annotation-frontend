import { useState } from "react";
import { Link } from "react-router-dom";
import UserTypeToggle from "../../../../components/ui/UserTypeToggle.jsx";
import FormField from "../../../../components/ui/FormField.jsx";
import SubmitButton from "../../../../components/ui/SubmitButton.jsx";
import { USER_TYPES, ROUTES } from "../../../../utils/constants.js";

const LoginForm = ({
  onSubmit,
  isLoading,
  initialUserType = USER_TYPES.PATHOLOGIST,
}) => {
  const [userType, setUserType] = useState(initialUserType);

  const handleSubmit = (e) => {
    e.preventDefault();
    const formdata = new FormData(e.target);
    const email = formdata.get("email");
    const password = formdata.get("password");
    onSubmit({ userType, email, password });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* User Type Slider */}
      <UserTypeToggle
        userType={userType}
        setUserType={setUserType}
        label="login as:"
      />

      {/* Email Field */}
      <FormField
        label="Email Address"
        name="email"
        type="email"
        placeholder="Enter your email"
        required
      />

      {/* Password Field */}
      <FormField
        label="Password"
        name="password"
        type="password"
        placeholder="Enter your password"
        required
      />

      {/* Login Button */}
      <SubmitButton
        userType={userType}
        isLoading={isLoading}
        loadingText="Signing in..."
      >
        {`Sign in as ${userType}`}
      </SubmitButton>

      <div className="w-full text-center">
        <Link className="text-blue-600" to={ROUTES.REGISTER}>
          Create an account!
        </Link>
      </div>
    </form>
  );
};

export default LoginForm;
