import ScoreCircle from "@/components/screening/ScoreCircle";
import SeverityBadge from "@/components/screening/SeverityBadge";
import InvalidImageBanner from "@/components/screening/InvalidImageBanner";
import PathologyChart from "@/components/screening/PathologyChart";
import ReportTabs from "@/components/screening/ReportTabs";
import { SEVERITY_CONFIG } from "@/constants/screening";
import { RESULT_PANEL } from "@/constants/testIds";
import { ShieldCheck, Activity } from "lucide-react";

const ResultPanel = ({ result }) => {
  if (!result) return null;

  const isValid = result.is_valid_radiograph !== false && result.status !== "REJECTED";
  const severity = result.severity || "NO_LESION";
  const sevConfig = SEVERITY_CONFIG[severity] || SEVERITY_CONFIG.NO_LESION;

  return (
    <div
      data-testid={RESULT_PANEL.container}
      className="space-y-6 rounded-lg border border-border bg-white p-6 shadow-sm"
    >
      {/* If invalid radiograph: show Safety Gate Banner */}
      {!isValid && (
        <InvalidImageBanner
          invalidReason={result.invalid_reason}
          message={result.message}
          errorCode={result.error_code}
        />
      )}

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
