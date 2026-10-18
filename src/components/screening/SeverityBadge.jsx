import { SEVERITY_CONFIG } from "@/constants/screening";
import { cn } from "@/lib/utils";

const SeverityBadge = ({ severity = "NO_LESION", className, showBm = true }) => {
  const config = SEVERITY_CONFIG[severity] || SEVERITY_CONFIG.NO_LESION;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap",
        config.badgeClass,
        className
      )}
    >
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ backgroundColor: config.color }}
      />
      <span>{config.label}</span>
      {showBm && (
        <span className="opacity-75 font-normal">
          ({config.labelBm})
        </span>
      )}
    </span>
  );
};

export default SeverityBadge;
