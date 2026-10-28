import { useState } from "react";
import { Lock, ShieldCheck, Database, Trash2, CheckCircle2, KeyRound, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LOGOS } from "@/constants/logos";
import {
  verifyAndUnlockApp,
  hasConfiguredPasscode,
  clearLocalScreeningHistory,
  acknowledgePrivacyNotice,
} from "@/lib/accessControl";

const PasscodeLockScreen = ({ onUnlocked }) => {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [clearing, setClearing] = useState(false);
  const [clearedMsg, setClearedMsg] = useState("");
  const isAlreadyConfigured = hasConfiguredPasscode();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    const res = verifyAndUnlockApp(pin);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    acknowledgePrivacyNotice();
    if (onUnlocked) onUnlocked();
  };

  const handleClearLocal = async () => {
    setClearing(true);
    setClearedMsg("");
    try {
      await clearLocalScreeningHistory();
      setClearedMsg("Local history cleared successfully.");
    } finally {
      setClearing(false);
    }
  };

  return (
    <div
      data-testid="passcode-lock-screen"
      className="min-h-screen flex flex-col items-center justify-center bg-slate-50 px-4 py-10"
    >
      <div className="w-full max-w-md space-y-5 rounded-xl border border-slate-200 bg-white p-6 shadow-md sm:p-8">
        {/* Partner Header */}
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1">
            <img src={LOGOS.kkm} alt="KKM" className="h-5 w-auto object-contain" />
            <img src={LOGOS.pkdkn} alt="PKDKN" className="h-5 w-auto object-contain" />
            <div className="h-3.5 w-px bg-slate-300" />
            <img src={LOGOS.spectra} alt="SPECTRA" className="h-4 w-auto object-contain rounded-xs" />
            <span className="text-[11px] font-semibold text-slate-700">SPECTRA AI-TB · ACCESS GATE</span>
          </div>

          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-800 shadow-2xs">
            <Lock className="h-6 w-6" />
          </div>

          <div>
            <h1 className="font-heading text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
              {isAlreadyConfigured
                ? "Authorized Clinician / Owner Lock"
                : "Set Owner Passcode / PIN"}
            </h1>
            <p className="mt-1 text-xs text-slate-600 leading-relaxed">
              {isAlreadyConfigured
                ? "Enter the owner passcode/PIN to unlock CXR screening, file uploads, and clinical history."
                : "Protected clinical workstation. Set a 4+ character owner passcode/PIN (or enter default PIN 1234) to unlock screening, uploads, and History."}
            </p>
          </div>
        </div>

        {/* First-Launch Cloud Firestore Privacy Notice */}
        <div
          data-testid="privacy-notice-banner"
          className="rounded-lg border border-blue-200 bg-blue-50/70 p-3.5 text-xs text-slate-800 space-y-2.5"
        >
          <div className="flex items-start gap-2">
            <Database className="h-4 w-4 text-blue-700 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-heading font-bold text-blue-950 block">
                Data Privacy & Cloud Storage Notice
              </span>
              <p className="text-[11px] text-slate-700 leading-relaxed">
                Screening data — including patient demographics, chest X-ray images, and AI triage results — is stored in <strong>cloud Firestore</strong> for clinical audit continuity and cached locally on this device for offline resilience.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-blue-200/70">
            <span className="text-[10px] font-mono text-slate-500">
              PDPA & KKM Clinical Governance
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              data-testid="clear-local-history-button"
              onClick={handleClearLocal}
              disabled={clearing}
              className="h-7 px-2.5 text-[11px] border-slate-300 bg-white text-slate-700 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-300"
            >
              <Trash2 className="mr-1.5 h-3 w-3" />
              {clearing ? "Clearing..." : "Clear local history"}
            </Button>
          </div>

          {clearedMsg && (
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 rounded px-2.5 py-1">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
              <span>{clearedMsg}</span>
            </div>
          )}
        </div>

        {/* Passcode Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="owner-passcode-input" className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                Owner Passcode / PIN
              </Label>
              <button
                type="button"
                onClick={() => {
                  setPin("1234");
                  setError("");
                }}
                className="text-[11px] font-mono text-emerald-700 hover:underline flex items-center gap-1"
              >
                <KeyRound className="h-3 w-3" />
                Use Demo PIN (1234)
              </button>
            </div>
            <Input
              id="owner-passcode-input"
              data-testid="passcode-input"
              type="password"
              autoComplete="current-password"
              placeholder="Enter 4+ digit PIN or passcode (e.g. 1234)"
              value={pin}
              onChange={(e) => {
                setPin(e.target.value);
                setError("");
              }}
              className="font-mono text-center tracking-widest text-base"
              autoFocus
            />
          </div>

          {error && (
            <div
              data-testid="passcode-error"
              role="alert"
              className="flex items-center gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700"
            >
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <Button
            type="submit"
            data-testid="passcode-unlock-button"
            className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-semibold"
          >
            <ShieldCheck className="mr-2 h-4 w-4" />
            {isAlreadyConfigured ? "Unlock Application" : "Set Passcode & Unlock"}
          </Button>
        </form>

        <div className="border-t border-slate-100 pt-3 text-center text-[11px] text-slate-500">
          No screening, radiograph upload, or History access is permitted while locked.
        </div>
      </div>
    </div>
  );
};

export default PasscodeLockScreen;
