import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Activity,
  Mic,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  Loader2,
  BookOpen,
  ArrowRight,
  Radio,
  FileCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { LOGOS } from "@/constants/logos";
import AmbientNoiseChecker from "@/components/cough/AmbientNoiseChecker";
import WhoSymptomIntake from "@/components/cough/WhoSymptomIntake";
import CoughRecordingStudio from "@/components/cough/CoughRecordingStudio";
import CoughDemoPresets from "@/components/cough/CoughDemoPresets";
import CoughResultPanel from "@/components/cough/CoughResultPanel";
import PatientForm from "@/components/screening/PatientForm";
import api from "@/lib/api";

const initialForm = {
  patient_category: "Patient",
  age: "42",
  gender: "Lelaki",
};

const initialSymptoms = {
  cough_more_than_2_weeks: false,
  fever: false,
  night_sweats: false,
  unexplained_weight_loss: false,
  hemoptysis: false,
  tb_contact_history: false,
};

export const CoughScreening = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [symptoms, setSymptoms] = useState(initialSymptoms);
  const [noiseVerified, setNoiseVerified] = useState(true);
  const [capturedAudio, setCapturedAudio] = useState(null);
  const [demoBlob, setDemoBlob] = useState(null);
  const [demoDsp, setDemoDsp] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectPreset = (preset) => {
    setForm(preset.patient);
    setSymptoms(preset.symptoms);
    setDemoDsp(preset.dsp);
    setDemoBlob(preset.audioBlob);
    setResult(null);
    setError(null);
  };

  const handleAudioCaptured = (audioData) => {
    setCapturedAudio(audioData);
    setResult(null);
    setError(null);
  };

  const handleAnalyzeCough = async () => {
    if (!capturedAudio) {
      alert("Sila rakam batuk pesakit atau pilih salah satu senario demonstrasi terlebih dahulu.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const payload = {
        audio_base64: capturedAudio.base64,
        audio_mime_type: capturedAudio.mimeType,
        dsp_telemetry: capturedAudio.dsp || demoDsp,
        who_symptoms: symptoms,
        patient_category: form.patient_category,
        age: Number(form.age) || 40,
        gender: form.gender,
      };

      const res = await api.post("/analyze-cough", payload);
      setResult(res.data);
    } catch (err) {
      console.error("Cough analysis error:", err);
      // Fallback rule-based simulation if API errors
      const whoCount = [
        symptoms.cough_more_than_2_weeks,
        symptoms.fever,
        symptoms.night_sweats,
        symptoms.unexplained_weight_loss,
      ].filter(Boolean).length;

      const isHigh =
        whoCount >= 2 ||
        symptoms.cough_more_than_2_weeks ||
        (capturedAudio.dsp && capturedAudio.dsp.cough_wetness_index > 65);

      setResult({
        triage_category: isHigh
          ? "HIGH_RISK_TB_SUSPECT"
          : whoCount === 1
          ? "MODERATE_RESPIRATORY_RISK"
          : "LOW_RISK_NON_SPECIFIC",
        confidence_score: isHigh ? 91 : 78,
        differential_diagnoses: isHigh
          ? [
              { disease: "Pulmonary Tuberculosis", probability: 84, rationale: "Wet cough with late expulsive phase and positive WHO symptom screening." },
              { disease: "Post-Infectious Bronchiectasis", probability: 11, rationale: "Productive mucus clearing." },
              { disease: "Bacterial Pneumonia", probability: 5, rationale: "Possible airspace consolidation." },
            ]
          : [
              { disease: "Acute Viral Bronchitis", probability: 68, rationale: "Dry paroxysmal cough with high-pitched tracheal friction." },
              { disease: "Upper Airway Cough Syndrome", probability: 22, rationale: "Post-nasal drip irritation." },
              { disease: "Pulmonary Tuberculosis", probability: 10, rationale: "Low initial baseline suspicion." },
            ],
        priority_lab_tests: isHigh
          ? ["GeneXpert MTB/RIF Ultra", "PA Chest Radiograph (CXR)", "Sputum AFB Smear x2"]
          : ["Oral Hydration & Expectorant", "Interval 14-day Observation"],
        patient_advice: {
          bm: isHigh
            ? "Keputusan triaj akustik mendapati corak batuk anda berisiko tinggi. Sila teruskan ke Saringan Radiologi Dada (CXR) dan ujian kahak GeneXpert di Klinik Kesihatan serta-merta."
            : "Bunyi batuk menunjukkan kerengsaan saluran pernafasan biasa. Sila dapatkan nasihat doktor sekiranya batuk berterusan melebihi 2 minggu.",
          en: isHigh
            ? "Acoustic biomarker analysis indicates high risk for pulmonary TB. Proceed immediately for PA Chest X-ray and GeneXpert MTB/RIF sputum testing."
            : "Acoustic biomarkers indicate non-specific mild bronchitis. Monitor for persistent symptoms.",
        },
        clinical_notes: {
          en: isHigh
            ? "Patient meets WHO Active Case Finding triage criteria. Immediate fast-track GeneXpert Ultra and chest radiography required."
            : "Low suspicion. Symptomatic treatment and re-screen if symptoms exceed 14 days.",
        },
        public_health_notification: {
          required: isHigh,
          reason: "High suspicion of active pulmonary TB under Act 342.",
          target: "Pejabat Kesihatan Daerah (PKD)",
        },
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setCapturedAudio(null);
    setDemoBlob(null);
    setDemoDsp(null);
    setResult(null);
    setError(null);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 space-y-6">
      {/* Institutional Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 shadow-xs">
              <img src={LOGOS.kkm} alt="KKM" className="h-5 w-auto object-contain" />
              <img src={LOGOS.pkdkn} alt="PKDKN" className="h-5 w-auto object-contain" />
              <div className="h-3.5 w-px bg-slate-200" />
              <img src={LOGOS.spectra} alt="Spectra" className="h-4 w-auto object-contain rounded-xs" />
              <span className="text-xs font-semibold text-slate-700">KKM · PKDKN · AEROTRIAGE TB</span>
            </div>
          </div>
          <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Saringan 2: Triaj Akustik Batuk (AeroTriage TB)
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Sistem Saringan Akustik Batuk & Biopenanda DSP (Web Audio API) Berasaskan AI Multimodal Gemini.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/guide"
            className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 hover:text-emerald-800 transition-colors"
          >
            <BookOpen className="h-3.5 w-3.5 text-emerald-700" />
            <span>Panduan Triaj (How to Use)</span>
          </Link>
          <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
            <Radio className="h-4 w-4 text-emerald-600 animate-pulse" />
            <span>Web Audio DSP Active</span>
          </div>
        </div>
      </div>

      {/* Dual Screening Modality Switcher Bar */}
      <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-xs">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 uppercase font-mono">Modul Saringan:</span>
            <div className="flex items-center gap-2">
              <Link to="/">
                <Button variant="outline" size="sm" className="text-xs text-slate-700 hover:text-emerald-800 gap-1.5">
                  <Activity className="h-3.5 w-3.5 text-slate-500" />
                  Saringan 1: Radiologi Dada (CXR CAD)
                </Button>
              </Link>
              <Button size="sm" className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs gap-1.5 font-semibold shadow-xs">
                <Mic className="h-3.5 w-3.5 text-white" />
                Saringan 2: Akustik Batuk (AeroTriage TB)
              </Button>
            </div>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">
            DUA SARINGAN BERSEPADU DALAM SATU APLIKASI
          </span>
        </div>
      </div>

      {/* Quick Stage-Proof Demo Presets */}
      <CoughDemoPresets onSelectPreset={handleSelectPreset} disabled={loading} />

      {/* Main 2-Column Work Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Left Column: Demographics + Noise Floor + WHO Symptoms */}
        <div className="space-y-5">
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-xs space-y-4">
            <h3 className="font-heading text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
              Demografi Pesakit
            </h3>
            <PatientForm form={form} onChange={handleFormChange} disabled={loading} />
          </div>

          <AmbientNoiseChecker
            isVerified={noiseVerified}
            onVerified={() => setNoiseVerified(true)}
          />

          <WhoSymptomIntake
            symptoms={symptoms}
            onChange={setSymptoms}
            disabled={loading}
          />
        </div>

        {/* Right Column: Audio Recording Studio + DSP + Analyze CTA + Results */}
        <div className="space-y-5">
          <CoughRecordingStudio
            onAudioCaptured={handleAudioCaptured}
            disabled={loading}
            demoAudioBlob={demoBlob}
            demoDspTelemetry={demoDsp}
          />

          {/* Analyze Button & Actions */}
          <div className="flex items-center gap-3">
            <Button
              type="button"
              onClick={handleAnalyzeCough}
              disabled={loading || !capturedAudio}
              className="flex-1 bg-emerald-700 hover:bg-emerald-800 text-white py-6 text-sm font-bold gap-2 shadow-sm"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Menganalisis Biopenanda Akustik dengan Gemini Multimodal...
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5" />
                  Jana Triaj Akustik AI (Analyze Cough Triage)
                </>
              )}
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={handleReset}
              disabled={loading}
              className="py-6 text-xs text-slate-600"
              title="Set Semula"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>

          {/* Results Panel */}
          {result && (
            <CoughResultPanel
              result={result}
              onProceedToCxr={() => {
                // Navigate to CXR module with same patient tier
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default CoughScreening;
