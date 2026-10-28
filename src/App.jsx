import { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "@/components/screening/Navbar";
import NewScreening from "@/pages/NewScreening";
import CoughScreening from "@/pages/CoughScreening";
import History from "@/pages/History";
import ScreeningDetail from "@/pages/ScreeningDetail";
import Settings from "@/pages/Settings";
import HowToUse from "@/pages/HowToUse";
import PasscodeLockScreen from "@/components/auth/PasscodeLockScreen";
import { useAccessControl } from "@/lib/accessControl";
import { Database, Trash2, CheckCircle2, X } from "lucide-react";
import { Button } from "@/components/ui/button";

function App() {
  const { unlocked, clearLocalHistory } = useAccessControl();
  const [showPrivacyBar, setShowPrivacyBar] = useState(true);
  const [clearedBannerMsg, setClearedBannerMsg] = useState("");

  if (!unlocked) {
    return <PasscodeLockScreen />;
  }

  const handleClearLocalFromBanner = async () => {
    await clearLocalHistory();
    setClearedBannerMsg("Local history cleared.");
    setTimeout(() => setClearedBannerMsg(""), 4000);
  };

  return (
    <div className="App min-h-screen flex flex-col bg-background text-foreground">
      <BrowserRouter>
        <Navbar />
        {showPrivacyBar && (
          <div
            data-testid="cloud-privacy-notice"
            className="border-b border-blue-200 bg-blue-50/80 px-4 py-2 text-xs text-slate-800"
          >
            <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Database className="h-3.5 w-3.5 text-blue-700 shrink-0" />
                <span>
                  <strong>Privacy Notice:</strong> Screening data (patient demographics, radiographs, and triage results) is stored in cloud Firestore and cached locally for offline clinic continuity.
                </span>
              </div>
              <div className="flex items-center gap-2">
                {clearedBannerMsg && (
                  <span className="inline-flex items-center gap-1 rounded bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-800">
                    <CheckCircle2 className="h-3 w-3" />
                    {clearedBannerMsg}
                  </span>
                )}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  data-testid="banner-clear-local-history"
                  onClick={handleClearLocalFromBanner}
                  className="h-6 px-2 text-[11px] border-slate-300 bg-white text-slate-700 hover:bg-rose-50 hover:text-rose-700"
                >
                  <Trash2 className="mr-1 h-3 w-3" />
                  Clear local history
                </Button>
                <button
                  type="button"
                  onClick={() => setShowPrivacyBar(false)}
                  className="rounded p-1 text-slate-500 hover:bg-blue-100 hover:text-slate-800"
                  title="Dismiss notice"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<NewScreening />} />
            <Route path="/cough" element={<CoughScreening />} />
            <Route path="/history" element={<History />} />
            <Route path="/screening/:id" element={<ScreeningDetail />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/guide" element={<HowToUse />} />
          </Routes>
        </main>
        <footer className="border-t border-border bg-white py-5 text-xs text-muted-foreground">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-2">
            <div>
              <span className="font-heading font-semibold text-foreground">SPECTRA AI-TB & AeroTriage TB</span>{" "}
              · Dual Modalities: Chest X-Ray CAD & Acoustic Cough Triage
            </div>
            <div className="text-center sm:text-right">
              Medical Officer Decision Support Tool · Grounded on MOH CPG (4th Ed.) & WHO Consolidated Guidelines
            </div>
          </div>
        </footer>
      </BrowserRouter>
    </div>
  );
}

export default App;
