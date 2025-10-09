import { USER_TYPES } from "../../utils/constants";

const SubmitButton = ({
  userType,
  isLoading,
  disabled = false,
  loadingText,
  children,
}) => {
  return (
    <button
      type="submit"
      disabled={isLoading || disabled}
      className={`w-full py-3 px-6 mb-2 rounded-lg font-semibold text-white transition-colors cursor-pointer ${
        userType === USER_TYPES.PULMONOLOGIST
          ? "bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400"
          : "bg-green-600 hover:bg-green-700 disabled:bg-green-400"
      } disabled:cursor-not-allowed`}
    >
      {isLoading ? loadingText : children}
    </button>
  );
};

export default SubmitButton;
