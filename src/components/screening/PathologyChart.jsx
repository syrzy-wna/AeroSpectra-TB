import { useState } from "react";
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from "recharts";
import { PATHOLOGY_LABELS } from "@/constants/screening";
import { RESULT_PANEL } from "@/constants/testIds";
import { BarChart3, Radar as RadarIcon, ListFilter } from "lucide-react";

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="rounded-md border border-slate-200 bg-white p-2 text-xs shadow-md">
        <p className="font-semibold text-foreground">{data.fullLabel}</p>
        <p className="text-[11px] text-muted-foreground italic">{data.bmLabel}</p>
        <p className="mt-1 font-mono font-bold text-emerald-700">
          Probability Score: {data.value}%
        </p>
      </div>
    );
  }
  return null;
};

const PathologyChart = ({ scores = {}, isValid = true }) => {
  const [viewMode, setViewMode] = useState("radar"); // 'radar' | 'bar' | 'list'

  const pathologies = [
    { key: "cavitation", value: scores.cavitation || 0 },
    { key: "consolidation", value: scores.consolidation || 0 },
    { key: "fibrosis", value: scores.fibrosis || 0 },
    { key: "effusion", value: scores.effusion || 0 },
    { key: "nodules", value: scores.nodules || 0 },
  ];

  const chartData = pathologies.map(({ key, value }) => {
    const meta = PATHOLOGY_LABELS[key] || { en: key, bm: key };
    const val = isValid ? Math.max(0, Math.min(100, Math.round(value))) : 0;
    return {
      key,
      label: meta.en,
      bmLabel: meta.bm,
      fullLabel: `${meta.en} (${meta.bm})`,
      value: val,
      fullMark: 100,
    };
  });

  const getBarColor = (val) => {
    if (!isValid) return "#94A3B8";
    if (val >= 60) return "#EF4444"; // Severe / Critical
    if (val >= 30) return "#F59E0B"; // Mild
    return "#10B981"; // Normal
  };

  return (
    <div data-testid={RESULT_PANEL.pathologyChart} className="space-y-4">
      {/* Header with View Mode Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2">
        <div>
          <h4 className="font-heading text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            TB Pathology Vector Profile (5 Cardinal Axes)
          </h4>
          <p className="text-[11px] text-slate-500">
            MaHTAS quantitative score: Consolidation, Cavitation, Fibrosis, Effusion, Nodules
          </p>
        </div>

        {/* View mode toggle */}
        <div className="flex items-center rounded-md border border-slate-200 bg-white p-0.5 text-xs shadow-2xs">
          <button
            type="button"
            onClick={() => setViewMode("radar")}
            className={`flex items-center gap-1 rounded px-2 py-0.5 text-[11px] font-medium transition-colors ${
              viewMode === "radar"
                ? "bg-emerald-50 text-emerald-800 font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
            title="Radar Pathology Map"
          >
            <RadarIcon className="h-3 w-3" />
            Radar
          </button>
          <button
            type="button"
            onClick={() => setViewMode("bar")}
            className={`flex items-center gap-1 rounded px-2 py-0.5 text-[11px] font-medium transition-colors ${
              viewMode === "bar"
                ? "bg-emerald-50 text-emerald-800 font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
            title="Bar Histogram"
          >
            <BarChart3 className="h-3 w-3" />
            Bar
          </button>
          <button
            type="button"
            onClick={() => setViewMode("list")}
            className={`flex items-center gap-1 rounded px-2 py-0.5 text-[11px] font-medium transition-colors ${
              viewMode === "list"
                ? "bg-emerald-50 text-emerald-800 font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
            title="Metric Breakdown"
          >
            <ListFilter className="h-3 w-3" />
            Metrics
          </button>
        </div>
      </div>

      {/* Visual Presentation Area */}
      {viewMode === "radar" && (
        <div className="flex h-56 w-full items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="72%" data={chartData}>
              <PolarGrid stroke="#E2E8F0" />
              <PolarAngleAxis
                dataKey="label"
                tick={{ fill: "#475569", fontSize: 11, fontWeight: 500 }}
              />
              <PolarRadiusAxis
                angle={30}
                domain={[0, 100]}
                tick={{ fill: "#94A3B8", fontSize: 9 }}
              />
              <Radar
                name="Pathology Probability"
                dataKey="value"
                stroke="#0F7650"
                fill="#0F7650"
                fillOpacity={0.35}
              />
              <Tooltip content={<CustomTooltip />} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      )}

      {viewMode === "bar" && (
        <div className="flex h-56 w-full items-center justify-center pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fill: "#475569", fontSize: 10 }}
                interval={0}
                angle={-15}
                textAnchor="end"
              />
              <YAxis domain={[0, 100]} tick={{ fill: "#94A3B8", fontSize: 10 }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getBarColor(entry.value)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Metric Breakdown Table (Always visible or in list mode) */}
      <div className={`space-y-2.5 ${viewMode !== "list" ? "border-t border-slate-100 pt-3" : ""}`}>
        {chartData.map((item) => (
          <div key={item.key} className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <div>
                <span className="font-medium text-foreground">{item.label}</span>
                <span className="ml-1.5 text-[11px] text-muted-foreground italic">({item.bmLabel})</span>
              </div>
              <span className="font-mono font-bold tabular-nums text-foreground">
                {isValid ? `${item.value}%` : "--"}
              </span>
            </div>
            <div className="relative h-2 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full transition-all duration-500 ease-out"
                style={{
                  width: `${item.value}%`,
                  backgroundColor: getBarColor(item.value),
                }}
              />
              {/* 30% and 60% clinical thresholds */}
              <div className="absolute top-0 bottom-0 left-[30%] w-[1px] bg-slate-300 pointer-events-none" />
              <div className="absolute top-0 bottom-0 left-[60%] w-[1px] bg-slate-400 pointer-events-none" />
            </div>
          </div>
        ))}
      </div>

      {/* Threshold Indicators */}
      <div className="flex items-center justify-between text-[10px] text-muted-foreground border-t border-slate-100 pt-2 font-mono">
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          &lt;30% Inactive/Clear
        </span>
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-amber-500" />
          30-59% Borderline
        </span>
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-rose-500" />
          &ge;60% Active Pathology
        </span>
      </div>
    </div>
  );
};

export default PathologyChart;
