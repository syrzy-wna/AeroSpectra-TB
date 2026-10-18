import { DEMO_SCENARIOS, generateSyntheticCxr } from "@/lib/sampleCases";
import { Sparkles, CheckCircle2, AlertTriangle, AlertCircle, FileText } from "lucide-react";
import { NEW_SCREENING } from "@/constants/testIds";

const DemoScenarioPicker = ({ onSelectScenario, disabled }) => {
  const handleSelect = (scenario) => {
    if (disabled) return;
    const cxrDataUrl = generateSyntheticCxr(scenario.type);
    onSelectScenario({
      ...scenario,
      image_base64: cxrDataUrl,
    });
  };

  const getScenarioIcon = (type) => {
    switch (type) {
      case "normal":
        return <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />;
      case "moderate":
        return <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />;
      case "severe":
        return <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0" />;
      case "invalid":
        return <FileText className="h-4 w-4 text-slate-600 shrink-0" />;
      default:
        return <Sparkles className="h-4 w-4 text-emerald-600 shrink-0" />;
    }
  };

  return (
    <div className="space-y-3 rounded-lg border border-emerald-200/80 bg-emerald-50/40 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-emerald-700" />
          <span className="font-heading text-xs font-bold uppercase tracking-wider text-emerald-900">
            One-Click Clinical Scenarios (Ujian Pantas Juri)
          </span>
        </div>
        <span className="text-[11px] text-muted-foreground">
          Click any preset to auto-load patient & CXR
        </span>
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {DEMO_SCENARIOS.map((sc) => (
          <button
            key={sc.id}
            type="button"
            data-testid={NEW_SCREENING.sampleScenarioButton}
            onClick={() => handleSelect(sc)}
            disabled={disabled}
            className="flex items-start gap-2.5 rounded-md border border-emerald-100 bg-white p-2.5 text-left transition-all hover:border-emerald-500 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 disabled:opacity-50"
          >
            {getScenarioIcon(sc.type)}
            <div className="min-w-0 flex-1">
              <p className="truncate font-heading text-xs font-semibold text-foreground">
                {sc.title}
              </p>
              <p className="line-clamp-2 text-[11px] text-muted-foreground">
                {sc.description}
              </p>
              <div className="mt-1 flex items-center gap-2 font-mono text-[10px] text-emerald-700">
                <span>{sc.patient_category}</span>
                <span>·</span>
                <span>{sc.age}y / {sc.gender}</span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default DemoScenarioPicker;
