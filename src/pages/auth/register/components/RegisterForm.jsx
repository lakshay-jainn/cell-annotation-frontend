import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import ReCAPTCHA from "react-google-recaptcha";
import UserTypeToggle from "../../../../components/ui/UserTypeToggle.jsx";
import FormField from "../../../../components/ui/FormField.jsx";
import SubmitButton from "../../../../components/ui/SubmitButton.jsx";
import { USER_TYPES, ROUTES } from "../../../../utils/constants.js";

const RegisterForm = ({
  onSubmit,
  isLoading,
  initialUserType = USER_TYPES.PATHOLOGIST,
}) => {
  const [userType, setUserType] = useState(initialUserType);
  const [gtoken, setgToken] = useState(null);
  const recaptchaRef = useRef();
  const siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY;

  const handleCaptchaChange = (value) => {
    setgToken(value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formdata = new FormData(e.target);
    const name = formdata.get("name");
    const hospital = formdata.get("hospital");
    const location = formdata.get("location");
    const email = formdata.get("email");
    const password = formdata.get("password");

    onSubmit({ userType, name, hospital, location, email, password, gtoken });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* User Type Slider */}
      <UserTypeToggle
        userType={userType}
        setUserType={setUserType}
        label="register as:"
      />

      {/* Name Field */}
      <FormField
        label="Name"
        name="name"
        type="text"
        placeholder="Enter your name"
        required
      />

      {/* Hospital Field */}
      <FormField
        label="Hospital"
        name="hospital"
        type="text"
        placeholder="Enter your associated hospital name"
        required
      />

      {/* Location Field */}
      <FormField
        label="Location"
        name="location"
        type="text"
        placeholder="Enter your location"
        required
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

      <ReCAPTCHA
        ref={recaptchaRef}
        sitekey={siteKey}
        onChange={handleCaptchaChange}
      />

      {/* Register Button */}
      <SubmitButton
        userType={userType}
        isLoading={isLoading}
        disabled={!gtoken}
        loadingText="Registering..."
      >
        {`Register as ${userType}`}
      </SubmitButton>

      <div className="w-full text-center">
        <Link className="text-blue-600" to={ROUTES.LOGIN}>
          Login here!
        </Link>
      </div>
    </form>
  );
};

export default RegisterForm;
