import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useDemoMode, setDemoMode } from "@/lib/demoMode";
import { SETTINGS } from "@/constants/testIds";
import {
  Sparkles,
  Cpu,
  ShieldCheck,
  BookOpen,
  Layers,
  Database,
  Lock,
  Unlock,
  Trash2,
  CheckCircle2,
  AlertCircle,
  KeyRound,
} from "lucide-react";
import { LOGOS } from "@/constants/logos";
import {
  verifyOwnerPasscode,
  updateOwnerPasscode,
  clearLocalScreeningHistory,
  lockSession,
} from "@/lib/accessControl";

const Settings = () => {
  const demoMode = useDemoMode();
  const [devPasscode, setDevPasscode] = useState("");
  const [devUnlocked, setDevUnlocked] = useState(false);
  const [devError, setDevError] = useState("");

  const [newPin, setNewPin] = useState("");
  const [pinMsg, setPinMsg] = useState("");
  const [pinError, setPinError] = useState("");

  const [clearingHistory, setClearingHistory] = useState(false);
  const [clearHistoryMsg, setClearHistoryMsg] = useState("");

  const handleUnlockDeveloper = (e) => {
    e.preventDefault();
    setDevError("");
    if (verifyOwnerPasscode(devPasscode)) {
      setDevUnlocked(true);
      setDevPasscode("");
    } else {
      setDevUnlocked(false);
      setDevError("Invalid owner passcode. Developer section remains locked.");
    }
  };

  const handleUpdatePin = (e) => {
    e.preventDefault();
    setPinError("");
    setPinMsg("");
    const res = updateOwnerPasscode(newPin);
    if (!res.ok) {
      setPinError(res.error);
      return;
    }
    setNewPin("");
    setPinMsg("Owner passcode updated.");
  };

  const handleClearLocal = async () => {
    setClearingHistory(true);
    setClearHistoryMsg("");
    try {
      await clearLocalScreeningHistory();
      setClearHistoryMsg("Local screening history cleared successfully.");
    } finally {
      setClearingHistory(false);
    }
  };

  return (
    <div data-testid={SETTINGS.page} className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          System Settings & Clinical Parameters
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Configure exhibition runtime preferences and inspect AI Computer-Aided Detection (CAD) architecture.
        </p>
      </div>

      <div className="space-y-6">
        {/* Exhibition Demo Mode Preference */}
        <div className="rounded-lg border border-border bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="h-4 w-4 text-amber-600" />
            <h2 className="font-heading text-sm font-semibold uppercase tracking-wider text-foreground">
              Exhibition & Live Demo Cadence
            </h2>
          </div>

          <div className="flex items-start justify-between gap-4 rounded-md border border-border bg-slate-50/50 p-4">
            <div>
              <Label htmlFor="demo-mode-switch" className="text-sm font-semibold text-foreground">
                Exhibition Demo Mode (15-second simulated CAD pacing)
              </Label>
              <p className="mt-1 max-w-xl text-xs text-muted-foreground leading-relaxed">
                When activated, CAD processing runs a deliberate 15-second inspection cycle accompanied by the Clinical Facts Carousel. This ensures judges and exhibition audiences have sufficient time to read the medical findings and observe multi-stage AI reasoning before results display.
              </p>
            </div>
            <Switch
              id="demo-mode-switch"
              data-testid={SETTINGS.demoModeToggle}
              checked={demoMode}
              onCheckedChange={setDemoMode}
            />
          </div>
        </div>

        {/* AI CAD Model Architecture */}
        <div className="rounded-lg border border-border bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Cpu className="h-4 w-4 text-emerald-700" />
            <h2 className="font-heading text-sm font-semibold uppercase tracking-wider text-foreground">
              Clinical CAD Engine Specifications
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 text-xs">
            <div className="rounded-md border border-slate-100 bg-slate-50 p-3 space-y-1">
              <span className="font-mono text-muted-foreground uppercase text-[10px]">Vision AI Foundation</span>
              <p className="font-semibold text-foreground">Gemini Multimodal Vision CAD</p>
              <p className="text-muted-foreground text-[11px]">
                Deterministic, image-grounded radiological feature extraction with structured JSON schema output.
              </p>
            </div>

            <div className="rounded-md border border-slate-100 bg-slate-50 p-3 space-y-1">
              <span className="font-mono text-muted-foreground uppercase text-[10px]">Safety Verification</span>
              <p className="font-semibold text-foreground">Safety Directive #0 Image Gate</p>
              <p className="text-muted-foreground text-[11px]">
                Mandatory pre-scoring discriminator blocks non-radiological photos from clinical scoring.
              </p>
            </div>

            <div className="rounded-md border border-slate-100 bg-slate-50 p-3 space-y-1">
              <span className="font-mono text-muted-foreground uppercase text-[10px]">Guideline Baseline</span>
              <p className="font-semibold text-foreground">WHO Module 2 & MaHTAS CPG</p>
              <p className="text-muted-foreground text-[11px]">
                Calibrated against Malaysian Clinical Practice Guidelines for Management of Tuberculosis (4th Edition).
              </p>
            </div>

            <div className="rounded-md border border-slate-100 bg-slate-50 p-3 space-y-1">
              <span className="font-mono text-muted-foreground uppercase text-[10px]">Pathological Axes</span>
              <p className="font-semibold text-foreground">5 Cardinal TB Signs</p>
              <p className="text-muted-foreground text-[11px]">
                Consolidation, Cavitation, Nodules/Granuloma, Fibrosis, and Pleural Effusion.
              </p>
            </div>
          </div>
        </div>

        {/* Privacy Notice, Access Control & Local History Management */}
        <div className="rounded-lg border border-border bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-700" />
              <h2 className="font-heading text-sm font-semibold uppercase tracking-wider text-foreground">
                Data Privacy, Local History & Access Control
              </h2>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={lockSession}
              className="h-7 text-xs gap-1.5"
            >
              <Lock className="h-3.5 w-3.5" />
              Lock Session Now
            </Button>
          </div>

          <div className="rounded-md border border-blue-200 bg-blue-50/60 p-3.5 text-xs text-slate-800 space-y-2">
            <p className="leading-relaxed">
              <strong>Cloud Storage Privacy Notice:</strong> Screening data (patient demographics, chest radiographs, and AI triage results) is stored in cloud Firestore for clinical continuity and cached locally in browser storage for offline clinic resilience.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <Button
                type="button"
                variant="outline"
                size="sm"
                data-testid="settings-clear-local-history"
                onClick={handleClearLocal}
                disabled={clearingHistory}
                className="h-8 text-xs border-rose-300 bg-white text-rose-700 hover:bg-rose-50"
              >
                <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                {clearingHistory ? "Clearing..." : "Clear local history"}
              </Button>
              {clearHistoryMsg && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  {clearHistoryMsg}
                </span>
              )}
            </div>
          </div>

          <form onSubmit={handleUpdatePin} className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3 pt-1">
            <div className="flex-1 space-y-1">
              <Label htmlFor="update-owner-pin" className="text-xs font-medium text-slate-700">
                Update Owner Passcode / PIN
              </Label>
              <Input
                id="update-owner-pin"
                type="password"
                placeholder="Enter new 4+ character owner passcode"
                value={newPin}
                onChange={(e) => setNewPin(e.target.value)}
                className="h-9 text-xs font-mono"
              />
            </div>
            <Button type="submit" variant="outline" size="sm" className="h-9 text-xs">
              <KeyRound className="mr-1.5 h-3.5 w-3.5" />
              Save New Passcode
            </Button>
          </form>
          {pinError && <p className="text-xs text-red-600">{pinError}</p>}
          {pinMsg && <p className="text-xs text-emerald-700 font-medium">{pinMsg}</p>}
        </div>

        {/* Clinical Guidelines Reference */}
        <div className="rounded-lg border border-border bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <BookOpen className="h-4 w-4 text-blue-600" />
            <h2 className="font-heading text-sm font-semibold uppercase tracking-wider text-foreground">
              Statutory Reporting & Guidelines Reference
            </h2>
          </div>

          <div className="space-y-3 text-xs text-muted-foreground leading-relaxed">
            <p>
              <strong>Akta 342:</strong> Under the Prevention and Control of Infectious Diseases Act 1988, any diagnosed or high-suspicion case of active pulmonary tuberculosis must be notified to the nearest Pejabat Kesihatan Daerah (PKD) within 7 days (or immediately for sputum smear-positive cases).
            </p>
            <p>
              <strong>Directly Observed Therapy, Short-Course (DOTS):</strong> All confirmed active cases must be enrolled into standard 4-drug therapy (Isoniazid, Rifampicin, Pyrazinamide, Ethambutol) under supervised healthcare monitoring.
            </p>
          </div>
        </div>

        {/* Institutional Affiliation & Deployment Partners */}
        <div className="rounded-lg border border-border bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Layers className="h-4 w-4 text-emerald-700" />
            <h2 className="font-heading text-sm font-semibold uppercase tracking-wider text-foreground">
              Institutional Partners & Deployments
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 rounded-lg border border-slate-100 bg-slate-50/70 p-4">
              <img
                src={LOGOS.kkm}
                alt="Logo Kementerian Kesihatan Malaysia"
                className="h-14 w-auto object-contain shrink-0"
              />
              <div className="min-w-0">
                <span className="block text-xs font-bold text-foreground">KKM</span>
                <span className="block text-[11px] text-muted-foreground leading-snug">
                  Kementerian Kesihatan Malaysia · CPG TB & MaHTAS
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-lg border border-slate-100 bg-slate-50/70 p-4">
              <img
                src={LOGOS.pkdkn}
                alt="Logo Pejabat Kesihatan Daerah Kuala Nerus"
                className="h-14 w-auto object-contain shrink-0"
              />
              <div className="min-w-0">
                <span className="block text-xs font-bold text-foreground">PKDKN</span>
                <span className="block text-[11px] text-muted-foreground leading-snug">
                  Pejabat Kesihatan Daerah Kuala Nerus · Unit TB / Kusta
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-lg border border-slate-100 bg-slate-50/70 p-4">
              <img
                src={LOGOS.spectra}
                alt="Logo SPECTRA AI-TB"
                className="h-14 w-auto object-contain rounded-md shrink-0"
              />
              <div className="min-w-0">
                <span className="block text-xs font-bold text-foreground">SPECTRA AI-TB</span>
                <span className="block text-[11px] text-muted-foreground leading-snug">
                  Computer-Aided Detection & Clinical Triage System
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Owner-Only Hidden Developer Section (Cloud Credentials Gate) */}
        <div
          data-testid="developer-section"
          className="rounded-lg border border-slate-200 bg-slate-50/70 p-6 shadow-sm space-y-4"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-slate-700" />
              <h2 className="font-heading text-sm font-semibold uppercase tracking-wider text-foreground">
                Developer (Owner-Only Cloud Infrastructure)
              </h2>
            </div>
            <span
              className={`inline-flex items-center gap-1 rounded px-2 py-0.5 font-mono text-[10px] font-bold uppercase ${
                devUnlocked
                  ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                  : "bg-slate-200 text-slate-700 border border-slate-300"
              }`}
            >
              {devUnlocked ? (
                <>
                  <Unlock className="h-3 w-3" />
                  OWNER UNLOCKED
                </>
              ) : (
                <>
                  <Lock className="h-3 w-3" />
                  HIDDEN · OWNER PASSCODE REQUIRED
                </>
              )}
            </span>
          </div>

          {!devUnlocked ? (
            <form onSubmit={handleUnlockDeveloper} className="space-y-3">
              <p className="text-xs text-muted-foreground">
                Cloud infrastructure identifiers (GCP Project ID, Cloud Region, and Firestore Database ID) are restricted to the system owner. Enter the owner passcode to reveal developer diagnostics.
              </p>
              <div className="flex flex-col sm:flex-row gap-2 max-w-md">
                <Input
                  type="password"
                  data-testid="developer-passcode-input"
                  placeholder="Enter owner passcode / PIN"
                  value={devPasscode}
                  onChange={(e) => {
                    setDevPasscode(e.target.value);
                    setDevError("");
                  }}
                  className="h-9 text-xs font-mono bg-white"
                />
                <Button
                  type="submit"
                  size="sm"
                  data-testid="developer-unlock-button"
                  className="h-9 bg-slate-900 hover:bg-slate-800 text-white text-xs shrink-0"
                >
                  <Unlock className="mr-1.5 h-3.5 w-3.5" />
                  Unlock Developer Section
                </Button>
              </div>
              {devError && (
                <div
                  role="alert"
                  className="flex items-center gap-1.5 text-xs font-medium text-red-700"
                >
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                  <span>{devError}</span>
                </div>
              )}
            </form>
          ) : (
            <div data-testid="developer-cloud-details" className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="rounded-md border border-slate-200 bg-white p-3 space-y-1">
                  <span className="font-mono text-muted-foreground uppercase text-[10px]">Cloud Project ID</span>
                  <p className="font-mono font-semibold text-emerald-800">gen-lang-client-0038105363</p>
                  <p className="text-muted-foreground text-[11px]">
                    Google Cloud Platform dedicated project instance.
                  </p>
                </div>

                <div className="rounded-md border border-slate-200 bg-white p-3 space-y-1">
                  <span className="font-mono text-muted-foreground uppercase text-[10px]">Cloud Region & Database</span>
                  <p className="font-mono font-semibold text-foreground">us-west1 · Multi-Region Resilient</p>
                  <p className="text-muted-foreground text-[11px]">
                    Firestore Database:{" "}
                    <span className="font-mono text-[10px]">
                      ai-studio-app-9e7bb8ae-469f-4419-a0fc-6e2793b6537a
                    </span>
                  </p>
                </div>

                <div className="rounded-md border border-slate-200 bg-white p-3 space-y-1">
                  <span className="font-mono text-muted-foreground uppercase text-[10px]">Security Rules Engine</span>
                  <p className="font-semibold text-foreground">Hardened ABAC & Zero-Trust Rules Deployed</p>
                  <p className="text-muted-foreground text-[11px]">
                    Mathematical prevention against schema drift, payload poisoning, and unauthorized alterations.
                  </p>
                </div>

                <div className="rounded-md border border-slate-200 bg-white p-3 space-y-1">
                  <span className="font-mono text-muted-foreground uppercase text-[10px]">Persistence Scope</span>
                  <p className="font-semibold text-foreground">Clinical Screenings & Triage History</p>
                  <p className="text-muted-foreground text-[11px]">
                    Full cloud persistence across devices for MOH hospital clinics and mobile outreach units.
                  </p>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setDevUnlocked(false)}
                className="h-8 text-xs"
              >
                <Lock className="mr-1.5 h-3.5 w-3.5" />
                Hide Developer Section
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
