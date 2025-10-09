const UserInfoCard = ({ name, hospital, location, accentColor = "blue" }) => {
  const colorClass =
    accentColor === "blue" ? "text-blue-800" : "text-green-800";

  return (
    <div className="w-full sm:max-w-[300px] bg-gradient-to-r from-gray-50 to-gray-50 border border-gray-200 rounded-lg p-4">
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-gray-600"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 2a4 4 0 110 8 4 4 0 010-8zm-6 14a6 6 0 1112 0H4z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="min-w-0 flex-1">
            <p className={`text-sm font-medium ${colorClass} truncate`}>
              Hi! {name}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-gray-600"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M6 2a1 1 0 00-1 1v14h10V3a1 1 0 00-1-1H6zm3 4h2v2h2v2h-2v2H9v-2H7V8h2V6z" />
              <path d="M4 17h12v1a1 1 0 01-1 1H5a1 1 0 01-1-1v-1z" />
            </svg>
          </div>
          <div className="min-w-0 flex-1">
            <p className={`text-sm font-medium ${colorClass} truncate`}>
              {hospital}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-gray-600"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 2a6 6 0 016 6c0 4.418-6 10-6 10S4 12.418 4 8a6 6 0 016-6zm0 8a2 2 0 100-4 2 2 0 000 4z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="min-w-0 flex-1">
            <p className={`text-sm font-medium ${colorClass} truncate`}>
              {location}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserInfoCard;
