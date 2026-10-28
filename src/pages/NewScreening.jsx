import { useEffect, useRef, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Loader2, Sparkles, RotateCcw, FileDown, ShieldCheck, BookOpen, Mic, Activity, FileCode, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import PatientForm from "@/components/screening/PatientForm";
import DemoScenarioPicker from "@/components/screening/DemoScenarioPicker";
import XrayUpload from "@/components/screening/XrayUpload";
import XrayViewer from "@/components/screening/XrayViewer";
import ResultPanel from "@/components/screening/ResultPanel";
import PrintableReport from "@/components/screening/PrintableReport";
import ClinicalFactsCarousel from "@/components/screening/ClinicalFactsCarousel";
import api from "@/lib/api";
import { downloadElementAsPdf } from "@/lib/pdfGenerator";
import { getDemoMode } from "@/lib/demoMode";
import { NEW_SCREENING, RESULT_PANEL, DETAIL, SETTINGS } from "@/constants/testIds";
import { LOGOS } from "@/constants/logos";
import { syncScreeningToFirestore } from "@/lib/firebase";
import { generateFhirReport } from "@/lib/fhirExporter";
import { saveScreeningOffline } from "@/lib/offlineSyncManager";
import {
  inspectImageRadiograph,
  REJECTED_CXR_MESSAGE,
  INCONCLUSIVE_CXR_MESSAGE,
} from "@/lib/radiographGate";

const initialForm = {
  patient_category: "Patient",
  age: "",
  gender: "Lelaki",
};

const DEMO_MODE_DURATION_MS = 15000;
const REAL_MODE_ESTIMATED_MS = 25000;

const CAD_STAGES = [
  "Executing Safety Directive #0 (Image Validity Gate)...",
  "Segmenting Lung Parenchyma & Costophrenic Angles...",
  "Analyzing Apical Infiltrates, Cavitation & Nodules...",
  "Synthesizing MaHTAS / WHO Clinical Stratification...",
];

const AnalyzingProgress = ({ demoMode }) => {
  const [progress, setProgress] = useState(6);
  const [stageIdx, setStageIdx] = useState(0);

  useEffect(() => {
    const duration = demoMode ? DEMO_MODE_DURATION_MS : REAL_MODE_ESTIMATED_MS;
    const tickMs = 200;
    const increment = 88 / (duration / tickMs);
    const interval = setInterval(() => {
      setProgress((p) => {
        const next = Math.min(p + increment, 94);
        if (next > 75) setStageIdx(3);
        else if (next > 50) setStageIdx(2);
        else if (next > 25) setStageIdx(1);
        return next;
      });
    }, tickMs);
    return () => clearInterval(interval);
  }, [demoMode]);

  return (
    <div className="space-y-2">
      <Progress value={progress} data-testid={NEW_SCREENING.progressBar} className="h-2" />
      <div className="flex items-center justify-between text-xs text-muted-foreground font-mono">
        <span className="flex items-center gap-1.5 text-emerald-700">
          <Loader2 className="h-3 w-3 animate-spin" />
          {CAD_STAGES[stageIdx]}
        </span>
        <span>{Math.round(progress)}%</span>
      </div>
    </div>
  );
};

const AnalyzingScreen = ({ demoMode }) => (
  <div
    data-testid={NEW_SCREENING.loadingIndicator}
    className="space-y-5 rounded-lg border border-border bg-white p-6 shadow-sm"
  >
    {demoMode && (
      <span
        data-testid={SETTINGS.demoModeBadge}
        className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700"
      >
        <Sparkles className="h-3 w-3" />
        EXHIBITION DEMO MODE (15s Inspection Cadence)
      </span>
    )}
    <div className="flex flex-col items-center gap-3 text-center">
      <div className="relative flex h-14 w-14 items-center justify-center">
        <span className="absolute inset-0 animate-pulse rounded-full bg-primary/15" />
        <span
          className="absolute inset-1.5 animate-pulse rounded-full bg-primary/10"
          style={{ animationDelay: "0.3s" }}
        />
        <Loader2 className="relative h-7 w-7 animate-spin text-primary" />
      </div>
      <div>
        <h3 className="font-heading text-xl font-bold leading-tight text-foreground sm:text-2xl">
          Analyzing Chest Radiograph with Gemini CAD...
        </h3>
        <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
          Evaluating apical parenchyma, lung volumes, and classic TB radiological signs according to MaHTAS / WHO clinical standards.
        </p>
      </div>
    </div>

    <AnalyzingProgress demoMode={demoMode} />

    <ClinicalFactsCarousel active />

    <div className="rounded-md border border-slate-100 bg-slate-50 p-2 text-center text-[11px] text-muted-foreground">
      AI CAD decision support tool · Does not supersede clinical physician assessment.
    </div>
  </div>
);

const NewScreening = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [imageData, setImageData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [screening, setScreening] = useState(null);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [demoModeActive, setDemoModeActive] = useState(false);
  const [linkedCoughSession, setLinkedCoughSession] = useState(null);
  const [selectedScenario, setSelectedScenario] = useState(null);
  const printRef = useRef(null);

  const isVerifiedRadiograph = Boolean(
    screening &&
      screening.status !== "REJECTED" &&
      screening.status !== "INCONCLUSIVE" &&
      screening.status !== "NON_CHEST_XRAY" &&
      screening.image_tier !== "TIER_2_NON_CHEST_XRAY" &&
      screening.result?.is_valid_radiograph !== false &&
      screening.result?.status !== "REJECTED" &&
      screening.result?.status !== "INCONCLUSIVE" &&
      screening.result?.status !== "NON_CHEST_XRAY" &&
      screening.result?.image_tier !== "TIER_2_NON_CHEST_XRAY" &&
      !screening.result?.is_non_chest_xray &&
      !screening.result?.is_inconclusive
  );

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("aerotriage_cough_session");
      if (raw) {
        const parsed = JSON.parse(raw);
        setLinkedCoughSession(parsed);
        if (parsed.patient) {
          setForm({
            patient_category: parsed.patient.patient_category || "Patient",
            age: String(parsed.patient.age || "42"),
            gender: parsed.patient.gender || "Lelaki",
          });
        }
      }
    } catch {
      // ignore storage errors
    }
  }, []);

  const handleChange = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const handleReset = () => {
    setForm(initialForm);
    setImageData(null);
    setSelectedScenario(null);
    setScreening(null);
    setError("");
  };

  const handleSelectScenario = (scenario) => {
    setForm({
      patient_category: scenario.patient_category,
      age: scenario.age,
      gender: scenario.gender,
    });
    setImageData(scenario.image_base64);
    setSelectedScenario(scenario);
    setScreening(null);
    setError("");
  };

  const handleAnalyze = async (options = {}) => {
    const forceOverride = Boolean(options?.forceOverride);
    setError("");
    if (!imageData) {
      setError("Please upload or select a chest X-ray image first.");
      return;
    }
    if (!form.age || Number(form.age) <= 0) {
      setError("Please enter a valid patient age.");
      return;
    }

    const demoMode = getDemoMode();
    setDemoModeActive(demoMode);
    setLoading(true);
    setScreening(null);

    try {
      const isBuiltinValidPreset =
        ["normal", "moderate", "severe", "occupational"].includes(
          selectedScenario?.type
        ) ||
        [
          "scenario-normal",
          "scenario-moderate",
          "scenario-severe",
          "scenario-occupational",
        ].includes(selectedScenario?.id);

      // Safety Directive #0 / #4 vision gate applies ONLY to user-uploaded images and Scenario E (never to built-in presets A–D or when Clinician Override is active)
      const gateResult = isBuiltinValidPreset
        ? {
            is_chest_radiograph: true,
            is_inconclusive_quality: false,
            detected_preset: selectedScenario.type,
            tier: "TIER_1_CHEST_XRAY",
            reason: "Built-in clinical scenario preset A–D",
          }
        : await inspectImageRadiograph(imageData, { forceOverride });

      const effectiveScenarioType = forceOverride
        ? isBuiltinValidPreset
          ? selectedScenario?.type
          : null
        : selectedScenario?.type || gateResult.detected_preset || null;

      const willRejectImmediately =
        !forceOverride &&
        !isBuiltinValidPreset &&
        (!gateResult.is_chest_radiograph || effectiveScenarioType === "invalid");

      const analyzeOutcome = api
        .post("/analyze", {
          image_base64: imageData,
          patient_category: form.patient_category,
          age: Number(form.age),
          gender: form.gender,
          scenario_id: forceOverride && !isBuiltinValidPreset ? null : selectedScenario?.id || null,
          scenario_type: effectiveScenarioType,
          is_builtin_preset: isBuiltinValidPreset,
          force_override: forceOverride,
          client_gate: gateResult,
        })
        .then((res) => ({ ok: true, data: res.data }))
        .catch((err) => ({ ok: false, error: err }));

      const [outcome] = await Promise.all([
        analyzeOutcome,
        demoMode && !willRejectImmediately && !forceOverride
          ? new Promise((resolve) => setTimeout(resolve, DEMO_MODE_DURATION_MS))
          : Promise.resolve(),
      ]);

      if (!outcome.ok && !willRejectImmediately) throw outcome.error;

      const isNonChestXrayResponse =
        !forceOverride &&
        !isBuiltinValidPreset &&
        !willRejectImmediately &&
        (outcome.data?.status === "NON_CHEST_XRAY" ||
          outcome.data?.image_tier === "TIER_2_NON_CHEST_XRAY" ||
          outcome.data?.is_non_chest_xray ||
          outcome.data?.result?.status === "NON_CHEST_XRAY" ||
          outcome.data?.result?.image_tier === "TIER_2_NON_CHEST_XRAY" ||
          outcome.data?.result?.is_non_chest_xray);

      const isInconclusiveResponse =
        !forceOverride &&
        !isBuiltinValidPreset &&
        !willRejectImmediately &&
        !isNonChestXrayResponse &&
        (outcome.data?.status === "INCONCLUSIVE" ||
          outcome.data?.result?.status === "INCONCLUSIVE" ||
          outcome.data?.result?.is_inconclusive);

      const isRejectedResponse =
        !forceOverride &&
        !isBuiltinValidPreset &&
        !isNonChestXrayResponse &&
        !isInconclusiveResponse &&
        (willRejectImmediately ||
          outcome.data?.status === "REJECTED" ||
          outcome.data?.image_tier === "TIER_3_NOT_XRAY" ||
          outcome.data?.result?.is_valid_radiograph === false ||
          outcome.data?.result?.status === "REJECTED");

      if (isNonChestXrayResponse) {
        // TIER 2 — X-RAY BUT NOT CHEST: Accept into limited mode (findings only, no TB score, nothing written to History)
        setError("");
        setScreening(outcome.data);
      } else if (isInconclusiveResponse) {
        const inconclusiveMsg =
          outcome.data?.message || INCONCLUSIVE_CXR_MESSAGE;
        setError(inconclusiveMsg);
        setScreening({
          id: null,
          status: "INCONCLUSIVE",
          error_code: outcome.data?.error_code || "INCONCLUSIVE_IMAGE_QUALITY",
          message: inconclusiveMsg,
          patient_category: form.patient_category,
          age: Number(form.age),
          gender: form.gender,
          image_base64: imageData,
          result: {
            status: "INCONCLUSIVE",
            is_inconclusive: true,
            is_valid_radiograph: true,
            error_code: outcome.data?.error_code || "INCONCLUSIVE_IMAGE_QUALITY",
            message: inconclusiveMsg,
          },
          created_at: new Date().toISOString(),
        });
      } else if (isRejectedResponse) {
        // TIER 3 — NOT AN X-RAY: Reject immediately with red banner
        setError(REJECTED_CXR_MESSAGE);
        setScreening({
          id: null,
          status: "REJECTED",
          image_tier: "TIER_3_NOT_XRAY",
          error_code: outcome.data?.error_code || "INVALID_IMAGE_TYPE",
          message: REJECTED_CXR_MESSAGE,
          patient_category: form.patient_category,
          age: Number(form.age),
          gender: form.gender,
          image_base64: imageData,
          result: {
            status: "REJECTED",
            image_tier: "TIER_3_NOT_XRAY",
            error_code: outcome.data?.error_code || "INVALID_IMAGE_TYPE",
            message: REJECTED_CXR_MESSAGE,
            is_valid_radiograph: false,
            invalid_reason: {
              en: REJECTED_CXR_MESSAGE,
              bm: "RALAT PENGESAHAN IMEJ: Imej yang dimuat naik bukan radiograf dada (Chest X-Ray). Sistem ini hanya memproses imej X-ray dada perubatan (pandangan PA/AP) yang sah untuk saringan TB.",
            },
          },
          created_at: new Date().toISOString(),
        });
      } else {
        // TIER 1 — CHEST X-RAY (or Clinician Override): Full CAD pipeline + save to History
        setError("");
        setScreening(outcome.data);
        syncScreeningToFirestore(outcome.data);
        saveScreeningOffline({
          id: outcome.data.id,
          type: linkedCoughSession ? "DUAL" : "CXR",
          patient_category: outcome.data.patient_category,
          age: outcome.data.age,
          gender: outcome.data.gender,
          result: outcome.data.result,
          created_at: outcome.data.created_at,
          facility: "Pejabat Kesihatan Daerah Kuala Nerus · KKM",
        }).catch(() => {});
      }
    } catch (e) {
      setError(
        e?.response?.data?.detail || "AI analysis failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClinicianOverride = () => {
    handleAnalyze({ forceOverride: true });
  };

  const handleDownloadPdf = async () => {
    if (!printRef.current) return;
    setDownloadingPdf(true);
    try {
      await downloadElementAsPdf(
        printRef.current,
        `tb-screening-${screening.id.slice(0, 8)}.pdf`
      );
    } finally {
      setDownloadingPdf(false);
    }
  };

  const handleExportFhir = () => {
    if (!screening) return;
    const fhirBundle = generateFhirReport(
      {
        id: screening.id,
        age: screening.age,
        gender: screening.gender,
        patient_category: screening.patient_category,
      },
      screening.result?.tb_score || 50,
      {
        screening_id: screening.id,
        timestamp: screening.created_at,
        cxr_score: screening.result?.tb_score || 0,
        cxr_severity: screening.result?.severity || "NO_LESION",
        pathology_scores: screening.result?.pathology_scores,
        cough_peak_hz: linkedCoughSession?.dsp?.peak_frequency_hz || 310,
        cough_wetness_index: linkedCoughSession?.dsp?.cough_wetness_index || 75,
        radiological_impression:
          screening.result?.en?.impression || screening.result?.bm?.impresi,
        cpg_recommendations:
          screening.result?.en?.recommendation || screening.result?.bm?.cadangan,
      }
    );

    const blob = new Blob([JSON.stringify(fhirBundle, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `fhir-report-${screening.id.slice(0, 8)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div data-testid={NEW_SCREENING.page} className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      {/* Header section with Partner Logos */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-2.5 py-1 shadow-xs">
              <img src={LOGOS.kkm} alt="KKM" className="h-5 w-auto object-contain" title="Kementerian Kesihatan Malaysia" />
              <img src={LOGOS.pkdkn} alt="PKDKN" className="h-5 w-auto object-contain" title="Pejabat Kesihatan Daerah Kuala Nerus" />
              <div className="h-3.5 w-px bg-slate-200" />
              <img src={LOGOS.spectra} alt="Spectra" className="h-4 w-auto object-contain rounded-xs" title="SPECTRA AI-TB" />
              <span className="text-[11px] font-medium text-slate-700">KKM · PKDKN · SPECTRA AI-TB</span>
            </div>
          </div>
          <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Tuberculosis Chest X-ray CAD Screening
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Computer-Aided Detection triage compliant with KKM and WHO Tuberculosis Guidelines.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/guide"
            className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 hover:text-emerald-800 transition-colors"
            title="Buka Panduan Penggunaan Lengkap"
          >
            <BookOpen className="h-3.5 w-3.5 text-emerald-700" />
            <span>How to Use / Panduan</span>
          </Link>
          <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            <span>Safety Directive #0 Image Gate Active</span>
          </div>
        </div>
      </div>

      {/* Dual Screening Modality Switcher Bar */}
      <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-xs mb-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 uppercase font-mono">Modul Saringan:</span>
            <div className="flex items-center gap-2">
              <Button size="sm" className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs gap-1.5 font-semibold shadow-xs">
                <Activity className="h-3.5 w-3.5 text-white" />
                Saringan 1: Radiologi Dada (CXR CAD)
              </Button>
              <Link to="/cough">
                <Button variant="outline" size="sm" className="text-xs text-slate-700 hover:text-emerald-800 gap-1.5">
                  <Mic className="h-3.5 w-3.5 text-slate-500" />
                  Saringan 2: Akustik Batuk (AeroTriage TB)
                </Button>
              </Link>
            </div>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">
            DUA SARINGAN BERSEPADU DALAM SATU APLIKASI
          </span>
        </div>

        {linkedCoughSession?.dsp && (
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-emerald-200 bg-emerald-50/70 px-3 py-2 text-xs text-emerald-950">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-700 shrink-0" />
              <span>
                <strong>MODUL 2 Late-Fusion Aktif:</strong> Biopenanda Batuk Saringan 2 Dipautkan (Peak:{" "}
                <span className="font-mono font-bold">{linkedCoughSession.dsp.peak_frequency_hz} Hz</span> · Wetness:{" "}
                <span className="font-mono font-bold">{linkedCoughSession.dsp.cough_wetness_index}%</span> · Bursts:{" "}
                <span className="font-mono font-bold">{linkedCoughSession.dsp.cough_burst_count || 2}</span>)
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                sessionStorage.removeItem("aerotriage_cough_session");
                setLinkedCoughSession(null);
              }}
              className="text-[11px] font-semibold text-emerald-800 hover:underline"
            >
              Padam Pautan
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Left Column: Form & Scenarios */}
        <div className="space-y-6 rounded-lg border border-border bg-white p-6 shadow-sm">
          {/* Quick Workflow Guide Bar */}
          <div className="flex items-center justify-between rounded-md border border-emerald-100 bg-emerald-50/70 px-3 py-2 text-xs text-emerald-950">
            <div className="flex items-center gap-2 min-w-0">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-700 text-[10px] font-bold text-white">
                i
              </span>
              <span className="truncate font-medium">
                1. Pilih Senario / Isi Borang → 2. Muat Naik CXR → 3. Analisis CAD
              </span>
            </div>
            <Link
              to="/guide"
              className="shrink-0 font-semibold text-emerald-800 hover:text-emerald-950 hover:underline text-[11px] ml-2"
            >
              Panduan Penuh →
            </Link>
          </div>

          {/* Quick Scenario Picker */}
          <DemoScenarioPicker
            onSelectScenario={handleSelectScenario}
            disabled={loading}
          />

          <PatientForm form={form} onChange={handleChange} disabled={loading} />

          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Chest Radiograph / Imej X-ray Dada
            </p>
            <XrayUpload
              imageData={imageData}
              onImageSelected={(img) => {
                setImageData(img);
                setSelectedScenario(null);
                setScreening(null);
                setError("");
              }}
              onImageRemoved={() => {
                setImageData(null);
                setSelectedScenario(null);
                setScreening(null);
                setError("");
              }}
              disabled={loading}
              isVerified={isVerifiedRadiograph}
            />
          </div>

          {error && (
            <div
              data-testid={NEW_SCREENING.errorAlert}
              role="alert"
              className="rounded-md border border-red-300 bg-red-50 px-3.5 py-2.5 text-sm font-semibold text-red-800 shadow-2xs"
            >
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <Button
              type="button"
              className="flex-1 bg-emerald-700 hover:bg-emerald-800 text-white"
              data-testid={NEW_SCREENING.analyzeButton}
              onClick={() => handleAnalyze()}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="mr-2 h-4 w-4" />
              )}
              Analyze Radiograph
            </Button>
            <Button
              type="button"
              variant="outline"
              data-testid={NEW_SCREENING.resetButton}
              onClick={handleReset}
              disabled={loading}
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Reset
            </Button>
          </div>
        </div>

        {/* Right Column: Viewer & Results */}
        <div className="space-y-6">
          {loading && <AnalyzingScreen demoMode={demoModeActive} />}

          {!loading && screening && (
            <>
              <XrayViewer
                imageSrc={imageData}
                annotations={isVerifiedRadiograph ? screening.result?.annotations || [] : []}
                isVerified={isVerifiedRadiograph}
              />
              <ResultPanel
                result={screening.result}
                patientCategory={form.patient_category}
                coughDsp={linkedCoughSession?.dsp}
                onOverride={handleClinicianOverride}
                overriding={loading}
              />
              {isVerifiedRadiograph && screening.id && (
                <>
                  <div className="flex flex-wrap items-center gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      data-testid={DETAIL.downloadPdfButton}
                      onClick={handleDownloadPdf}
                      disabled={downloadingPdf}
                    >
                      {downloadingPdf ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <FileDown className="mr-2 h-4 w-4" />
                      )}
                      Download Official PDF Report
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleExportFhir}
                      className="text-xs border-slate-300 hover:border-emerald-600 hover:text-emerald-900"
                      title="Eksport Laporan Standard Interoperabiliti HL7 FHIR R4 JSON"
                    >
                      <FileCode className="mr-2 h-4 w-4 text-emerald-700" />
                      MODUL 3 · Export HL7 FHIR R4 (JSON)
                    </Button>
                    <Button
                      variant="link"
                      className="px-0 text-emerald-700"
                      data-testid={RESULT_PANEL.viewInHistoryLink}
                      onClick={() => navigate(`/screening/${screening.id}`)}
                    >
                      View full record in history &rarr;
                    </Button>
                  </div>
                  <div
                    style={{
                      position: "fixed",
                      left: 0,
                      top: 0,
                      width: "794px",
                      height: 0,
                      overflow: "hidden",
                      opacity: 0,
                      pointerEvents: "none",
                      zIndex: -9999,
                    }}
                    aria-hidden="true"
                  >
                    <PrintableReport
                      ref={printRef}
                      screening={{ ...screening, image_base64: imageData }}
                    />
                  </div>
                </>
              )}
            </>
          )}

          {!loading && !screening && (
            <div className="flex h-full min-h-[380px] flex-col items-center justify-center rounded-lg border border-dashed border-border bg-slate-50/50 p-8 text-center text-sm text-muted-foreground">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400 mb-3">
                <Sparkles className="h-6 w-6" />
              </div>
              <p className="font-heading font-semibold text-foreground">
                No Active Analysis
              </p>
              <p className="mt-1 max-w-sm text-xs text-muted-foreground">
                Choose a One-Click Clinical Scenario on the left, or upload a custom chest radiograph to start CAD screening.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NewScreening;
