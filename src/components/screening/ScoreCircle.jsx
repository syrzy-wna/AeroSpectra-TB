import { cn } from "@/lib/utils";

const ScoreCircle = ({
  score = 0,
  severity = "NO_LESION",
  isValid = true,
  testId,
  className,
  size = "md",
}) => {
  const numericScore = isValid ? Math.max(0, Math.min(100, Math.round(score))) : 0;

  // Determine stroke color
  let strokeColor = "#059669"; // Green
  let trackColor = "#E2E8F0";
  let textColor = "text-emerald-700";

  if (!isValid) {
    strokeColor = "#94A3B8";
    textColor = "text-muted-foreground";
  } else if (numericScore > 85 || severity === "SEVERE") {
    strokeColor = "#E11D48"; // Rose/Red
    textColor = "text-rose-700";
  } else if (numericScore >= 61 || severity === "MODERATE") {
    strokeColor = "#D97706"; // Amber
    textColor = "text-amber-700";
  } else if (numericScore >= 30 || severity === "MINIMAL") {
    strokeColor = "#2563EB"; // Blue
    textColor = "text-blue-700";
  }

  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = isValid
    ? circumference - (numericScore / 100) * circumference
    : circumference;

  const isLarge = size === "lg";

  return (
    <div
      data-testid={testId}
      className={cn(
        "relative flex flex-col items-center justify-center shrink-0",
        isLarge ? "h-28 w-28" : "h-14 w-14",
        className
      )}
    >
      <svg
        className="h-full w-full -rotate-90 transform"
        viewBox="0 0 100 100"
      >
        {/* Track circle */}
        <circle
          cx="50"
          cy="50"
          r={radius}
          stroke={trackColor}
          strokeWidth={isLarge ? "8" : "9"}
          fill="transparent"
        />
        {/* Animated fill arc */}
        {isValid && (
          <circle
            cx="50"
            cy="50"
            r={radius}
            stroke={strokeColor}
            strokeWidth={isLarge ? "8" : "9"}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-700 ease-out"
          />
        )}
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {isValid ? (
          <>
            <span
              className={cn(
                "font-mono font-bold leading-none tabular-nums",
                textColor,
                isLarge ? "text-3xl" : "text-sm"
              )}
            >
              {numericScore}
            </span>
            {isLarge && (
              <span className="mt-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                TB SCORE
              </span>
            )}
          </>
        ) : (
          <span className="font-mono text-sm font-semibold text-muted-foreground">
            --
          </span>
        )}
      </div>
    </div>
  );
};

export default ScoreCircle;
