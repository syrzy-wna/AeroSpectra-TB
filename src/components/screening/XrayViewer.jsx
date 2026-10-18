import { useState, useRef } from "react";
import { ZoomIn, ZoomOut, RotateCcw, Eye, EyeOff, Sliders, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

const XrayViewer = ({ imageSrc, annotations = [] }) => {
  const [zoom, setZoom] = useState(1);
  const [showAnnotations, setShowAnnotations] = useState(true);
  const [filterMode, setFilterMode] = useState("standard"); // 'standard' | 'invert' | 'lung' | 'bone'
  const [hoveredAnnotation, setHoveredAnnotation] = useState(null);
  const containerRef = useRef(null);

  const handleZoomIn = () => setZoom((z) => Math.min(z + 0.25, 3));
  const handleZoomOut = () => setZoom((z) => Math.max(z - 0.25, 0.75));
  const handleReset = () => {
    setZoom(1);
    setFilterMode("standard");
  };

  const getFilterStyle = () => {
    switch (filterMode) {
      case "invert":
        return "invert contrast-125";
      case "lung":
        return "contrast-150 brightness-95";
      case "bone":
        return "contrast-200 brightness-110 grayscale";
      default:
        return "contrast-100";
    }
  };

  return (
    <div className="flex flex-col overflow-hidden rounded-lg border border-border bg-slate-950 text-white shadow-md">
      {/* Top Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 bg-slate-900/90 px-3 py-2 text-xs">
        <div className="flex items-center gap-1.5 font-mono text-slate-400">
          <Sliders className="h-3.5 w-3.5 text-emerald-400" />
          <span>VIEWPORT // DICOM CXR</span>
          <span className="text-slate-600">·</span>
          <span className="text-slate-300">{(zoom * 100).toFixed(0)}%</span>
        </div>

        {/* View Controls */}
        <div className="flex items-center gap-1">
          {/* Window Preset Selector */}
          <div className="flex items-center rounded bg-slate-800 p-0.5">
            <button
              type="button"
              onClick={() => setFilterMode("standard")}
              className={`rounded px-2 py-0.5 text-[11px] font-medium transition-colors ${
                filterMode === "standard" ? "bg-slate-700 text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              Default
            </button>
            <button
              type="button"
              onClick={() => setFilterMode("lung")}
              className={`rounded px-2 py-0.5 text-[11px] font-medium transition-colors ${
                filterMode === "lung" ? "bg-slate-700 text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              Lung
            </button>
            <button
              type="button"
              onClick={() => setFilterMode("invert")}
              className={`rounded px-2 py-0.5 text-[11px] font-medium transition-colors ${
                filterMode === "invert" ? "bg-slate-700 text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              Negative
            </button>
          </div>

          {/* Toggle Annotations */}
          {annotations.length > 0 && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowAnnotations(!showAnnotations)}
              className={`h-7 px-2 text-[11px] text-slate-300 hover:bg-slate-800 hover:text-white ${
                showAnnotations ? "text-emerald-400" : ""
              }`}
              title="Toggle AI CAD Bounding Boxes"
            >
              {showAnnotations ? <Eye className="h-3.5 w-3.5 mr-1" /> : <EyeOff className="h-3.5 w-3.5 mr-1" />}
              AI Marks ({annotations.length})
            </Button>
          )}

          {/* Zoom Controls */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleZoomOut}
            className="h-7 w-7 p-0 text-slate-400 hover:bg-slate-800 hover:text-white"
            title="Zoom Out"
          >
            <ZoomOut className="h-3.5 w-3.5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleZoomIn}
            className="h-7 w-7 p-0 text-slate-400 hover:bg-slate-800 hover:text-white"
            title="Zoom In"
          >
            <ZoomIn className="h-3.5 w-3.5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="h-7 w-7 p-0 text-slate-400 hover:bg-slate-800 hover:text-white"
            title="Reset Zoom & Filters"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Main Image Stage */}
      <div
        ref={containerRef}
        className="relative flex min-h-[380px] max-h-[520px] w-full items-center justify-center overflow-auto bg-black p-4 select-none"
      >
        <div
          className="relative inline-block transition-transform duration-150"
          style={{ transform: `scale(${zoom})`, transformOrigin: "center center" }}
        >
          <img
            src={imageSrc}
            alt="Chest Radiograph"
            className={`max-h-[460px] w-auto rounded object-contain transition-all duration-200 ${getFilterStyle()}`}
            draggable={false}
          />

          {/* AI CAD Bounding Box Annotations Overlay */}
          {showAnnotations &&
            annotations.map((ann, idx) => {
              // Bounding box format: [ymin, xmin, ymax, xmax] on a 0 - 1000 scale
              const [ymin, xmin, ymax, xmax] = ann.box_2d || [0, 0, 0, 0];
              const top = `${ymin / 10}%`;
              const left = `${xmin / 10}%`;
              const width = `${(xmax - xmin) / 10}%`;
              const height = `${(ymax - ymin) / 10}%`;
              const isHovered = hoveredAnnotation === idx;

              return (
                <div
                  key={idx}
                  onMouseEnter={() => setHoveredAnnotation(idx)}
                  onMouseLeave={() => setHoveredAnnotation(null)}
                  className={`absolute rounded border-2 transition-all cursor-pointer ${
                    isHovered
                      ? "border-rose-400 bg-rose-500/25 shadow-lg shadow-rose-500/30 z-20"
                      : "border-amber-400 bg-amber-500/15 z-10 hover:border-rose-400"
                  }`}
                  style={{ top, left, width, height }}
                >
                  {/* Floating Marker Chip */}
                  <span
                    className={`absolute -top-6 left-0 rounded px-1.5 py-0.5 font-mono text-[10px] font-bold tracking-tight whitespace-nowrap shadow ${
                      isHovered ? "bg-rose-600 text-white" : "bg-amber-500 text-slate-950"
                    }`}
                  >
                    CAD #{idx + 1}: {ann.label || "Lesion"}
                  </span>
                </div>
              );
            })}
        </div>

        {/* Viewport HUD Metadata Watermark */}
        <div className="pointer-events-none absolute bottom-3 left-3 font-mono text-[11px] text-slate-400/80">
          <span>PA VIEW · DIGITAL RADIOGRAPHY</span>
        </div>
      </div>

      {/* Legend & Active Finding Bar */}
      {annotations.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-800 bg-slate-900 px-3 py-2 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-amber-400" />
            <span className="font-medium text-slate-300">
              {annotations.length} CAD Suspicion Region{annotations.length > 1 ? "s" : ""} Flagged
            </span>
          </div>
          {hoveredAnnotation !== null && annotations[hoveredAnnotation] && (
            <span className="font-mono text-amber-300">
              Region #{hoveredAnnotation + 1}: {annotations[hoveredAnnotation].label}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default XrayViewer;
