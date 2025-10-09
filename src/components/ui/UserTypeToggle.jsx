import { USER_TYPES } from "../../utils/constants";

const UserTypeToggle = ({
  userType,
  setUserType,
  label = "Select user type:",
}) => {
  return (
    <div className="space-y-3">
      <label className="block text-sm font-semibold text-slate-700">
        {label}
      </label>
      <div className="relative bg-slate-100 rounded-lg p-1">
        <div
          className={`absolute top-1 bottom-1 w-1/2 rounded-md transition-all duration-300 ${
            userType === USER_TYPES.PULMONOLOGIST
              ? "left-1 bg-blue-600"
              : "left-1/2 bg-green-600"
          }`}
        />
        <div className="relative flex">
          <button
            type="button"
            onClick={() => setUserType(USER_TYPES.PULMONOLOGIST)}
            className={`flex-1 py-3 px-4 text-sm font-medium rounded-md transition-colors cursor-pointer ${
              userType === USER_TYPES.PULMONOLOGIST
                ? "text-white"
                : "text-slate-600 hover:text-slate-800"
            }`}
          >
            Pulmonologist
          </button>
          <button
            type="button"
            onClick={() => setUserType(USER_TYPES.PATHOLOGIST)}
            className={`flex-1 py-3 px-4 text-sm font-medium rounded-md transition-colors cursor-pointer ${
              userType === USER_TYPES.PATHOLOGIST
                ? "text-white"
                : "text-slate-600 hover:text-slate-800"
            }`}
          >
            Pathologist
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserTypeToggle;
