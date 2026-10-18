import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useDemoMode, setDemoMode } from "@/lib/demoMode";
import { SETTINGS } from "@/constants/testIds";
import { Sparkles, Cpu, ShieldCheck, BookOpen, Layers, Database } from "lucide-react";
import { LOGOS } from "@/constants/logos";

const Settings = () => {
  const demoMode = useDemoMode();

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
              <p className="font-semibold text-foreground">Gemini 3.8 Flash Multimodal Vision</p>
              <p className="text-muted-foreground text-[11px]">
                High-throughput radiological feature extraction with structured JSON schema output.
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

        {/* Cloud Database & Firebase Firestore Infrastructure */}
        <div className="rounded-lg border border-border bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Database className="h-4 w-4 text-emerald-700" />
            <h2 className="font-heading text-sm font-semibold uppercase tracking-wider text-foreground">
              Google Cloud Firebase Firestore Database
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="rounded-md border border-slate-100 bg-slate-50 p-3 space-y-1">
              <span className="font-mono text-muted-foreground uppercase text-[10px]">Cloud Project ID</span>
              <p className="font-mono font-semibold text-emerald-800">gen-lang-client-0038105363</p>
              <p className="text-muted-foreground text-[11px]">
                Google Cloud Platform dedicated project instance.
              </p>
            </div>

            <div className="rounded-md border border-slate-100 bg-slate-50 p-3 space-y-1">
              <span className="font-mono text-muted-foreground uppercase text-[10px]">Cloud Region & Database</span>
              <p className="font-mono font-semibold text-foreground">us-west1 · Multi-Region Resilient</p>
              <p className="text-muted-foreground text-[11px]">
                Firestore Database: <span className="font-mono text-[10px]">ai-studio-app-9e7bb8ae-469f-4419-a0fc-6e2793b6537a</span>
              </p>
            </div>

            <div className="rounded-md border border-slate-100 bg-slate-50 p-3 space-y-1">
              <span className="font-mono text-muted-foreground uppercase text-[10px]">Security Rules Engine</span>
              <p className="font-semibold text-foreground">Hardened ABAC & Zero-Trust Rules Deployed</p>
              <p className="text-muted-foreground text-[11px]">
                Mathematical prevention against schema drift, payload poisoning, and unauthorized alterations.
              </p>
            </div>

            <div className="rounded-md border border-slate-100 bg-slate-50 p-3 space-y-1">
              <span className="font-mono text-muted-foreground uppercase text-[10px]">Persistence Scope</span>
              <p className="font-semibold text-foreground">Clinical Screenings & Triage History</p>
              <p className="text-muted-foreground text-[11px]">
                Full cloud persistence across devices for MOH hospital clinics and mobile outreach units.
              </p>
            </div>
          </div>
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
      </div>
    </div>
  );
};

export default Settings;
