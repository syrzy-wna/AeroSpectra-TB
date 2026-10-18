import { useState, useEffect } from "react";
import { Mic, CheckCircle2, AlertCircle, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export const AmbientNoiseChecker = ({ onVerified, isVerified, currentNoiseDb = 38 }) => {
  const [measuring, setMeasuring] = useState(false);
  const [noiseLevel, setNoiseLevel] = useState(currentNoiseDb);

  const isOptimal = noiseLevel <= 45;

  const handleVerify = () => {
    setMeasuring(true);
    let ticks = 0;
    const interval = setInterval(() => {
      // Simulate/measure ambient noise jitter around 36-44 dB
      const sample = Math.round(35 + Math.random() * 8);
      setNoiseLevel(sample);
      ticks++;
      if (ticks > 8) {
        clearInterval(interval);
        setMeasuring(false);
        if (onVerified) onVerified(sample);
      }
    }, 150);
  };

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-xs">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Volume2 className="h-4 w-4 text-emerald-700" />
          <h3 className="font-heading text-xs font-bold uppercase tracking-wider text-slate-800">
            Acoustic Noise Floor Gate
          </h3>
        </div>
        <span
          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
            isOptimal
              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
              : "bg-amber-50 text-amber-700 border border-amber-200"
          }`}
        >
          {isOptimal ? <CheckCircle2 className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
          {isOptimal ? "ROOM QUIET (<45 dBA)" : "ELEVATED NOISE (>45 dBA)"}
        </span>
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500">Current Noise Floor</span>
            <span className="font-mono font-bold text-slate-800">{noiseLevel} dBA SPL</span>
          </div>
          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 rounded-full ${
                isOptimal ? "bg-emerald-500" : "bg-amber-500"
              }`}
              style={{ width: `${Math.min(100, (noiseLevel / 70) * 100)}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-400">
            Optimum range is &lt; 45 dBA to prevent low-frequency bronchial artifacts.
          </p>
        </div>

        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={handleVerify}
          disabled={measuring}
          className="text-xs shrink-0"
        >
          {measuring ? "Measuring..." : isVerified ? "Re-Check Noise" : "Verify Noise Floor"}
        </Button>
      </div>
    </div>
  );
};

export default AmbientNoiseChecker;
