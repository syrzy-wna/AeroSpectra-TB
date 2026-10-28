import { Link, useLocation } from "react-router-dom";
import { Activity, History, Settings, Sparkles, BookOpen, Mic, Lock } from "lucide-react";
import { useDemoMode } from "@/lib/demoMode";
import { SETTINGS } from "@/constants/testIds";
import { LOGOS } from "@/constants/logos";
import { lockSession } from "@/lib/accessControl";

const Navbar = () => {
  const location = useLocation();
  const demoMode = useDemoMode();

  const navLinks = [
    { to: "/", label: "Saringan CXR CAD", icon: Activity },
    { to: "/cough", label: "Saringan Batuk (AeroTriage)", icon: Mic },
    { to: "/history", label: "History", icon: History },
    { to: "/guide", label: "How to Use", icon: BookOpen },
    { to: "/settings", label: "Settings", icon: Settings },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 px-4 sm:px-6">
        {/* Zone 1: Official Brand & Institutional Logos */}
        <div className="flex items-center gap-3 shrink-0">
          <Link to="/" className="flex items-center gap-3 transition-opacity hover:opacity-95">
            {/* KKM & PKDKN Institutional Logos */}
            <div className="flex items-center gap-2 border-r border-slate-200 pr-3">
              <img
                src={LOGOS.kkm}
                alt="Logo KKM"
                className="h-10 w-auto object-contain"
                title="Kementerian Kesihatan Malaysia"
              />
              <img
                src={LOGOS.pkdkn}
                alt="Logo PKDKN"
                className="h-10 w-auto object-contain"
                title="Pejabat Kesihatan Daerah Kuala Nerus"
              />
            </div>

            {/* Spectra AI-TB CAD Logo & Typography */}
            <div className="flex items-center gap-2.5">
              <img
                src={LOGOS.spectra}
                alt="Logo Spectra"
                className="h-9 w-auto object-contain rounded-md shadow-xs"
                title="SPECTRA AI-TB"
              />
              <div className="flex flex-col">
                <span className="font-heading text-lg font-bold tracking-tight text-foreground whitespace-nowrap">
                  SPECTRA AI-TB
                </span>
                <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground whitespace-nowrap">
                  KKM · PKDKN · MaHTAS CAD
                </span>
              </div>
            </div>
          </Link>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.to;
            const Icon = link.icon;
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`inline-flex items-center gap-2 whitespace-nowrap transition-colors duration-150 ${
                  isActive
                    ? "font-semibold text-emerald-800"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{link.label}</span>
                {isActive && (
                  <span className="sr-only">(current page)</span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Zone 3: Single Primary Status/Affordance */}
        <div className="flex items-center gap-2.5 shrink-0">
          {demoMode ? (
            <span
              data-testid={SETTINGS.demoModeBadge}
              className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-800"
            >
              <Sparkles className="h-3.5 w-3.5" />
              DEMO MODE
            </span>
          ) : (
            <div className="hidden sm:flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-mono text-slate-600">
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
              <span>CAD READY</span>
            </div>
          )}

          <button
            type="button"
            data-testid="navbar-lock-button"
            onClick={lockSession}
            className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
            title="Lock Session (Require Owner Passcode)"
          >
            <Lock className="h-3.5 w-3.5 text-slate-600" />
            <span className="hidden sm:inline">Lock</span>
          </button>

          {/* Mobile Navigation Trigger Links */}
          <div className="flex md:hidden items-center gap-3">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.to;
              const Icon = link.icon;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`p-1.5 rounded-md ${
                    isActive ? "bg-emerald-50 text-emerald-800" : "text-muted-foreground"
                  }`}
                  title={link.label}
                >
                  <Icon className="h-5 w-5" />
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
