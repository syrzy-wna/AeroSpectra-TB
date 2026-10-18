import { AlertTriangle, ShieldAlert } from "lucide-react";
import { RESULT_PANEL } from "@/constants/testIds";

const InvalidImageBanner = ({ invalidReason, message, errorCode }) => {
  const standardBmMessage =
    message ||
    invalidReason?.bm ||
    "RALAT PENGESAHAN IMEJ: Imej yang dimuat naik bukan radiograf dada (Chest X-Ray). Sistem ini hanya memproses imej X-ray dada perubatan yang sah untuk saringan TB. Sila muat naik fail DICOM atau imej X-ray yang betul.";

  const standardEnMessage =
    invalidReason?.en ||
    "IMAGE VALIDATION ERROR: The uploaded image is not a chest radiograph (Chest X-Ray). This system only processes valid medical chest X-ray images for TB screening. Please upload a DICOM file or authentic chest X-ray image.";

  const code = errorCode || "INVALID_IMAGE_TYPE";

  return (
    <div
      data-testid={RESULT_PANEL.invalidBanner}
      className="space-y-3 rounded-lg border border-red-300 bg-red-50/90 p-5 text-red-950 shadow-sm"
    >
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-red-200 text-red-800">
          <ShieldAlert className="h-6 w-6 text-red-700" />
        </div>
        <div className="space-y-1.5 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="font-heading text-sm font-bold uppercase tracking-wider text-red-950">
              STATUS: REJECTED
            </h4>
            <span className="rounded bg-red-200 px-2 py-0.5 text-[11px] font-mono font-bold text-red-900 border border-red-300">
              {code}
            </span>
            <span className="rounded bg-amber-200/90 px-1.5 py-0.5 text-[10px] font-mono font-bold text-amber-900">
              SAFETY-CRITICAL GATE
            </span>
          </div>

          <div className="rounded-md border border-red-200 bg-white/90 p-3 text-sm font-medium text-red-900 leading-relaxed">
            {standardBmMessage}
          </div>

          <p className="text-xs text-red-800/90 leading-relaxed italic">
            {standardEnMessage}
          </p>
        </div>
      </div>

      <div className="rounded-md border border-red-200/70 bg-white/60 p-3 text-xs text-red-900">
        <div className="flex items-center gap-1.5 font-semibold text-red-950">
          <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
          Sekatan Keselamatan & Pencegahan Halusinasi (Zero-Hallucination Invariant):
        </div>
        <p className="mt-0.5 text-muted-foreground text-[11px]">
          DILARANG mereka-reka bacaan radiologi (seperti medan paru-paru, nodul, konsolidasi, atau nisbah kardiotorasik) dan dilarang menjana sebarang skor CAD bagi imej bukan radiograf dada perubatan (contoh: swafoto, gambar majlis/reruai, poster, dokumen teks, atau gambar orang ramai).
        </p>
      </div>
    </div>
  );
};

export default InvalidImageBanner;
