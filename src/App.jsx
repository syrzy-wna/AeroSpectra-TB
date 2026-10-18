import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import Navbar from "@/components/screening/Navbar";
import NewScreening from "@/pages/NewScreening";
import History from "@/pages/History";
import ScreeningDetail from "@/pages/ScreeningDetail";
import Settings from "@/pages/Settings";
import HowToUse from "@/pages/HowToUse";
import CoughScreening from "@/pages/CoughScreening";
import { Activity } from "lucide-react";

function App() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-foreground antialiased selection:bg-emerald-100 selection:text-emerald-900">
      <BrowserRouter>
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<NewScreening />} />
            <Route path="/cough" element={<CoughScreening />} />
            <Route path="/aerotriage" element={<CoughScreening />} />
            <Route path="/history" element={<History />} />
            <Route path="/screening/:id" element={<ScreeningDetail />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/guide" element={<HowToUse />} />
            <Route path="/how-to-use" element={<HowToUse />} />
          </Routes>
        </main>

        <footer className="border-t border-border bg-white py-6 text-xs text-muted-foreground">
          <div className="mx-auto flex max-w-7xl flex-col sm:flex-row items-center justify-between gap-4 px-4 sm:px-6">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-emerald-700" />
              <span className="font-semibold text-foreground">SPECTRA AI-TB</span>
              <span>·</span>
              <span>Pejabat Kesihatan Daerah Kuala Nerus · Terengganu</span>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-center sm:text-right">
              <span>WHO Consolidated Guidelines on Tuberculosis</span>
              <span className="hidden sm:inline">·</span>
              <span>CPG Management of Tuberculosis (MOH Malaysia)</span>
            </div>
          </div>
        </footer>
      </BrowserRouter>
      <Toaster position="top-right" />
    </div>
  );
}

export default App;
