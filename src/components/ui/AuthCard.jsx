const AuthCard = ({ title, subtitle, children }) => {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">
            EBUS - TBNA
          </h1>
          <p className="text-slate-600">{subtitle}</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-8">
          {children}

          {/* Footer */}
          <div className="mt-6 pt-6 border-t border-slate-200">
            <p className="text-center text-sm text-slate-500">
              Secure access to medical laboratory systems
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthCard;
