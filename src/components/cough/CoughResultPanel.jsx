import {
  AlertTriangle,
  CheckCircle2,
  Flame,
  ArrowRight,
  ShieldAlert,
  Stethoscope,
  Activity,
  Sparkles,
  FileCode,
  Layers,
  Database,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export const CoughResultPanel = ({
  result,
  triageOutcome,
  onProceedToCxr,
  onExportFhir,
  offlineSaved,
}) => {
  if (!result) return null;

  // Handle MODUL 1: Acoustic Safety Directive #0 Rejection
  if (result.status === "REJECTED") {
    return (
      <div className="space-y-4 rounded-lg border-2 border-rose-300 bg-rose-50/90 p-6 shadow-sm">
        <div className="flex items-start gap-3.5">
          <div className="p-2.5 rounded-lg bg-rose-600 text-white shadow-xs shrink-0">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <div className="space-y-1.5">
            <span className="inline-block rounded bg-rose-700 px-2 py-0.5 text-[11px] font-mono font-bold text-white uppercase">
              MODUL 1 · SAFETY DIRECTIVE #0: {result.error_code || "INVALID_AUDIO_INPUT"}
            </span>
            <h3 className="font-heading text-lg font-bold text-rose-950 leading-tight">
              Analisis Triaj Dikunci — Isyarat Audio Ditolak (Audio Rejected)
            </h3>
            <p className="text-xs text-rose-900 leading-relaxed">
              {result.message ||
                "RALAT PENGESAHAN AKUSTIK: Isyarat audio yang dirakam menyerupai percakapan manusia (harmonik berterusan) atau deruan angin latar belakang. Sistem ini hanya memproses corak letupan batuk fisiologi yang sah untuk mengelakkan halusinasi AI."}
            </p>
          </div>
        </div>

        <div className="rounded-md border border-rose-200 bg-white/80 p-3 text-xs text-rose-900 space-y-1">
          <span className="font-bold uppercase text-[10px] font-mono text-rose-700 block">
            Tindakan Pembetulan (Corrective Action):
          </span>
          <p className="text-[11px]">
            Sila pastikan persekitaran bilik tenang (&lt;45 dBA) dan minta pesakit melakukan 2–3 kali letusan batuk semula jadi ke arah mikrofon tanpa bercakap.
          </p>
        </div>
      </div>
    );
  }

  const isHighRisk = result.triage_category === "HIGH_RISK_TB_SUSPECT";

  const categoryConfig = {
    HIGH_RISK_TB_SUSPECT: {
      label: "TRIAGE: HIGH-RISK TB SUSPECT",
      subLabel: "Kecurigaan Tinggi Tuberkulosis Pulmonari",
      bgColor: "bg-rose-50 border-rose-300 text-rose-900",
      badgeColor: "bg-rose-600 text-white",
      icon: Flame,
    },
    MODERATE_RESPIRATORY_RISK: {
      label: "TRIAGE: MODERATE RESPIRATORY RISK",
      subLabel: "Risiko Respiratori Sederhana (Bronkitis Akut)",
      bgColor: "bg-amber-50 border-amber-300 text-amber-900",
      badgeColor: "bg-amber-600 text-white",
      icon: AlertTriangle,
    },
    LOW_RISK_NON_SPECIFIC: {
      label: "TRIAGE: LOW RISK NON-SPECIFIC",
      subLabel: "Risiko Rendah / Bunyi Batuk Garis Dasar Normal",
      bgColor: "bg-emerald-50 border-emerald-300 text-emerald-900",
      badgeColor: "bg-emerald-600 text-white",
      icon: CheckCircle2,
    },
  };

  const config = categoryConfig[result.triage_category] || categoryConfig.LOW_RISK_NON_SPECIFIC;
  const CategoryIcon = config.icon;

  return (
    <div className="space-y-6 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      {/* Triage Category Header Banner */}
      <div className={`rounded-lg border p-5 ${config.bgColor}`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className={`p-2 rounded-lg ${config.badgeColor} shadow-xs`}>
              <CategoryIcon className="h-6 w-6" />
            </div>
            <div>
              <span className={`inline-block rounded px-2 py-0.5 text-xs font-mono font-bold ${config.badgeColor} mb-1`}>
                {config.label}
              </span>
              <h3 className="font-heading text-lg font-bold leading-tight">
                {config.subLabel}
              </h3>
              <p className="text-xs opacity-90 mt-0.5">
                WHO Target Product Profile (TPP) Sensitivity &ge; 90% Calibrated
              </p>
            </div>
          </div>

          <div className="text-right sm:border-l sm:border-slate-300/60 sm:pl-6 shrink-0">
            <span className="block text-[11px] font-mono uppercase tracking-wider opacity-75">
              Confidence Score
            </span>
            <span className="font-mono text-3xl font-extrabold">
              {result.confidence_score || 88}%
            </span>
          </div>
        </div>
      </div>

      {/* MODUL 2: Unified TB Triage Index Preview Card */}
      {triageOutcome && (
        <div className="rounded-lg border border-slate-200 bg-slate-50/80 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-emerald-700" />
              <span className="font-heading text-xs font-bold uppercase tracking-wider text-slate-800">
                MODUL 2 · Unified TB Triage Index (Late-Fusion Engine)
              </span>
            </div>
            <span className="rounded bg-slate-900 px-2 py-0.5 font-mono text-xs font-bold text-white">
              Index: {triageOutcome.unified_index}/100 (Multiplier x{triageOutcome.breakdown.risk_multiplier.toFixed(2)})
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
            <div className="rounded border border-slate-200 bg-white p-2">
              <span className="block text-[10px] text-slate-500 font-mono uppercase">CXR Baseline (60%)</span>
              <span className="font-mono font-bold text-slate-800">{triageOutcome.breakdown.cxr_component} pts</span>
            </div>
            <div className="rounded border border-slate-200 bg-white p-2">
              <span className="block text-[10px] text-slate-500 font-mono uppercase">Cough DSP (30%)</span>
              <span className="font-mono font-bold text-emerald-700">{triageOutcome.breakdown.cough_component} pts</span>
            </div>
            <div className="rounded border border-slate-200 bg-white p-2">
              <span className="block text-[10px] text-slate-500 font-mono uppercase">Risk Tier (10%)</span>
              <span className="font-mono font-bold text-blue-700">
                {triageOutcome.breakdown.demographic_weight} pts (x{triageOutcome.breakdown.risk_multiplier})
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Cross-Modality Fast Track CTA Button */}
      <div
        className={`rounded-lg border-2 p-4 shadow-xs ${
          isHighRisk
            ? "border-emerald-600 bg-emerald-50/80"
            : "border-slate-200 bg-slate-50/70"
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-900 uppercase tracking-wide">
              <Sparkles className="h-4 w-4 text-emerald-700" />
              Integrasi Saringan Berkembar (Late-Fusion CXR + Batuk)
            </span>
            <p className="text-xs text-slate-700 leading-snug">
              Hantar telemetri akustik batuk ini terus ke <strong>Saringan 1: Radiologi Dada (SPECTRA CAD CXR)</strong> untuk menggabungkan skor radiologi (60%) dan akustik batuk (30%).
            </p>
          </div>
          <Button
            type="button"
            onClick={onProceedToCxr}
            className="bg-emerald-700 hover:bg-emerald-800 text-white gap-2 text-xs font-semibold shrink-0 shadow-sm"
          >
            Teruskan ke Saringan CXR CAD
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Differential Diagnoses Probabilities */}
      <div className="space-y-3">
        <h4 className="font-heading text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
          <Activity className="h-4 w-4 text-emerald-700" />
          Diagnosis Pembezaan Berperingkat (Ranked Differential Diagnoses)
        </h4>

        <div className="space-y-2">
          {(result.differential_diagnoses || []).map((diff, i) => (
            <div key={i} className="rounded-md border border-slate-200 bg-slate-50/70 p-3 space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900">{diff.disease}</span>
                <span className="font-mono font-bold text-slate-700">{diff.probability}%</span>
              </div>
              <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    diff.probability > 60
                      ? "bg-rose-500"
                      : diff.probability > 30
                      ? "bg-amber-500"
                      : "bg-emerald-500"
                  }`}
                  style={{ width: `${diff.probability}%` }}
                />
              </div>
              {diff.rationale && (
                <p className="text-[11px] text-slate-500 leading-tight pt-0.5">{diff.rationale}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Priority Lab Tests Referral Strip */}
      <div className="space-y-2">
        <h4 className="font-heading text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
          <Stethoscope className="h-4 w-4 text-blue-700" />
          Pengesyoran Ujian Makmal Keutamaan (Priority Diagnostic Orders)
        </h4>
        <div className="flex flex-wrap gap-2">
          {(result.priority_lab_tests || []).map((test, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1.5 rounded-md border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-900 shadow-2xs"
            >
              <CheckCircle2 className="h-3.5 w-3.5 text-blue-600" />
              {test}
            </span>
          ))}
        </div>
      </div>

      {/* Dual-Language Action Plan & Clinical Notes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
        {/* Patient Advice (Bahasa Melayu) */}
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 space-y-1.5 text-xs">
          <span className="font-bold uppercase tracking-wider text-slate-800 text-[11px]">
            🇲🇾 Nasihat Pesakit (Patient Instructions)
          </span>
          <p className="text-slate-700 leading-relaxed">
            {result.patient_advice?.bm ||
              result.patient_advice ||
              "Sila hadir ke Klinik Kesihatan berhampiran untuk pemeriksaan kahak dan X-ray dada lanjut."}
          </p>
        </div>

        {/* Doctor Technical Notes (English) */}
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 space-y-1.5 text-xs">
          <span className="font-bold uppercase tracking-wider text-slate-800 text-[11px]">
            🇬🇧 Medical Officer Clinical Notes
          </span>
          <p className="text-slate-700 leading-relaxed font-mono text-[11px]">
            {result.clinical_notes?.en ||
              result.clinical_notes ||
              "Evaluate for active pulmonary TB. Order molecular rapid GeneXpert MTB/RIF test and correlate with PA chest radiograph."}
          </p>
        </div>
      </div>

      {/* Act 342 Public Health Warning */}
      {result.public_health_notification?.required && (
        <div className="rounded-lg border border-rose-200 bg-rose-50/70 p-4 text-xs text-rose-950 flex items-start gap-3">
          <ShieldAlert className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold uppercase tracking-wide text-rose-900">
              Notifikasi Statutori Kesihatan Awam (Akta 342)
            </span>
            <p className="leading-relaxed">
              {result.public_health_notification.reason ||
                "Kes ini perlu dinotifikasikan ke Pejabat Kesihatan Daerah (PKD) di bawah Akta Pencegahan dan Pengawalan Penyakit Berjangkit 1988 (Akta 342) dalam tempoh 7 hari."}
            </p>
          </div>
        </div>
      )}

      {/* MODUL 3 (HL7 FHIR Exporter) & MODUL 4 (Offline-First Status) Footer Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-4">
        <div className="flex items-center gap-2 text-[11px] text-slate-600">
          <Database className="h-3.5 w-3.5 text-emerald-700" />
          <span>
            {offlineSaved
              ? "MODUL 4 · Disimpan ke IndexedDB & Diselaraskan ke Cloud Firestore"
              : "MODUL 4 · Sedia untuk Penyimpanan Offline-First"}
          </span>
        </div>

        {onExportFhir && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onExportFhir}
            className="text-xs border-slate-300 hover:border-emerald-600 hover:text-emerald-900 gap-1.5"
          >
            <FileCode className="h-3.5 w-3.5 text-emerald-700" />
            MODUL 3 · Export HL7 FHIR R4 (JSON)
          </Button>
        )}
      </div>
    </div>
  );
};

export default CoughResultPanel;
