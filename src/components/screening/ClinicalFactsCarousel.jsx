import { useState, useEffect } from "react";
import { CLINICAL_FACTS } from "@/constants/clinicalFacts";
import { Lightbulb, ChevronLeft, ChevronRight } from "lucide-react";

const ClinicalFactsCarousel = ({ active = false }) => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((i) => (i + 1) % CLINICAL_FACTS.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const current = CLINICAL_FACTS[index];

  const handlePrev = (e) => {
    e.stopPropagation();
    setIndex((i) => (i - 1 + CLINICAL_FACTS.length) % CLINICAL_FACTS.length);
  };

  const handleNext = (e) => {
    e.stopPropagation();
    setIndex((i) => (i + 1) % CLINICAL_FACTS.length);
  };

  return (
    <div className="relative overflow-hidden rounded-lg border border-emerald-100 bg-emerald-50/60 p-4 text-emerald-950">
      <div className="flex items-center justify-between gap-2 border-b border-emerald-200/60 pb-2">
        <div className="flex items-center gap-2">
          <Lightbulb className="h-4 w-4 text-emerald-700" />
          <span className="font-heading text-xs font-bold uppercase tracking-wider text-emerald-800">
            Clinical Radiology Intelligence // {current.titleEn}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handlePrev}
            className="rounded p-1 hover:bg-emerald-200/50"
            title="Previous Fact"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>
          <span className="font-mono text-[11px] text-emerald-700">
            {index + 1}/{CLINICAL_FACTS.length}
          </span>
          <button
            type="button"
            onClick={handleNext}
            className="rounded p-1 hover:bg-emerald-200/50"
            title="Next Fact"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div className="pt-2.5">
        <p className="text-xs leading-relaxed text-emerald-950">
          {current.factEn}
        </p>
        <p className="mt-1 text-[11px] italic leading-relaxed text-emerald-800">
          {current.factBm}
        </p>
        <p className="mt-2 font-mono text-[10px] text-emerald-700">
          Source: {current.source}
        </p>
      </div>
    </div>
  );
};

export default ClinicalFactsCarousel;
