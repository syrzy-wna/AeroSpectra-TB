import { Sparkles, AlertCircle, CheckCircle2, Flame } from "lucide-react";
import { generateSyntheticCoughAudio } from "@/utils/audioDsp";

export const CoughDemoPresets = ({ onSelectPreset, disabled }) => {
  const PRESETS = [
    {
      id: "high_risk",
      title: "Kes 1: TB Pulmonari Produktif (High Risk)",
      badge: "HIGH RISK TB",
      badgeColor: "bg-rose-100 text-rose-800 border-rose-300",
      icon: Flame,
      iconColor: "text-rose-600",
      description: "Batuk basah berkahak (310Hz, wetness 84%), batuk >3 minggu, berpeluh malam & kontak rapat TB.",
      symptoms: {
        cough_more_than_2_weeks: true,
        fever: true,
        night_sweats: true,
        unexplained_weight_loss: true,
        hemoptysis: false,
        tb_contact_history: true,
      },
      dsp: {
        peak_frequency_hz: 310,
        spectral_centroid_hz: 680,
        zero_crossing_rate: 0.082,
        cough_wetness_index: 84,
        snr_db: 26,
        cough_burst_count: 3,
        duration_ms: 2200,
        rms_energy: 0.142,
      },
      patient: {
        patient_category: "Kontak Rapat",
        age: 46,
        gender: "Lelaki",
      },
    },
    {
      id: "bronchitis",
      title: "Kes 2: Bronkitis Akut Kering (Moderate Risk)",
      badge: "MODERATE RESPIRATORY",
      badgeColor: "bg-amber-100 text-amber-800 border-amber-300",
      icon: AlertCircle,
      iconColor: "text-amber-600",
      description: "Batuk kering tajam paroxysmal (1650Hz, wetness 18%), durasi 4 hari, demam ringan.",
      symptoms: {
        cough_more_than_2_weeks: false,
        fever: true,
        night_sweats: false,
        unexplained_weight_loss: false,
        hemoptysis: false,
        tb_contact_history: false,
      },
      dsp: {
        peak_frequency_hz: 1650,
        spectral_centroid_hz: 1820,
        zero_crossing_rate: 0.195,
        cough_wetness_index: 18,
        snr_db: 22,
        cough_burst_count: 2,
        duration_ms: 1400,
        rms_energy: 0.095,
      },
      patient: {
        patient_category: "Patient",
        age: 31,
        gender: "Perempuan",
      },
    },
    {
      id: "healthy",
      title: "Kes 3: Kahak Normal / Pembersihan Tekak (Low Risk)",
      badge: "LOW RISK BASELINE",
      badgeColor: "bg-emerald-100 text-emerald-800 border-emerald-300",
      icon: CheckCircle2,
      iconColor: "text-emerald-600",
      description: "Satu letusan bersih berfrekuensi 520Hz, tiada rales bronkial, bebas simptom WHO.",
      symptoms: {
        cough_more_than_2_weeks: false,
        fever: false,
        night_sweats: false,
        unexplained_weight_loss: false,
        hemoptysis: false,
        tb_contact_history: false,
      },
      dsp: {
        peak_frequency_hz: 520,
        spectral_centroid_hz: 940,
        zero_crossing_rate: 0.115,
        cough_wetness_index: 12,
        snr_db: 32,
        cough_burst_count: 1,
        duration_ms: 900,
        rms_energy: 0.045,
      },
      patient: {
        patient_category: "Screening",
        age: 24,
        gender: "Lelaki",
      },
    },
  ];

  const handleSelect = (preset) => {
    if (disabled) return;
    // Synthesize real audio blob via Web Audio oscillator synthesis
    const audioBlob = generateSyntheticCoughAudio(preset.id);
    onSelectPreset({
      ...preset,
      audioBlob,
    });
  };

  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-4 shadow-xs">
      <div className="flex items-center gap-2 mb-2">
        <Sparkles className="h-4 w-4 text-amber-600" />
        <h4 className="font-heading text-xs font-bold uppercase tracking-wider text-slate-800">
          Stage-Proof Demo Simulation Presets (1-Click Test)
        </h4>
      </div>
      <p className="text-[11px] text-slate-500 mb-3">
        Pilih profil akustik batuk di bawah untuk mensintesis gelombang audio dan telemetri DSP serta-merta di atas pentas demonstrasi:
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {PRESETS.map((p) => {
          const Icon = p.icon;
          return (
            <button
              key={p.id}
              type="button"
              disabled={disabled}
              onClick={() => handleSelect(p)}
              className="flex flex-col text-left rounded-lg border border-slate-200 bg-white p-3 shadow-2xs hover:border-emerald-400 hover:shadow-xs transition-all active:scale-[0.98]"
            >
              <div className="flex items-center justify-between w-full mb-1.5">
                <span className={`inline-block rounded px-1.5 py-0.5 text-[10px] font-mono font-bold border ${p.badgeColor}`}>
                  {p.badge}
                </span>
                <Icon className={`h-4 w-4 ${p.iconColor}`} />
              </div>
              <span className="font-semibold text-xs text-slate-900 leading-tight mb-1">
                {p.title}
              </span>
              <span className="text-[11px] text-slate-500 leading-snug">
                {p.description}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default CoughDemoPresets;
