import { AlertTriangle, ShieldAlert } from "lucide-react";
import { RESULT_PANEL } from "@/constants/testIds";

const InvalidImageBanner = ({ invalidReason, message, errorCode }) => {
  const primaryRejectionMessage =
    "Image rejected: not a chest radiograph. Please upload a valid chest X-ray (PA/AP view).";

  const secondaryBmMessage =
    invalidReason?.bm ||
    (message && message !== primaryRejectionMessage ? message : null) ||
    "RALAT PENGESAHAN IMEJ: Imej yang dimuat naik bukan radiograf dada (Chest X-Ray). Sistem ini hanya memproses imej X-ray dada perubatan (pandangan PA/AP) yang sah untuk saringan TB.";

  const code = errorCode || "INVALID_IMAGE_TYPE";

  return (
    <div
      data-testid={RESULT_PANEL.invalidBanner}
      role="alert"
      className="space-y-3 rounded-lg border-2 border-red-400 bg-red-50/95 p-5 text-red-950 shadow-sm"
    >
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-red-600 text-white shadow-xs">
          <ShieldAlert className="h-6 w-6" />
        </div>
        <div className="space-y-2 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="font-heading text-sm font-bold uppercase tracking-wider text-red-950">
              SAFETY DIRECTIVE #0 · STATUS: REJECTED
            </h4>
            <span className="rounded bg-red-200 px-2 py-0.5 text-[11px] font-mono font-bold text-red-900 border border-red-300">
              {code}
            </span>
            <span className="rounded bg-amber-200 px-2 py-0.5 text-[10px] font-mono font-bold text-amber-950 border border-amber-400">
              UNVERIFIED INPUT
            </span>
          </div>

          <div className="rounded-md border border-red-300 bg-white p-3.5 text-sm font-bold text-red-900 leading-relaxed shadow-2xs">
            {primaryRejectionMessage}
          </div>

          <p className="text-xs text-red-800/90 leading-relaxed italic">
            {secondaryBmMessage}
          </p>
        </div>
      </div>

      <div className="rounded-md border border-red-200/80 bg-white/70 p-3 text-xs text-red-900">
        <div className="flex items-center gap-1.5 font-semibold text-red-950">
          <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
          Zero-Hallucination Clinical Safety Gate (Safety Directive #0):
        </div>
        <p className="mt-0.5 text-muted-foreground text-[11px]">
          Non-radiological images (documents, signage, photographs, selfies, posters) are blocked immediately prior to CAD scoring. No TB score, no radiological findings, and no clinical history records are generated.
        </p>
      </div>
    </div>
  );
};

export default InvalidImageBanner;
