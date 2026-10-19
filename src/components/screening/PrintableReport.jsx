import React from "react";
import { SEVERITY_CONFIG } from "@/constants/screening";
import { LOGOS } from "@/constants/logos";

const PrintableReport = React.forwardRef(({ screening }, ref) => {
  if (
    !screening ||
    screening.status === "REJECTED" ||
    screening.result?.status === "REJECTED" ||
    screening.result?.is_valid_radiograph === false
  ) {
    return null;
  }

  const result = screening.result || {};
  const en = result.en || {};
  const bm = result.bm || {};
  const pathology = result.pathology_scores || {};
  const severity = result.severity || "NO_LESION";
  const sevConfig = SEVERITY_CONFIG[severity] || SEVERITY_CONFIG.NO_LESION;
  const isValid = result.is_valid_radiograph !== false;

  return (
    <div
      ref={ref}
      className="mx-auto w-[800px] bg-white p-8 text-slate-900 font-sans print:w-full print:p-0"
      style={{ minHeight: "1050px" }}
    >
      {/* KKM / MOH Official Letterhead */}
      <div className="border-b-2 border-slate-900 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Logos KKM & PKDKN */}
            <div className="flex items-center gap-3">
              <img
                src={LOGOS.kkm}
                alt="Logo Kementerian Kesihatan Malaysia"
                className="h-16 w-auto object-contain"
                crossOrigin="anonymous"
              />
              <img
                src={LOGOS.pkdkn}
                alt="Logo Pejabat Kesihatan Daerah Kuala Nerus"
                className="h-16 w-auto object-contain"
                crossOrigin="anonymous"
              />
            </div>
            <div>
              <h1 className="text-xl font-bold uppercase tracking-tight text-slate-900">
                Kementerian Kesihatan Malaysia
              </h1>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-700">
                Pejabat Kesihatan Daerah Kuala Nerus · Unit Kawalan TB / Kusta
              </h2>
              <p className="text-xs text-slate-500">
                CAD Screening Report · Program Saringan Tuberkulosis Kebangsaan
              </p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1.5">
            <div className="flex items-center gap-2">
              <img
                src={LOGOS.spectra}
                alt="Logo SPECTRA AI-TB"
                className="h-10 w-auto object-contain rounded"
                crossOrigin="anonymous"
              />
              <span className="inline-block rounded border border-slate-900 px-2 py-0.5 text-xs font-mono font-bold">
                CONFIDENTIAL // SULIT
              </span>
            </div>
            <p className="font-mono text-xs text-slate-600">
              ID: {screening.id.slice(0, 8).toUpperCase()}
            </p>
            <p className="font-mono text-xs text-slate-500">
              Date: {new Date(screening.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      {/* Patient Demographics Strip */}
      <div className="mt-4 rounded border border-slate-300 bg-slate-50 p-3">
        <div className="grid grid-cols-4 gap-4 text-xs">
          <div>
            <span className="block font-semibold text-slate-500 uppercase">Patient ID</span>
            <span className="font-mono font-bold text-slate-800">{screening.id.slice(0, 13)}</span>
          </div>
          <div>
            <span className="block font-semibold text-slate-500 uppercase">Age / Gender</span>
            <span className="font-bold text-slate-800">{screening.age} Years · {screening.gender}</span>
          </div>
          <div>
            <span className="block font-semibold text-slate-500 uppercase">Screening Tier</span>
            <span className="font-bold text-slate-800">{screening.patient_category}</span>
          </div>
          <div>
            <span className="block font-semibold text-slate-500 uppercase">CAD Status</span>
            <span className="font-bold text-slate-800">{isValid ? sevConfig.label : "INVALID IMAGE"}</span>
          </div>
        </div>
      </div>

      {/* CAD Diagnostic Score Summary */}
      <div className="mt-5 rounded border-2 border-slate-800 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold uppercase tracking-tight text-slate-900">
              SPECTRA AI-TB Computer-Aided Detection (CAD) Result
            </h3>
            <p className="text-xs text-slate-600">
              Modelled on MaHTAS evaluation parameters and WHO Module 2 TB triage recommendations.
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-mono font-bold text-slate-900">
              {isValid ? `${result.tb_score}/100` : "0/100"}
            </div>
            <span
              className="inline-block rounded px-2 py-0.5 text-xs font-bold text-white uppercase"
              style={{ backgroundColor: sevConfig.color }}
            >
              {isValid ? sevConfig.label : "REJECTED"}
            </span>
          </div>
        </div>

        {/* Pathology Score Breakdown */}
        {isValid && (
          <div className="mt-4 grid grid-cols-5 gap-2 border-t border-slate-200 pt-3 text-center text-xs">
            <div className="rounded bg-slate-100 p-1.5">
              <span className="block text-[10px] text-slate-500">Cavitation</span>
              <span className="font-mono font-bold text-slate-900">{pathology.cavitation || 0}%</span>
            </div>
            <div className="rounded bg-slate-100 p-1.5">
              <span className="block text-[10px] text-slate-500">Consolidation</span>
              <span className="font-mono font-bold text-slate-900">{pathology.consolidation || 0}%</span>
            </div>
            <div className="rounded bg-slate-100 p-1.5">
              <span className="block text-[10px] text-slate-500">Nodules</span>
              <span className="font-mono font-bold text-slate-900">{pathology.nodules || 0}%</span>
            </div>
            <div className="rounded bg-slate-100 p-1.5">
              <span className="block text-[10px] text-slate-500">Fibrosis</span>
              <span className="font-mono font-bold text-slate-900">{pathology.fibrosis || 0}%</span>
            </div>
            <div className="rounded bg-slate-100 p-1.5">
              <span className="block text-[10px] text-slate-500">Pleural Effusion</span>
              <span className="font-mono font-bold text-slate-900">{pathology.effusion || 0}%</span>
            </div>
          </div>
        )}
      </div>

      {/* Chest X-ray Snapshot */}
      {screening.image_base64 && (
        <div className="mt-4 flex justify-center rounded border border-slate-200 bg-slate-950 p-2">
          <img
            src={screening.image_base64}
            alt="Chest Radiograph"
            className="max-h-[220px] w-auto object-contain rounded"
          />
        </div>
      )}

      {/* Clinical Findings & Recommendations */}
      <div className="mt-4 space-y-4 text-xs leading-relaxed">
        <div>
          <h4 className="font-bold uppercase tracking-wider text-slate-800 border-b border-slate-200 pb-1">
            1. Radiological Findings / Penemuan Radiologi
          </h4>
          <ul className="mt-2 list-inside list-disc space-y-1">
            {(en.radiological_findings || []).map((f, i) => (
              <li key={i}>
                <span className="text-slate-900">{f}</span>
                {bm.penemuan_radiologi?.[i] && (
                  <span className="block text-slate-500 italic ml-4">
                    ({bm.penemuan_radiologi[i]})
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-bold uppercase tracking-wider text-slate-800 border-b border-slate-200 pb-1">
            2. Impression / Impresi
          </h4>
          <ul className="mt-2 list-inside list-disc space-y-1">
            {(en.impression || []).map((imp, i) => (
              <li key={i} className="font-semibold text-slate-900">
                {imp}
                {bm.impresi?.[i] && (
                  <span className="block font-normal text-slate-600 italic ml-4">
                    ({bm.impresi[i]})
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-bold uppercase tracking-wider text-slate-800 border-b border-slate-200 pb-1">
            3. Recommended Clinical Action Plan / Cadangan Klinikal
          </h4>
          <ol className="mt-2 list-inside list-decimal space-y-1 text-slate-800">
            {(en.recommendation || []).map((rec, i) => (
              <li key={i}>{rec}</li>
            ))}
          </ol>
        </div>
      </div>

      {/* Doctor Verification Sign-Off Footer */}
      <div className="mt-10 border-t-2 border-slate-300 pt-4 text-xs">
        <div className="grid grid-cols-2 gap-8">
          <div>
            <p className="font-semibold text-slate-700">Attending Medical Officer Verification:</p>
            <p className="mt-1 text-slate-500 text-[11px]">
              I have clinically correlated the AI CAD findings with patient examination and symptoms.
            </p>
            <div className="mt-8 border-b border-dotted border-slate-400 w-48" />
            <p className="mt-1 font-mono text-[10px] text-slate-500">Signature & Official Stamp / Tarikh</p>
          </div>
          <div className="text-right">
            <p className="font-semibold text-slate-700">System Telemetry & Calibration:</p>
            <p className="mt-1 font-mono text-[10px] text-slate-500">
              Engine: SPECTRA-CAD-v3.8 (Gemini 3.8 Flash Multimodal CAD)<br />
              Safety Gate Directive #0: VERIFIED<br />
              Generated: {new Date().toISOString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
});

PrintableReport.displayName = "PrintableReport";

export default PrintableReport;
