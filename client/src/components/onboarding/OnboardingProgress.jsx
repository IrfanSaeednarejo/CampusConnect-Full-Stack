export default function OnboardingProgress({
  currentStep = 0,
  totalSteps = 0,
  label,
  showBar = true,
  className = "",
  textClassName = "",
}) {
  const percentage = totalSteps
    ? Math.round((currentStep / totalSteps) * 100)
    : 0;

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <div className="flex justify-between">
        <p className={`text-sm font-medium text-[#c9d1d9]/80 ${textClassName}`}>
          {label || `Step ${currentStep} of ${totalSteps}`}
        </p>
      </div>
      {showBar && (
        <div className="h-2 w-full rounded-full bg-[#30363d]">
          <div
            className="h-2 rounded-full bg-[#238636]"
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
      )}
    </div>
  );
}
