import { useRef, useState } from "react";
import { UploadCloud, FileImage, X, AlertCircle, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NEW_SCREENING } from "@/constants/testIds";

const XrayUpload = ({ imageData, onImageSelected, onImageRemoved, disabled, isVerified = false }) => {
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);
  const [fileError, setFileError] = useState("");

  const processFile = (file) => {
    setFileError("");
    if (!file) return;

    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      setFileError("Invalid format. Please upload JPEG, PNG, or WEBP only.");
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      setFileError("File too large. Maximum image size is 25MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      onImageSelected(e.target.result);
    };
    reader.onerror = () => {
      setFileError("Failed to read image file.");
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (disabled) return;
    const file = e.dataTransfer.files?.[0];
    processFile(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    if (!disabled) setDragOver(true);
  };

  const handleDragLeave = () => setDragOver(false);

  return (
    <div className="space-y-2">
      {/* Standard File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        data-testid={NEW_SCREENING.fileInput}
        className="hidden"
        disabled={disabled}
        onChange={(e) => {
          const file = e.target.files?.[0];
          processFile(file);
        }}
      />

      {/* Direct Camera Input for Tablets / Field Negatoscopes */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        capture="environment"
        className="hidden"
        disabled={disabled}
        onChange={(e) => {
          const file = e.target.files?.[0];
          processFile(file);
        }}
      />

      {imageData ? (
        <div className="relative overflow-hidden rounded-lg border border-border bg-slate-950 p-2">
          <div className="relative flex max-h-[260px] items-center justify-center overflow-hidden rounded bg-black">
            <img
              src={imageData}
              alt={isVerified ? "Verified Chest Radiograph Preview" : "Unverified Input Preview"}
              className="max-h-[250px] w-auto object-contain"
            />
            <span
              className={`pointer-events-none absolute top-2 left-2 rounded px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider shadow ${
                isVerified
                  ? "bg-emerald-900/90 text-emerald-200 border border-emerald-600/60"
                  : "bg-amber-950/90 text-amber-300 border border-amber-500/60"
              }`}
            >
              {isVerified ? "VIEWPORT // DICOM CXR" : "UNVERIFIED INPUT"}
            </span>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              data-testid={NEW_SCREENING.removeImageButton}
              onClick={onImageRemoved}
              disabled={disabled}
              className="absolute top-2 right-2 h-7 w-7 p-0 shadow-md"
              title="Remove image"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="mt-2 flex items-center justify-between px-2 text-xs text-slate-400">
            <span className="flex items-center gap-1.5 font-mono">
              <FileImage className={`h-3.5 w-3.5 ${isVerified ? "text-emerald-400" : "text-amber-400"}`} />
              {isVerified ? "PA VIEW · DIGITAL RADIOGRAPHY" : "UNVERIFIED INPUT"}
            </span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                disabled={disabled}
                className="text-slate-300 hover:text-white hover:underline flex items-center gap-1"
              >
                <Camera className="h-3 w-3" />
                Retake
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={disabled}
                className="text-emerald-400 hover:underline"
              >
                Change File
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <div
            data-testid={NEW_SCREENING.uploadArea}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => !disabled && fileInputRef.current?.click()}
            className={`flex min-h-[160px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 text-center transition-colors ${
              dragOver
                ? "border-emerald-600 bg-emerald-50/50"
                : "border-border bg-slate-50/50 hover:border-emerald-600/70 hover:bg-slate-50"
            } ${disabled ? "pointer-events-none opacity-50" : ""}`}
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
              <UploadCloud className="h-5 w-5" />
            </div>
            <p className="mt-3 text-sm font-medium text-foreground">
              Drop Chest X-ray here or <span className="text-emerald-700 underline font-semibold">browse files</span>
            </p>
            <p className="mt-1 text-[11px] text-muted-foreground">
              Accepted: Digital DICOM exports in PNG, JPEG, or WEBP (Max 25MB)
            </p>
          </div>

          <div className="flex items-center justify-between text-xs px-1 text-muted-foreground">
            <span className="text-[11px]">Rural field clinic or physical film?</span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => cameraInputRef.current?.click()}
              disabled={disabled}
              className="h-7 text-xs border-slate-300 text-slate-700 hover:bg-slate-100"
            >
              <Camera className="mr-1.5 h-3.5 w-3.5 text-emerald-700" />
              Capture via Camera / Negatoscope
            </Button>
          </div>
        </div>
      )}

      {fileError && (
        <div className="flex items-center gap-1.5 text-xs text-rose-600">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          <span>{fileError}</span>
        </div>
      )}
    </div>
  );
};

export default XrayUpload;
