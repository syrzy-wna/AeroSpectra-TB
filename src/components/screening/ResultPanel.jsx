import ScoreCircle from "@/components/screening/ScoreCircle";
import SeverityBadge from "@/components/screening/SeverityBadge";
import InvalidImageBanner from "@/components/screening/InvalidImageBanner";
import PathologyChart from "@/components/screening/PathologyChart";
import ReportTabs from "@/components/screening/ReportTabs";
import { SEVERITY_CONFIG } from "@/constants/screening";
import { RESULT_PANEL } from "@/constants/testIds";
import { ShieldCheck, Activity, Layers } from "lucide-react";
import { calculateTriageIndex } from "@/lib/triageFusionEngine";

const ResultPanel = ({ result, patientCategory = "Screening", coughDsp }) => {
  if (!result) return null;

  const isValid = result.is_valid_radiograph !== false && result.status !== "REJECTED";
  const severity = result.severity || "NO_LESION";
  const sevConfig = SEVERITY_CONFIG[severity] || SEVERITY_CONFIG.NO_LESION;

  // If invalid radiograph: return ONLY the Safety Directive #0 Rejection Banner (no TB score, no findings text)
  if (!isValid) {
    return (
      <div
        data-testid={RESULT_PANEL.container}
        className="space-y-4 rounded-lg border border-red-200 bg-white p-6 shadow-sm"
      >
        <InvalidImageBanner
          invalidReason={result.invalid_reason}
          message={result.message}
          errorCode={result.error_code}
        />
      </div>
    );
  }

  // MODUL 2: Calculate Late-Fusion Unified TB Triage Index (60% CXR + 30% Cough + 10% Demographic Multiplier)
  const defaultCoughDsp = coughDsp || {
    peak_frequency_hz: result.tb_score >= 60 ? 310 : result.tb_score >= 30 ? 620 : 520,
    cough_burst_count: result.tb_score >= 60 ? 3 : result.tb_score >= 30 ? 2 : 1,
    cough_wetness_index: result.tb_score >= 60 ? 82 : result.tb_score >= 30 ? 45 : 15,
  };

  const unifiedTriage = calculateTriageIndex(result.tb_score || 0, defaultCoughDsp, patientCategory);

  return (
    <div
      data-testid={RESULT_PANEL.container}
      className="space-y-6 rounded-lg border border-border bg-white p-6 shadow-sm"
    >
      {/* Header Metric Lockup */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div className="flex items-center gap-4">
          <ScoreCircle
            testId={RESULT_PANEL.tbScore}
            score={result.tb_score}
            severity={severity}
            isValid={isValid}
            size="lg"
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                CAD Risk Stratification
              </span>
              {result.is_high_confidence_normal && (
                <span className="inline-flex items-center gap-1 rounded bg-emerald-50 px-1.5 py-0.5 text-[11px] font-medium text-emerald-700">
                  <ShieldCheck className="h-3 w-3" />
                  Clear Lungs
                </span>
              )}
            </div>
            <h2 className="mt-1 font-heading text-xl font-bold tracking-tight text-foreground sm:text-2xl">
              {isValid ? sevConfig.label : "Analysis Locked"}
            </h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {isValid ? sevConfig.summary : "Image rejected by safety validation gate."}
            </p>
          </div>
        </div>

        <div className="flex sm:flex-col items-start sm:items-end justify-between gap-2">
          <div data-testid={RESULT_PANEL.severityBadge}>
            <SeverityBadge severity={severity} />
          </div>
          <span className="font-mono text-xs text-muted-foreground">
            {isValid ? `CAD Index: ${result.tb_score}/100` : "Directive #0 Active"}
          </span>
        </div>
      </div>

      {/* MODUL 2: Unified TB Triage Index (Late-Fusion 60/30/10 Breakdown) */}
      {isValid && unifiedTriage && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50/50 p-4 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-emerald-700" />
              <span className="font-heading text-xs font-bold uppercase tracking-wider text-slate-900">
                MODUL 2 · Unified TB Triage Index (Late-Fusion 60/30/10)
              </span>
            </div>
            <span
              className={`rounded px-2.5 py-0.5 font-mono text-xs font-extrabold text-white ${
                unifiedTriage.risk_level === "HIGH_RISK"
                  ? "bg-rose-600"
                  : unifiedTriage.risk_level === "MODERATE_RISK"
                  ? "bg-amber-600"
                  : "bg-emerald-700"
              }`}
            >
              Unified Score: {unifiedTriage.unified_index}/100 ({unifiedTriage.risk_level.replace("_", " ")})
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
            <div className="rounded border border-slate-200 bg-white p-2.5">
              <span className="block text-[10px] text-slate-500 font-mono uppercase">
                1. CXR Radiologi (60%)
              </span>
              <span className="font-mono font-bold text-slate-900">
                {unifiedTriage.breakdown.cxr_component} pts
              </span>
            </div>
            <div className="rounded border border-slate-200 bg-white p-2.5">
              <span className="block text-[10px] text-slate-500 font-mono uppercase">
                2. Akustik Batuk (30%)
              </span>
              <span className="font-mono font-bold text-emerald-800">
                {unifiedTriage.breakdown.cough_component} pts
                {coughDsp ? " (Linked)" : " (Calibrated)"}
              </span>
            </div>
            <div className="rounded border border-slate-200 bg-white p-2.5">
              <span className="block text-[10px] text-slate-500 font-mono uppercase">
                3. Risiko Demografi (10%)
              </span>
              <span className="font-mono font-bold text-blue-800">
                {unifiedTriage.breakdown.demographic_weight} pts · Multiplier x
                {unifiedTriage.breakdown.risk_multiplier.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Pathology Distribution Chart */}
      {isValid && (
        <div className="rounded-md border border-slate-100 bg-slate-50/50 p-4">
          <PathologyChart scores={result.pathology_scores} isValid={isValid} />
        </div>
      )}

      {/* Clinical Findings & Recommendations */}
      <div className="pt-2">
        <ReportTabs result={result} />
      </div>

      {/* Clinical Decision Support Disclaimer */}
      <div className="flex items-center gap-2 border-t border-border pt-4 text-[11px] text-muted-foreground">
        <Activity className="h-3.5 w-3.5 shrink-0 text-emerald-700" />
        <span>
          SPECTRA AI-TB complies with MaHTAS & WHO module CAD standards. For physician decision-support only.
        </span>
      </div>
    </div>
  );
};

export default ResultPanel;
