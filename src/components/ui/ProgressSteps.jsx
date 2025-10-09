const ProgressSteps = ({ currentStep, steps }) => {
  return (
    <div className="flex justify-center items-center mb-12 gap-8">
      {steps.map((step, index) => {
        const stepNumber = index + 1;
        const isActive = currentStep === step.key;
        const isCompleted =
          steps.findIndex((s) => s.key === currentStep) > index;

        return (
          <div
            key={step.key}
            className="flex flex-col items-center gap-2 relative"
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm ${
                isActive
                  ? "bg-blue-500 text-white"
                  : isCompleted
                  ? "bg-green-500 text-white"
                  : "bg-slate-300 text-slate-600"
              }`}
            >
              {stepNumber}
            </div>
            <span
              className={`text-sm font-medium ${
                isActive
                  ? "text-blue-500"
                  : isCompleted
                  ? "text-green-500"
                  : "text-slate-600"
              }`}
            >
              {step.label}
            </span>
            {isCompleted && index < steps.length - 1 && (
              <div className="absolute top-4 left-full w-8 h-0.5 bg-green-500 -z-10"></div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default ProgressSteps;
