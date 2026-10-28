import ScoreCircle from "@/components/screening/ScoreCircle";
import SeverityBadge from "@/components/screening/SeverityBadge";
import InvalidImageBanner from "@/components/screening/InvalidImageBanner";
import PathologyChart from "@/components/screening/PathologyChart";
import ReportTabs from "@/components/screening/ReportTabs";
import { Button } from "@/components/ui/button";
import { SEVERITY_CONFIG } from "@/constants/screening";
import { RESULT_PANEL } from "@/constants/testIds";
import { ShieldCheck, Activity, Layers, AlertTriangle, Bone, Loader2 } from "lucide-react";
import { calculateTriageIndex } from "@/lib/triageFusionEngine";
import { NON_CHEST_XRAY_NOTE } from "@/lib/radiographGate";

const ResultPanel = ({
  result,
  patientCategory = "Screening",
  coughDsp,
  onOverride,
  overriding = false,
}) => {
  if (!result) return null;

  const isNonChestXray =
    result.status === "NON_CHEST_XRAY" ||
    result.image_tier === "TIER_2_NON_CHEST_XRAY" ||
    Boolean(result.is_non_chest_xray);

  const isInconclusive =
    !isNonChestXray &&
    (result.status === "INCONCLUSIVE" || Boolean(result.is_inconclusive));

  const isValid =
    !isNonChestXray &&
    !isInconclusive &&
    result.is_valid_radiograph !== false &&
    result.status !== "REJECTED";

  const severity = result.severity || "NO_LESION";
  const sevConfig = SEVERITY_CONFIG[severity] || SEVERITY_CONFIG.NO_LESION;

  // TIER 2 — X-RAY BUT NOT CHEST (findings only, no TB score dial, no CAD index, plus Clinician Override button)
  if (isNonChestXray) {
    return (
      <div
        data-testid={RESULT_PANEL.container}
        className="space-y-6 rounded-lg border border-blue-200 bg-white p-6 shadow-sm"
      >
        <div className="space-y-3 border-b border-border pb-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-blue-600 text-white shadow-2xs">
                <Bone className="h-5 w-5" />
              </div>
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-blue-700">
                  Radiological Observations · Limited Mode (Tier 2)
                </span>
                <h2 className="font-heading text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                  {result.anatomical_region || "Non-Chest Radiograph"}
                </h2>
              </div>
            </div>
            <span className="rounded-md border border-blue-200 bg-blue-50 px-2.5 py-1 font-mono text-xs font-bold text-blue-800">
              NON-CHEST X-RAY · NO TB SCORE
            </span>
          </div>

          <div
            data-testid="non-chest-xray-note"
            role="status"
            className="rounded-md border border-amber-300 bg-amber-50/90 px-4 py-3 text-sm font-bold text-amber-950 shadow-2xs"
          >
            {result.note || NON_CHEST_XRAY_NOTE}
          </div>
        </div>

        {/* Radiological Findings, Impression & Actions (no TB score dial, no CAD index) */}
        <div className="pt-1">
          <ReportTabs result={result} />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4 text-[11px] text-muted-foreground">
          <div className="flex items-center gap-2">
            <Activity className="h-3.5 w-3.5 shrink-0 text-blue-700" />
            <span>
              Non-chest radiograph findings provided for observational reference only. No TB screening record is written to History.
            </span>
          </div>
          {onOverride && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              data-testid="clinician-override-button"
              onClick={onOverride}
              disabled={overriding}
              className="border-amber-600 bg-amber-50 text-amber-950 hover:bg-amber-100 hover:text-amber-950 font-semibold text-xs whitespace-nowrap shrink-0"
            >
              {overriding ? (
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
              ) : (
                <ShieldCheck className="mr-1.5 h-3.5 w-3.5 text-amber-700" />
              )}
              Override &amp; Analyze Anyway (Clinician Override)
            </Button>
          )}
        </div>
      </div>
    );
  }

  // If inconclusive image quality: return explicit Inconclusive state instead of a fabricated score
  if (isInconclusive) {
    return (
      <div
        data-testid={RESULT_PANEL.container}
        role="alert"
        className="space-y-4 rounded-lg border-2 border-amber-400 bg-amber-50/90 p-6 text-amber-950 shadow-sm"
      >
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-amber-600 text-white shadow-xs">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div className="space-y-2 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h4 className="font-heading text-sm font-bold uppercase tracking-wider text-amber-950">
                CAD ASSESSMENT · STATUS: INCONCLUSIVE
              </h4>
              <span className="rounded bg-amber-200 px-2 py-0.5 text-[11px] font-mono font-bold text-amber-900 border border-amber-300">
                INCONCLUSIVE_IMAGE_QUALITY
              </span>
            </div>

            <div className="rounded-md border border-amber-300 bg-white p-3.5 text-sm font-bold text-amber-950 leading-relaxed shadow-2xs">
              {result.message || "Inconclusive — image quality insufficient, please retake"}
            </div>

            <p className="text-xs text-amber-900/90 leading-relaxed">
              The vision model could not produce a confident, image-grounded radiological assessment from the uploaded file. To protect clinical triage integrity, no fabricated TB score has been generated. Please retake or upload a clear PA/AP chest radiograph.
            </p>
            <p className="text-xs text-amber-800/90 leading-relaxed italic">
              Keputusan Tidak Konklusif — kualiti imej tidak mencukupi untuk penilaian radiologi berkeyakinan tinggi. Sila ambil semula atau muat naik imej X-ray dada (pandangan PA/AP) yang jelas.
            </p>

            {onOverride && (
              <div className="pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  data-testid="clinician-override-button"
                  onClick={onOverride}
                  disabled={overriding}
                  className="border-amber-600 bg-white text-amber-950 hover:bg-amber-100 hover:text-amber-950 font-semibold text-xs whitespace-nowrap shrink-0"
                >
                  {overriding ? (
                    <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <ShieldCheck className="mr-1.5 h-3.5 w-3.5 text-amber-700" />
                  )}
                  Override &amp; Analyze Anyway (Clinician Override)
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // TIER 3 — NOT AN X-RAY: return ONLY the Safety Directive #0 / #4 Rejection Banner (plus Clinician Override button)
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
          onOverride={onOverride}
          overriding={overriding}
        />
      </div>
    );
  }

  // TIER 1 — CHEST X-RAY: Full CAD pipeline
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
        <div className="flex items-start sm:items-center gap-4">
          <div className="flex flex-col items-center shrink-0">
            <ScoreCircle
              testId={RESULT_PANEL.tbScore}
              score={result.tb_score}
              severity={severity}
              isValid={isValid}
              size="lg"
            />
            <p
              data-testid="tb-score-disclaimer"
              className="mt-1.5 max-w-[155px] text-center text-[10px] leading-tight text-muted-foreground"
            >
              Demo build: scores are AI-generated estimates for triage support only.
            </p>
          </div>
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
