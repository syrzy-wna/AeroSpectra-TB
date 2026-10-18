import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RESULT_PANEL } from "@/constants/testIds";
import { FileText, Stethoscope, CheckCircle2, AlertCircle, Info } from "lucide-react";

const ReportTabs = ({ result }) => {
  const [lang, setLang] = useState("both"); // 'en' | 'bm' | 'both'

  const en = result?.en || {};
  const bm = result?.bm || {};
  const findingsEn = en.radiological_findings || [];
  const findingsBm = bm.penemuan_radiologi || [];
  const impressionEn = en.impression || [];
  const impressionBm = bm.impresi || [];
  const recommendationEn = en.recommendation || [];
  const recommendationBm = bm.cadangan || [];
  const incidental = result?.incidental_findings || [];

  return (
    <div className="space-y-4">
      {/* Language filter control */}
      <div className="flex items-center justify-between border-b border-border pb-2">
        <span className="text-xs font-medium text-muted-foreground">
          Report Language / Bahasa Laporan:
        </span>
        <div className="flex items-center gap-1 rounded-md bg-secondary/80 p-0.5 text-xs">
          <button
            type="button"
            onClick={() => setLang("both")}
            className={`rounded px-2 py-0.5 font-medium transition-colors ${
              lang === "both" ? "bg-white text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Bilingual (EN + BM)
          </button>
          <button
            type="button"
            onClick={() => setLang("en")}
            className={`rounded px-2 py-0.5 font-medium transition-colors ${
              lang === "en" ? "bg-white text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            English
          </button>
          <button
            type="button"
            onClick={() => setLang("bm")}
            className={`rounded px-2 py-0.5 font-medium transition-colors ${
              lang === "bm" ? "bg-white text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Bahasa Melayu
          </button>
        </div>
      </div>

      <Tabs defaultValue="findings" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="findings" data-testid={RESULT_PANEL.findingsTab}>
            <FileText className="mr-1.5 h-3.5 w-3.5" />
            Findings
          </TabsTrigger>
          <TabsTrigger value="impression">
            <Stethoscope className="mr-1.5 h-3.5 w-3.5" />
            Impression
          </TabsTrigger>
          <TabsTrigger value="recommendations" data-testid={RESULT_PANEL.recommendationsTab}>
            <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
            Actions
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Findings */}
        <TabsContent value="findings" className="space-y-3 pt-2">
          {findingsEn.length === 0 && findingsBm.length === 0 ? (
            <p className="text-sm italic text-muted-foreground">
              No active parenchymal abnormalities identified.
            </p>
          ) : (
            <ul className="space-y-2.5">
              {findingsEn.map((item, idx) => (
                <li key={idx} className="rounded-md border border-slate-100 bg-slate-50/60 p-3 text-sm">
                  {(lang === "en" || lang === "both") && (
                    <p className="text-foreground leading-relaxed">{item}</p>
                  )}
                  {(lang === "bm" || lang === "both") && findingsBm[idx] && (
                    <p className={`text-muted-foreground leading-relaxed ${lang === "both" ? "mt-1.5 text-xs italic" : ""}`}>
                      {findingsBm[idx]}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </TabsContent>

        {/* Tab 2: Impression */}
        <TabsContent value="impression" className="space-y-3 pt-2">
          <ul className="space-y-2.5">
            {impressionEn.map((item, idx) => (
              <li key={idx} className="rounded-md border border-slate-100 bg-slate-50/60 p-3 text-sm">
                {(lang === "en" || lang === "both") && (
                  <p className="font-medium text-foreground leading-relaxed">{item}</p>
                )}
                {(lang === "bm" || lang === "both") && impressionBm[idx] && (
                  <p className={`text-muted-foreground leading-relaxed ${lang === "both" ? "mt-1.5 text-xs italic" : ""}`}>
                    {impressionBm[idx]}
                  </p>
                )}
              </li>
            ))}
          </ul>

          {result?.is_high_confidence_normal && (
            <div className="flex items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50/70 p-3 text-xs text-emerald-800">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
              <span>
                <strong>High Diagnostic Confidence Normal:</strong> Lung fields and mediastinum are clear. Low likelihood of active pulmonary disease.
              </span>
            </div>
          )}
        </TabsContent>

        {/* Tab 3: Recommendations */}
        <TabsContent value="recommendations" className="space-y-3 pt-2">
          <ul className="space-y-2.5">
            {recommendationEn.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2.5 rounded-md border border-slate-100 bg-slate-50/60 p-3 text-sm">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-[11px] font-bold text-emerald-800">
                  {idx + 1}
                </span>
                <div className="flex-1">
                  {(lang === "en" || lang === "both") && (
                    <p className="text-foreground leading-relaxed">{item}</p>
                  )}
                  {(lang === "bm" || lang === "both") && recommendationBm[idx] && (
                    <p className={`text-muted-foreground leading-relaxed ${lang === "both" ? "mt-1 text-xs italic" : ""}`}>
                      {recommendationBm[idx]}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </TabsContent>
      </Tabs>

      {/* Incidental non-TB findings */}
      {incidental.length > 0 && (
        <div className="rounded-md border border-border bg-white p-3 text-xs">
          <div className="flex items-center gap-1.5 font-semibold text-muted-foreground">
            <Info className="h-3.5 w-3.5" />
            Non-TB Incidental Findings (Penemuan Sampingan):
          </div>
          <ul className="mt-1 list-inside list-disc space-y-0.5 text-muted-foreground">
            {incidental.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ReportTabs;
