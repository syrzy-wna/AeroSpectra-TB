import { AlertTriangle, CheckSquare, Square, ShieldAlert } from "lucide-react";

export const WhoSymptomIntake = ({ symptoms, onChange, disabled }) => {
  const toggle = (key) => {
    if (disabled) return;
    onChange({
      ...symptoms,
      [key]: !symptoms[key],
    });
  };

  const whoSymptomCount = [
    symptoms.cough_more_than_2_weeks,
    symptoms.fever,
    symptoms.night_sweats,
    symptoms.unexplained_weight_loss,
  ].filter(Boolean).length;

  return (
    <div className="space-y-4 rounded-lg border border-slate-200 bg-white p-5 shadow-xs">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div>
          <h3 className="font-heading text-sm font-bold text-slate-900">
            Saringan 4-Gejala WHO (WHO 4-Symptom TB Screen)
          </h3>
          <p className="text-xs text-slate-500">
            Penunjuk klinikal kardinal mengikut garis panduan saringan komuniti WHO & CPG KKM.
          </p>
        </div>
        <span
          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-mono font-bold ${
            whoSymptomCount >= 2
              ? "bg-rose-50 text-rose-700 border border-rose-200"
              : whoSymptomCount === 1
              ? "bg-amber-50 text-amber-700 border border-amber-200"
              : "bg-slate-100 text-slate-600"
          }`}
        >
          {whoSymptomCount} / 4 GEJALA
        </span>
      </div>

      {/* 4 Cardinal Symptoms Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button
          type="button"
          disabled={disabled}
          onClick={() => toggle("cough_more_than_2_weeks")}
          className={`flex items-start gap-3 rounded-lg border p-3 text-left transition-all ${
            symptoms.cough_more_than_2_weeks
              ? "border-emerald-500 bg-emerald-50/60 text-emerald-950 shadow-xs"
              : "border-slate-200 bg-slate-50/50 hover:bg-slate-50 text-slate-700"
          }`}
        >
          {symptoms.cough_more_than_2_weeks ? (
            <CheckSquare className="h-4 w-4 text-emerald-700 shrink-0 mt-0.5" />
          ) : (
            <Square className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
          )}
          <div className="text-xs">
            <span className="block font-semibold">Batuk &gt; 2 Minggu</span>
            <span className="text-[11px] text-slate-500">Persistent cough &gt; 14 days</span>
          </div>
        </button>

        <button
          type="button"
          disabled={disabled}
          onClick={() => toggle("fever")}
          className={`flex items-start gap-3 rounded-lg border p-3 text-left transition-all ${
            symptoms.fever
              ? "border-emerald-500 bg-emerald-50/60 text-emerald-950 shadow-xs"
              : "border-slate-200 bg-slate-50/50 hover:bg-slate-50 text-slate-700"
          }`}
        >
          {symptoms.fever ? (
            <CheckSquare className="h-4 w-4 text-emerald-700 shrink-0 mt-0.5" />
          ) : (
            <Square className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
          )}
          <div className="text-xs">
            <span className="block font-semibold">Demam Berpanjangan</span>
            <span className="text-[11px] text-slate-500">Unexplained or low-grade fever</span>
          </div>
        </button>

        <button
          type="button"
          disabled={disabled}
          onClick={() => toggle("night_sweats")}
          className={`flex items-start gap-3 rounded-lg border p-3 text-left transition-all ${
            symptoms.night_sweats
              ? "border-emerald-500 bg-emerald-50/60 text-emerald-950 shadow-xs"
              : "border-slate-200 bg-slate-50/50 hover:bg-slate-50 text-slate-700"
          }`}
        >
          {symptoms.night_sweats ? (
            <CheckSquare className="h-4 w-4 text-emerald-700 shrink-0 mt-0.5" />
          ) : (
            <Square className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
          )}
          <div className="text-xs">
            <span className="block font-semibold">Berpeluh Malam Basah</span>
            <span className="text-[11px] text-slate-500">Drenching night sweats</span>
          </div>
        </button>

        <button
          type="button"
          disabled={disabled}
          onClick={() => toggle("unexplained_weight_loss")}
          className={`flex items-start gap-3 rounded-lg border p-3 text-left transition-all ${
            symptoms.unexplained_weight_loss
              ? "border-emerald-500 bg-emerald-50/60 text-emerald-950 shadow-xs"
              : "border-slate-200 bg-slate-50/50 hover:bg-slate-50 text-slate-700"
          }`}
        >
          {symptoms.unexplained_weight_loss ? (
            <CheckSquare className="h-4 w-4 text-emerald-700 shrink-0 mt-0.5" />
          ) : (
            <Square className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
          )}
          <div className="text-xs">
            <span className="block font-semibold">Susut Berat Badan</span>
            <span className="text-[11px] text-slate-500">Unintentional weight loss &gt; 5%</span>
          </div>
        </button>
      </div>

      {/* Red Flags & Contact History */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
        {/* Hemoptysis Alert */}
        <button
          type="button"
          disabled={disabled}
          onClick={() => toggle("hemoptysis")}
          className={`flex items-start gap-3 rounded-lg border p-3 text-left transition-all ${
            symptoms.hemoptysis
              ? "border-rose-500 bg-rose-50 text-rose-950 shadow-xs"
              : "border-slate-200 bg-slate-50/30 hover:bg-slate-50 text-slate-700"
          }`}
        >
          <ShieldAlert
            className={`h-4 w-4 shrink-0 mt-0.5 ${
              symptoms.hemoptysis ? "text-rose-600 animate-pulse" : "text-slate-400"
            }`}
          />
          <div className="text-xs">
            <span className="block font-semibold text-rose-900">
              🚨 Batuk Berdarah (Hemoptysis)
            </span>
            <span className="text-[11px] text-slate-500">
              Tanda bahaya kardinal: Rujuk kecemasan serta-merta
            </span>
          </div>
        </button>

        {/* Contact History */}
        <button
          type="button"
          disabled={disabled}
          onClick={() => toggle("tb_contact_history")}
          className={`flex items-start gap-3 rounded-lg border p-3 text-left transition-all ${
            symptoms.tb_contact_history
              ? "border-blue-500 bg-blue-50/60 text-blue-950 shadow-xs"
              : "border-slate-200 bg-slate-50/30 hover:bg-slate-50 text-slate-700"
          }`}
        >
          {symptoms.tb_contact_history ? (
            <CheckSquare className="h-4 w-4 text-blue-700 shrink-0 mt-0.5" />
          ) : (
            <Square className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
          )}
          <div className="text-xs">
            <span className="block font-semibold">Sejarah Kontak Rapat TB</span>
            <span className="text-[11px] text-slate-500">
              Pendedahan kepada pesakit TB aktif dalam 12 bulan
            </span>
          </div>
        </button>
      </div>
    </div>
  );
};

export default WhoSymptomIntake;
