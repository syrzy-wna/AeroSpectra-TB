import { useEffect, useState } from "react";

const DEMO_MODE_KEY = "spectra_demo_mode";
const DEMO_MODE_EVENT = "spectra-demo-mode-changed";

export function getDemoMode() {
  try {
    return localStorage.getItem(DEMO_MODE_KEY) === "true";
  } catch {
    return false;
  }
}

export function setDemoMode(enabled) {
  try {
    localStorage.setItem(DEMO_MODE_KEY, enabled ? "true" : "false");
  } catch {
    // Ignore storage errors in private browsing
  }
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(DEMO_MODE_EVENT, { detail: enabled }));
  }
}

/** Reactively tracks the Demo Mode preference across the app without requiring a page refresh. */
export function useDemoMode() {
  const [enabled, setEnabled] = useState(getDemoMode());

  useEffect(() => {
    const handler = (e) => setEnabled(e.detail);
    window.addEventListener(DEMO_MODE_EVENT, handler);
    return () => window.removeEventListener(DEMO_MODE_EVENT, handler);
  }, []);

  return enabled;
}
