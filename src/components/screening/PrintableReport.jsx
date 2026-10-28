import React from "react";

/**
 * Formats a date or ISO string into Malaysian Standard Time (MYT, UTC+8)
 * using DD/MM/YYYY format so header and footer timestamps always match.
 */
function formatMytDateTime(dateInput) {
  const dateObj = dateInput ? new Date(dateInput) : new Date();
  const validDate = isNaN(dateObj.getTime()) ? new Date() : dateObj;

  try {
    const parts = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Asia/Kuala_Lumpur",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    }).formatToParts(validDate);

    const map = {};
    for (const part of parts) {
      map[part.type] = part.value;
    }

    const day = map.day || "01";
    const month = map.month || "01";
    const year = map.year || "2026";
    const hour = map.hour === "24" ? "00" : map.hour || "00";
    const minute = map.minute || "00";
    const second = map.second || "00";

    return {
      shortMy: `${day}/${month}/${year} ${hour}:${minute}`,
      fullMy: `${day}/${month}/${year} ${hour}:${minute}:${second} MYT`,
      year,
    };
  } catch {
    const utcMs = validDate.getTime() + validDate.getTimezoneOffset() * 60000;
    const myt = new Date(utcMs + 8 * 3600000);
    const pad = (n) => String(n).padStart(2, "0");
    const d = pad(myt.getDate());
    const m = pad(myt.getMonth() + 1);
    const y = myt.getFullYear();
    const hh = pad(myt.getHours());
    const mm = pad(myt.getMinutes());
    const ss = pad(myt.getSeconds());
    return {
      shortMy: `${d}/${m}/${y} ${hh}:${mm}`,
      fullMy: `${d}/${m}/${y} ${hh}:${mm}:${ss} MYT`,
      year: String(y),
    };
  }
}

/**
 * Semantic status color & label resolver based on CAD score thresholds:
 * < 50: Low Risk / No Active Lesion (Emerald Green)
 * 50-69: Borderline / Indeterminate (Amber Gold)
 * >= 70: High Risk / Active TB Suspected (Crimson Red)
 */
function getTriageStatusConfig(tbScore, severity) {
  const score = Number(tbScore ?? 0);
  if (score >= 70 || severity === "SEVERE" || severity === "MODERATE") {
    return {
      badgeLabel: score >= 85 ? "HIGH RISK TB — SEVERE LESION" : "HIGH RISK TB SUSPECTED",
      shortStatus: "HIGH RISK TB",
      riskHeadlineEn: "High Probability of Active Pulmonary Tuberculosis on CXR",
      riskHeadlineBm: "Kebarangkalian Tinggi Tuberkulosis Pulmonari Aktif pada CXR",
      bg: "#FEF2F2",
      text: "#991B1B",
      border: "#EF4444",
      accent: "#DC2626",
      ringColor: "#EF4444",
    };
  }
  if (score >= 50 || severity === "MINIMAL") {
    return {
      badgeLabel: "BORDERLINE / INDETERMINATE",
      shortStatus: "BORDERLINE / INDETERMINATE",
      riskHeadlineEn: "Indeterminate Pulmonary Abnormality — Microbiological Correlation Required",
      riskHeadlineBm: "Keabnormalan Pulmonari Tidak Pasti — Korelasi Mikrobiologi Diperlukan",
      bg: "#FFFBEB",
      text: "#92400E",
      border: "#F59E0B",
      accent: "#D97706",
      ringColor: "#F59E0B",
    };
  }
  return {
    badgeLabel: "NO ACTIVE LESION",
    shortStatus: "NO ACTIVE LESION",
    riskHeadlineEn: "Low Probability of Active Pulmonary Tuberculosis on CXR",
    riskHeadlineBm: "Kebarangkalian Rendah Tuberkulosis Pulmonari Aktif pada CXR",
    bg: "#ECFDF5",
    text: "#065F46",
    border: "#10B981",
    accent: "#0D9488",
    ringColor: "#10B981",
  };
}

function formatBilingualGender(gender) {
  const g = String(gender || "").trim();
  const lower = g.toLowerCase();
  if (lower === "lelaki" || lower === "male") return "Lelaki (Male)";
  if (lower === "perempuan" || lower === "female") return "Perempuan (Female)";
  return g || "Lelaki (Male)";
}

function formatBilingualCategory(category) {
  const c = String(category || "Screening").trim();
  const map = {
    Patient: {
      display: "Symptomatic / Saringan",
      isSymptomaticOrExposure: true,
    },
    Contact: {
      display: "Close Contact / Kontak Rapat",
      isSymptomaticOrExposure: true,
    },
    Occupational: {
      display: "High-Risk / Tempat Kerja",
      isSymptomaticOrExposure: true,
    },
    Screening: {
      display: "Asymptomatic / Saringan Komuniti",
      isSymptomaticOrExposure: false,
    },
  };
  return (
    map[c] || {
      display: `${c} / Saringan`,
      isSymptomaticOrExposure: c.toLowerCase() !== "screening",
    }
  );
}

/**
 * Organizes dynamic AI findings from result.en.radiological_findings & result.bm.penemuan_radiologi
 * into the 3 required anatomical domains:
 *  1) Lung Zones (Upper, Mid, Lower)
 *  2) Cardiomediastinal & Hilar Silhouette
 *  3) Costophrenic Angles & Pleura
 */
function buildStructuredFindings(enList, bmList, tbScore, pathology) {
  const rawEn = Array.isArray(enList) ? enList.filter(Boolean) : [];
  const rawBm = Array.isArray(bmList) ? bmList.filter(Boolean) : [];
  const score = Number(tbScore ?? 0);
  const cav = Number(pathology?.cavitation ?? 0);
  const con = Number(pathology?.consolidation ?? 0);
  const nod = Number(pathology?.nodules ?? 0);
  const fib = Number(pathology?.fibrosis ?? 0);
  const eff = Number(pathology?.effusion ?? 0);

  const usedIndices = new Set();

  const findMatchingIndex = (keywords) => {
    for (let i = 0; i < rawEn.length; i++) {
      if (usedIndices.has(i)) continue;
      const combined = `${rawEn[i]} ${rawBm[i] || ""}`.toLowerCase();
      if (keywords.some((kw) => combined.includes(kw))) {
        usedIndices.add(i);
        return i;
      }
    }
    return -1;
  };

  const lungIdx = findMatchingIndex([
    "lung",
    "parenchyma",
    "lobe",
    "apical",
    "cavit",
    "consolidat",
    "infiltrat",
    "nodul",
    "zone",
    "paru",
    "lobus",
  ]);
  const cardioIdx = findMatchingIndex([
    "cardio",
    "mediastin",
    "hilar",
    "hilum",
    "trachea",
    "heart",
    "jantung",
    "trakea",
    "kardiotorasik",
  ]);
  const pleuraIdx = findMatchingIndex([
    "costophrenic",
    "pleura",
    "effusion",
    "recess",
    "hemithorax",
    "kostofrenik",
    "efusi",
  ]);

  // Any remaining dynamic findings that weren't matched yet
  const remainingEn = [];
  const remainingBm = [];
  for (let i = 0; i < rawEn.length; i++) {
    if (!usedIndices.has(i)) {
      remainingEn.push(rawEn[i]);
      if (rawBm[i]) remainingBm.push(rawBm[i]);
    }
  }

  // 1. Lung Zones (Upper, Mid, Lower)
  let lungEn =
    lungIdx !== -1
      ? [rawEn[lungIdx], ...remainingEn].join(" ")
      : remainingEn.length > 0
      ? remainingEn.join(" ")
      : score >= 50 || cav > 15 || con > 15 || nod > 15
      ? `Focal parenchymal opacification noted across the lung zones (Consolidation: ${con}%, Nodules: ${nod}%, Cavitation: ${cav}%, Fibrosis: ${fib}%).`
      : "Bilateral upper, mid, and lower lung zones are well-expanded and clear with no focal parenchymal infiltration, apical cavitation, or pulmonary nodules.";

  let lungBm =
    lungIdx !== -1 && rawBm[lungIdx]
      ? [rawBm[lungIdx], ...remainingBm].join(" ")
      : remainingBm.length > 0
      ? remainingBm.join(" ")
      : score >= 50 || cav > 15 || con > 15 || nod > 15
      ? `Kelegapan parenkima fokal dikesan merentasi zon paru-paru (Konsolidasi: ${con}%, Nodul: ${nod}%, Kavitasi: ${cav}%, Fibrosis: ${fib}%).`
      : "Zon paru-paru atas, tengah, dan bawah kedua-dua belah mengembang dengan baik serta jelas tanpa infiltrasi parenkima fokal, kavitasi apikal, atau nodul pulmonari.";

  // 2. Cardiomediastinal & Hilar Silhouette
  let cardioEn =
    cardioIdx !== -1
      ? rawEn[cardioIdx]
      : fib >= 60
      ? "Upper lobe volume contraction with mild ipsilateral hilar elevation and tracheal shift; cardiac silhouette remains within physiological limits."
      : "Cardiomediastinal silhouette is normal in contour with cardiothoracic ratio < 0.50, midline trachea, and unremarkable bilateral hilar contours.";

  let cardioBm =
    cardioIdx !== -1 && rawBm[cardioIdx]
      ? rawBm[cardioIdx]
      : fib >= 60
      ? "Pengecutan isipadu lobus atas dengan sedikit tarikan hilum dan trakea ke sisi lesi; siluet jantung kekal dalam had fisiologi."
      : "Siluet kardiomediastinal adalah normal dengan nisbah kardiotorasik < 0.50, trakea di garisan tengah, dan kontur hilum kedua-dua belah yang normal.";

  // 3. Costophrenic Angles & Pleura
  let pleuraEn =
    pleuraIdx !== -1
      ? rawEn[pleuraIdx]
      : eff >= 25
      ? `Blunting of the costophrenic recess with suspected pleural reaction/effusion (${eff}%).`
      : "Bilateral costophrenic angles and hemidiaphragms are sharp and clear with no pleural effusion or pneumothorax.";

  let pleuraBm =
    pleuraIdx !== -1 && rawBm[pleuraIdx]
      ? rawBm[pleuraIdx]
      : eff >= 25
      ? `Sudut kostofrenik kelihatan tumpul dengan kecurigaan reaksi/efusi pleura (${eff}%).`
      : "Sudut kostofrenik dan hemidiafragma kedua-dua belah adalah tajam serta jelas tanpa efusi pleura atau pneumotoraks.";

  return [
    {
      domainEn: "Lung Zones (Upper, Mid, Lower)",
      domainBm: "Zon Paru-paru (Atas, Tengah, Bawah)",
      en: lungEn,
      bm: lungBm,
    },
    {
      domainEn: "Cardiomediastinal & Hilar Silhouette",
      domainBm: "Siluet Kardiomediastinal & Hilum",
      en: cardioEn,
      bm: cardioBm,
    },
    {
      domainEn: "Costophrenic Angles & Pleura",
      domainBm: "Sudut Kostofrenik & Pleura",
      en: pleuraEn,
      bm: pleuraBm,
    },
  ];
}

/**
 * Dynamically adapts Section 3 recommendations based on CAD Score + Patient Symptom/Exposure Status
 * referencing CPG KKM Management of Tuberculosis (4th Ed.) & WHO Module 2/3, while preserving AI recommendations.
 */
function buildDynamicActionPlan(tbScore, categoryInfo, enRecs, bmRecs) {
  const score = Number(tbScore ?? 0);
  const rawEn = Array.isArray(enRecs) ? enRecs.filter(Boolean) : [];
  const rawBm = Array.isArray(bmRecs) ? bmRecs.filter(Boolean) : [];

  let primaryProtocol = null;

  if (score >= 50) {
    primaryProtocol = {
      tag: "HIGH RISK / ACTIVE LESION PROTOCOL (CAD ≥ 50/100)",
      en: "Urgent Medical Officer review required. Initiate respiratory airborne isolation precautions, collect Sputum Xpert MTB/RIF Ultra + Sputum AFB Direct Smear x3, and submit statutory infectious disease notification via MyTB / Pejabat Kesihatan Daerah (PKD) under Act 342 if confirmed (CPG KKM Management of Tuberculosis 4th Ed.).",
      bm: "Semakan segera Pegawai Perubatan diperlukan. Mulakan langkah pengasingan pernafasan udara, ambil sampel Kahak Xpert MTB/RIF Ultra + Calitan Kahak AFB Langsung x3, dan kemukakan notifikasi wajib melalui sistem MyTB / PKD di bawah Akta 342 jika disahkan.",
    };
  } else if (categoryInfo.isSymptomaticOrExposure) {
    primaryProtocol = {
      tag: "SYMPTOMATIC / EXPOSURE CORRELATION PROTOCOL (CAD < 50/100)",
      en: "Radiograph shows no overt cavitary lesion (CAD Score < 50/100); however, due to clinical symptoms or high-risk exposure, correlate clinically and perform Sputum AFB Direct Smear x3 or Xpert MTB/RIF Ultra if cough persists >2 weeks (CPG KKM Management of Tuberculosis 4th Ed.).",
      bm: "Radiograf tidak menunjukkan lesi kavitasi terbuka (Skor CAD < 50/100); namun disebabkan gejala klinikal atau pendedahan risiko tinggi, lakukan korelasi klinikal dan ujian Calitan Kahak AFB Langsung x3 atau Xpert MTB/RIF Ultra sekiranya batuk berlarutan >2 minggu.",
    };
  } else {
    primaryProtocol = {
      tag: "ROUTINE SCREENING NEGATIVE PROTOCOL (CAD < 50/100 · ASYMPTOMATIC)",
      en: "Routine screening negative. No immediate microbiological sputum testing required unless clinical TB symptoms (cough >2 weeks, fever, night sweats, unexplained weight loss, or hemoptysis) develop (CPG KKM Management of Tuberculosis 4th Ed.).",
      bm: "Saringan rutin negatif. Tiada ujian kahak mikrobiologi segera diperlukan melainkan gejala klinikal TB (batuk >2 minggu, demam, berpeluh malam, susut berat badan, atau batuk berdarah) berkembang.",
    };
  }

  // Include up to 2 additional unique AI-generated recommendations from the payload
  const additionalItems = [];
  for (let i = 0; i < Math.min(rawEn.length, 2); i++) {
    const enItem = rawEn[i];
    const bmItem = rawBm[i] || "";
    if (
      enItem &&
      enItem.toLowerCase() !== primaryProtocol.en.toLowerCase()
    ) {
      additionalItems.push({ en: enItem, bm: bmItem });
    }
  }

  return { primaryProtocol, additionalItems };
}

function getBarColor(pct) {
  const val = Number(pct || 0);
  if (val >= 70) return "#EF4444";
  if (val >= 35) return "#F59E0B";
  return "#0D9488";
}

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
  const tbScore = Math.min(100, Math.max(0, Math.round(Number(result.tb_score ?? 0))));
  const severity = result.severity || "NO_LESION";

  const statusConfig = getTriageStatusConfig(tbScore, severity);
  const mytTime = formatMytDateTime(screening.created_at);
  const genderFormatted = formatBilingualGender(screening.gender);
  const categoryInfo = formatBilingualCategory(screening.patient_category);

  const reportIdUpper = String(screening.id || "SPECTRA-001")
    .slice(0, 13)
    .toUpperCase();
  const patientIdLower = String(screening.id || "spectra-001")
    .slice(0, 13)
    .toLowerCase();

  const structuredFindings = buildStructuredFindings(
    en.radiological_findings,
    bm.penemuan_radiologi,
    tbScore,
    pathology
  );

  const impressionEn =
    Array.isArray(en.impression) && en.impression.length > 0
      ? en.impression.join(" ")
      : statusConfig.riskHeadlineEn;

  const impressionBm =
    Array.isArray(bm.impresi) && bm.impresi.length > 0
      ? bm.impresi.join(" ")
      : statusConfig.riskHeadlineBm;

  const { primaryProtocol, additionalItems } = buildDynamicActionPlan(
    tbScore,
    categoryInfo,
    en.recommendation,
    bm.cadangan
  );

  const biomarkers = [
    {
      label: "Cavitation (Kavitasi)",
      value: Math.min(100, Math.max(0, Math.round(Number(pathology.cavitation ?? 0)))),
    },
    {
      label: "Consolidation (Konsolidasi)",
      value: Math.min(100, Math.max(0, Math.round(Number(pathology.consolidation ?? 0)))),
    },
    {
      label: "Pulmonary Nodules (Nodul)",
      value: Math.min(100, Math.max(0, Math.round(Number(pathology.nodules ?? 0)))),
    },
    {
      label: "Fibrosis (Fibrosis)",
      value: Math.min(100, Math.max(0, Math.round(Number(pathology.fibrosis ?? 0)))),
    },
    {
      label: "Pleural Effusion (Efusi Pleura)",
      value: Math.min(100, Math.max(0, Math.round(Number(pathology.effusion ?? 0)))),
    },
  ];

  // SVG circular gauge geometry
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (tbScore / 100) * circumference;

  return (
    <div
      ref={ref}
      data-testid="printable-clinical-report"
      style={{
        width: "794px",
        minHeight: "1123px",
        boxSizing: "border-box",
        backgroundColor: "#FFFFFF",
        color: "#0F172A",
        padding: "44px 52px",
        fontFamily: "'Plus Jakarta Sans', 'Inter', Helvetica, Arial, sans-serif",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        lineHeight: 1.4,
      }}
    >
      {/* TOP CONTENT WRAPPER */}
      <div>
        {/* 1. OFFICIAL LETTERHEAD BANNER (Top of Page) */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: "16px",
            paddingBottom: "10px",
          }}
        >
          {/* Left Side: Official Text Hierarchy (Zero left clipping guaranteed) */}
          <div style={{ flex: "1 1 auto", minWidth: 0, paddingLeft: "2px" }}>
            <div
              style={{
                fontSize: "15px",
                fontWeight: 800,
                color: "#0F172A",
                letterSpacing: "0.03em",
                textTransform: "uppercase",
                lineHeight: 1.25,
              }}
            >
              KEMENTERIAN KESIHATAN MALAYSIA
            </div>
            <div
              style={{
                fontSize: "12.5px",
                fontWeight: 700,
                color: "#1E3A8A",
                letterSpacing: "0.02em",
                textTransform: "uppercase",
                marginTop: "2px",
                lineHeight: 1.3,
              }}
            >
              PEJABAT KESIHATAN DAERAH KUALA NERUS
            </div>
            <div
              style={{
                fontSize: "11px",
                fontWeight: 500,
                color: "#64748B",
                marginTop: "2px",
                lineHeight: 1.3,
              }}
            >
              UNIT KAWALAN TB / KUSTA — Program Saringan Tuberkulosis Kebangsaan
            </div>
          </div>

          {/* Right Side: Confidential Badge & Monospace Metadata */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
              flexShrink: 0,
              textAlign: "right",
            }}
          >
            <div
              style={{
                display: "inline-block",
                padding: "2px 10px",
                borderRadius: "4px",
                border: "1px solid #991B1B",
                backgroundColor: "#FEF2F2",
                color: "#991B1B",
                fontFamily: "'JetBrains Mono', 'Courier New', monospace",
                fontSize: "9.5px",
                fontWeight: 700,
                letterSpacing: "0.06em",
                marginBottom: "5px",
              }}
            >
              CONFIDENTIAL // SULIT
            </div>
            <div
              style={{
                fontFamily: "'JetBrains Mono', 'Courier New', monospace",
                fontSize: "10px",
                color: "#334155",
                lineHeight: 1.45,
              }}
            >
              <div>
                <span style={{ color: "#64748B" }}>REPORT ID : </span>
                <strong style={{ color: "#0F172A" }}>{reportIdUpper}</strong>
              </div>
              <div>
                <span style={{ color: "#64748B" }}>DATE (MYT): </span>
                <strong style={{ color: "#0F172A" }}>{mytTime.shortMy}</strong>
              </div>
            </div>
          </div>
        </div>

        {/* 2px Solid Accent Divider Line (#0F172A to #0D9488) */}
        <div
          style={{
            height: "2.5px",
            width: "100%",
            background: "linear-gradient(90deg, #0F172A 0%, #1E3A8A 55%, #0D9488 100%)",
            backgroundColor: "#0F172A",
            marginBottom: "12px",
          }}
        />

        {/* 2. PATIENT DEMOGRAPHICS STRIP (4-Column Grid Card) */}
        <div
          style={{
            backgroundColor: "#F8FAFC",
            border: "1px solid #E2E8F0",
            borderRadius: "6px",
            padding: "9px 14px",
            marginBottom: "12px",
            display: "grid",
            gridTemplateColumns: "1.05fr 1.15fr 1.15fr 1.15fr",
            gap: "10px",
            alignItems: "center",
          }}
        >
          {/* Col 1: Patient ID */}
          <div>
            <div
              style={{
                fontSize: "8.5px",
                fontWeight: 700,
                color: "#64748B",
                textTransform: "uppercase",
                letterSpacing: "0.04em",
              }}
            >
              PATIENT ID / ID PESAKIT
            </div>
            <div
              style={{
                fontFamily: "'JetBrains Mono', 'Courier New', monospace",
                fontSize: "11px",
                fontWeight: 700,
                color: "#0F172A",
                marginTop: "2px",
              }}
            >
              {patientIdLower}
            </div>
          </div>

          {/* Col 2: Age & Gender */}
          <div>
            <div
              style={{
                fontSize: "8.5px",
                fontWeight: 700,
                color: "#64748B",
                textTransform: "uppercase",
                letterSpacing: "0.04em",
              }}
            >
              AGE &amp; GENDER / UMUR &amp; JANTINA
            </div>
            <div
              style={{
                fontSize: "11px",
                fontWeight: 700,
                color: "#0F172A",
                marginTop: "2px",
              }}
            >
              {screening.age} Tahun / {genderFormatted}
            </div>
          </div>

          {/* Col 3: Screening Tier */}
          <div>
            <div
              style={{
                fontSize: "8.5px",
                fontWeight: 700,
                color: "#64748B",
                textTransform: "uppercase",
                letterSpacing: "0.04em",
              }}
            >
              SCREENING TIER / KATEGORI
            </div>
            <div
              style={{
                fontSize: "11px",
                fontWeight: 700,
                color: "#0F172A",
                marginTop: "2px",
              }}
            >
              {categoryInfo.display}
            </div>
          </div>

          {/* Col 4: CAD Triage Status */}
          <div>
            <div
              style={{
                fontSize: "8.5px",
                fontWeight: 700,
                color: "#64748B",
                textTransform: "uppercase",
                letterSpacing: "0.04em",
              }}
            >
              CAD TRIAGE STATUS
            </div>
            <div style={{ marginTop: "2px" }}>
              <span
                style={{
                  display: "inline-block",
                  padding: "2px 8px",
                  borderRadius: "4px",
                  backgroundColor: statusConfig.bg,
                  color: statusConfig.text,
                  border: `1px solid ${statusConfig.border}`,
                  fontFamily: "'JetBrains Mono', 'Courier New', monospace",
                  fontSize: "9.5px",
                  fontWeight: 800,
                  letterSpacing: "0.03em",
                }}
              >
                {statusConfig.shortStatus}
              </span>
            </div>
          </div>
        </div>

        {/* 3. SIDE-BY-SIDE HERO SECTION: Radiograph Preview (38%) + CAD Analytics Card (62%) */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "38% 1fr",
            gap: "12px",
            marginBottom: "12px",
            alignItems: "stretch",
          }}
        >
          {/* Left Column (38%): Radiograph Viewport Card */}
          <div
            style={{
              backgroundColor: "#090D16",
              padding: "8px",
              borderRadius: "6px",
              border: "1px solid #1E293B",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <div
              style={{
                height: "196px",
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "#05080F",
                borderRadius: "4px",
                overflow: "hidden",
              }}
            >
              {screening.image_base64 ? (
                <img
                  src={screening.image_base64}
                  alt="Verified PA/AP Chest Radiograph"
                  style={{
                    maxHeight: "190px",
                    maxWidth: "100%",
                    width: "auto",
                    height: "auto",
                    objectFit: "contain",
                    display: "block",
                  }}
                />
              ) : (
                <div
                  style={{
                    color: "#94A3B8",
                    fontFamily: "'JetBrains Mono', 'Courier New', monospace",
                    fontSize: "10px",
                    textAlign: "center",
                    padding: "16px",
                  }}
                >
                  [DICOM PA/AP THORACIC RADIOGRAPH ARCHIVED]
                </div>
              )}
            </div>
            <div
              style={{
                marginTop: "6px",
                paddingTop: "5px",
                borderTop: "1px solid #1E293B",
                textAlign: "center",
                fontFamily: "'JetBrains Mono', 'Courier New', monospace",
                fontSize: "9px",
                fontWeight: 600,
                color: "#94A3B8",
                letterSpacing: "0.05em",
              }}
            >
              VIEW: PA/AP CXR | GATE #4: VERIFIED
            </div>
          </div>

          {/* Right Column (62%): SPECTRA AI-TB Quantitative Biomarker Card */}
          <div
            style={{
              backgroundColor: "#FFFFFF",
              border: "1px solid #E2E8F0",
              borderRadius: "6px",
              padding: "12px 14px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            {/* Top Row of Card: Circular Gauge + Score Callout + Status Badge */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "14px",
                paddingBottom: "10px",
                borderBottom: "1px solid #E2E8F0",
              }}
            >
              {/* Circular Gauge */}
              <div
                style={{
                  position: "relative",
                  width: "68px",
                  height: "68px",
                  flexShrink: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg width="68" height="68" viewBox="0 0 68 68">
                  <circle
                    cx="34"
                    cy="34"
                    r={radius}
                    fill="none"
                    stroke="#E2E8F0"
                    strokeWidth="6"
                  />
                  <circle
                    cx="34"
                    cy="34"
                    r={radius}
                    fill="none"
                    stroke={statusConfig.ringColor}
                    strokeWidth="6"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={dashOffset}
                    transform="rotate(-90 34 34)"
                  />
                </svg>
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: "'JetBrains Mono', 'Courier New', monospace",
                  }}
                >
                  <span
                    style={{
                      fontSize: "18px",
                      fontWeight: 800,
                      color: "#0F172A",
                      lineHeight: 1,
                    }}
                  >
                    {tbScore}
                  </span>
                  <span
                    style={{
                      fontSize: "8.5px",
                      fontWeight: 600,
                      color: "#64748B",
                      marginTop: "1px",
                    }}
                  >
                    / 100
                  </span>
                </div>
              </div>

              {/* Status Badge & Subtext */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: "9px",
                    fontWeight: 700,
                    color: "#0D9488",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    marginBottom: "3px",
                  }}
                >
                  SPECTRA AI-TB QUANTITATIVE BIOMARKER INDEX
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                  <span
                    style={{
                      display: "inline-block",
                      padding: "2.5px 9px",
                      borderRadius: "4px",
                      backgroundColor: statusConfig.bg,
                      color: statusConfig.text,
                      border: `1px solid ${statusConfig.border}`,
                      fontFamily: "'JetBrains Mono', 'Courier New', monospace",
                      fontSize: "10.5px",
                      fontWeight: 800,
                      letterSpacing: "0.03em",
                    }}
                  >
                    {statusConfig.badgeLabel}
                  </span>
                  <span
                    style={{
                      fontFamily: "'JetBrains Mono', 'Courier New', monospace",
                      fontSize: "11px",
                      fontWeight: 700,
                      color: "#0F172A",
                    }}
                  >
                    CAD Score: {tbScore}/100
                  </span>
                </div>
                <div
                  style={{
                    fontSize: "9.5px",
                    color: "#475569",
                    marginTop: "4px",
                  }}
                >
                  Clinical Cutoff Threshold: <strong>&ge; 50/100</strong> (WHO Module 2 / MaHTAS Calibrated)
                </div>
              </div>
            </div>

            {/* Bottom Row of Card: 5 Horizontal Progress Bars for Sub-Pathologies */}
            <div style={{ paddingTop: "8px", display: "flex", flexDirection: "column", gap: "6px" }}>
              {biomarkers.map((bio) => (
                <div
                  key={bio.label}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "175px 1fr 38px",
                    alignItems: "center",
                    gap: "10px",
                  }}
                >
                  <span
                    style={{
                      fontSize: "10px",
                      fontWeight: 600,
                      color: "#334155",
                    }}
                  >
                    {bio.label}
                  </span>
                  <div
                    style={{
                      height: "6px",
                      width: "100%",
                      backgroundColor: "#E2E8F0",
                      borderRadius: "999px",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        width: `${Math.max(bio.value, bio.value > 0 ? 4 : 0)}%`,
                        backgroundColor: getBarColor(bio.value),
                        borderRadius: "999px",
                      }}
                    />
                  </div>
                  <span
                    style={{
                      fontFamily: "'JetBrains Mono', 'Courier New', monospace",
                      fontSize: "10px",
                      fontWeight: 700,
                      color: "#0F172A",
                      textAlign: "right",
                    }}
                  >
                    {bio.value}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* PART 2: STRUCTURED CLINICAL NARRATIVE SECTIONS (DYNAMIC CONTENT) */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {/* SECTION 1: 1. RADIOLOGICAL FINDINGS / PENEMUAN RADIOLOGI */}
          <div
            style={{
              backgroundColor: "#FFFFFF",
              border: "1px solid #E2E8F0",
              borderLeft: "3.5px solid #1E3A8A",
              borderRadius: "6px",
              padding: "9px 13px",
            }}
          >
            <div
              style={{
                fontSize: "10.5px",
                fontWeight: 800,
                color: "#0F172A",
                textTransform: "uppercase",
                letterSpacing: "0.04em",
                borderBottom: "1px solid #F1F5F9",
                paddingBottom: "4px",
                marginBottom: "6px",
              }}
            >
              1. RADIOLOGICAL FINDINGS / PENEMUAN RADIOLOGI
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
              {structuredFindings.map((item) => (
                <div key={item.domainEn} style={{ fontSize: "10px", lineHeight: 1.38 }}>
                  <div>
                    <strong style={{ color: "#0F172A" }}>{item.domainEn}: </strong>
                    <span style={{ color: "#1E293B" }}>{item.en}</span>
                  </div>
                  <div style={{ color: "#475569", fontStyle: "italic", fontSize: "9.5px", marginTop: "1px" }}>
                    <strong>{item.domainBm}: </strong>
                    {item.bm}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION 2: 2. IMPRESSION / IMPRESI DIAGNOSTIK */}
          <div
            style={{
              backgroundColor: statusConfig.bg,
              border: `1px solid ${statusConfig.border}`,
              borderLeft: `3.5px solid ${statusConfig.accent}`,
              borderRadius: "6px",
              padding: "9px 13px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                borderBottom: "1px solid rgba(15, 23, 42, 0.08)",
                paddingBottom: "4px",
                marginBottom: "5px",
              }}
            >
              <span
                style={{
                  fontSize: "10.5px",
                  fontWeight: 800,
                  color: "#0F172A",
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                }}
              >
                2. IMPRESSION / IMPRESI DIAGNOSTIK
              </span>
              <span
                style={{
                  fontFamily: "'JetBrains Mono', 'Courier New', monospace",
                  fontSize: "9.5px",
                  fontWeight: 700,
                  color: statusConfig.text,
                }}
              >
                {statusConfig.riskHeadlineEn}
              </span>
            </div>
            <div style={{ fontSize: "10.5px", fontWeight: 700, color: "#0F172A", lineHeight: 1.38 }}>
              {impressionEn}
            </div>
            <div
              style={{
                fontSize: "9.5px",
                color: "#475569",
                fontStyle: "italic",
                marginTop: "2px",
                lineHeight: 1.35,
              }}
            >
              {impressionBm}
            </div>
          </div>

          {/* SECTION 3: 3. RECOMMENDED CLINICAL ACTION PLAN / PELAN TINDAKAN KLINIKAL */}
          <div
            style={{
              backgroundColor: "#FFFFFF",
              border: "1px solid #E2E8F0",
              borderLeft: "3.5px solid #0D9488",
              borderRadius: "6px",
              padding: "9px 13px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                borderBottom: "1px solid #F1F5F9",
                paddingBottom: "4px",
                marginBottom: "6px",
              }}
            >
              <span
                style={{
                  fontSize: "10.5px",
                  fontWeight: 800,
                  color: "#0F172A",
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                }}
              >
                3. RECOMMENDED CLINICAL ACTION PLAN / PELAN TINDAKAN KLINIKAL
              </span>
              <span
                style={{
                  fontFamily: "'JetBrains Mono', 'Courier New', monospace",
                  fontSize: "8.5px",
                  fontWeight: 700,
                  color: "#0D9488",
                }}
              >
                {primaryProtocol.tag}
              </span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "5px", fontSize: "10px", lineHeight: 1.38 }}>
              {/* Primary CPG KKM Adapted Action */}
              <div>
                <div style={{ color: "#0F172A", fontWeight: 600 }}>
                  &bull; {primaryProtocol.en}
                </div>
                <div style={{ color: "#475569", fontStyle: "italic", fontSize: "9.5px", marginLeft: "10px" }}>
                  {primaryProtocol.bm}
                </div>
              </div>

              {/* Additional AI Payload Action Items */}
              {additionalItems.map((item, idx) => (
                <div key={idx}>
                  <div style={{ color: "#1E293B" }}>
                    &bull; {item.en}
                  </div>
                  {item.bm && (
                    <div style={{ color: "#475569", fontStyle: "italic", fontSize: "9.5px", marginLeft: "10px" }}>
                      {item.bm}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* PART 3: PROFESSIONAL SIGN-OFF & TELEMETRY FOOTER */}
      <div
        style={{
          marginTop: "12px",
          border: "1px solid #CBD5E1",
          backgroundColor: "#F8FAFC",
          borderRadius: "6px",
          padding: "10px 14px",
          display: "grid",
          gridTemplateColumns: "1.25fr 0.95fr",
          gap: "16px",
          alignItems: "stretch",
        }}
      >
        {/* Left Box: Attending Medical Officer Verification */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            paddingRight: "8px",
            borderRight: "1px solid #E2E8F0",
          }}
        >
          <div>
            <div
              style={{
                fontSize: "9.5px",
                fontWeight: 800,
                color: "#0F172A",
                textTransform: "uppercase",
                letterSpacing: "0.04em",
              }}
            >
              ATTENDING MEDICAL OFFICER VERIFICATION / PENGESAHAN PEGAWAI PERUBATAN
            </div>
            <div
              style={{
                fontSize: "9.5px",
                color: "#334155",
                fontStyle: "italic",
                marginTop: "3px",
              }}
            >
              &ldquo;I have clinically correlated the SPECTRA AI-TB CAD findings with the patient&apos;s history and physical examination.&rdquo;
            </div>

            {/* Visual Checkboxes */}
            <div
              style={{
                marginTop: "6px",
                display: "flex",
                flexDirection: "column",
                gap: "3px",
                fontFamily: "'JetBrains Mono', 'Courier New', monospace",
                fontSize: "9.5px",
                fontWeight: 600,
                color: "#0F172A",
              }}
            >
              <div>[ &nbsp; ] Concur with AI Triage Assessment</div>
              <div>[ &nbsp; ] Clinical Override (Specify in patient notes)</div>
            </div>
          </div>

          {/* Telemetry Metadata Block */}
          <div
            style={{
              marginTop: "8px",
              paddingTop: "6px",
              borderTop: "1px solid #E2E8F0",
              fontFamily: "'JetBrains Mono', 'Courier New', monospace",
              fontSize: "8.8px",
              color: "#475569",
              lineHeight: 1.45,
            }}
          >
            <div>
              <strong style={{ color: "#1E293B" }}>System Engine :</strong> SPECTRA-CAD-V3.8 (Gemini 2.5 Flash Multimodal)
            </div>
            <div>
              <strong style={{ color: "#1E293B" }}>Safety Gate &nbsp; :</strong> Directive #4 VERIFIED (Valid PA/AP Radiograph)
            </div>
            <div>
              <strong style={{ color: "#1E293B" }}>Generated At &nbsp;:</strong> {mytTime.fullMy}
            </div>
          </div>
        </div>

        {/* Right Box: Official Signature & Stamp Area */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              minHeight: "84px",
              backgroundColor: "#FFFFFF",
              border: "1.5px dashed #94A3B8",
              borderRadius: "5px",
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "center",
              padding: "6px",
            }}
          >
            <span
              style={{
                fontSize: "8.5px",
                color: "#94A3B8",
                fontFamily: "'JetBrains Mono', 'Courier New', monospace",
                textTransform: "uppercase",
                letterSpacing: "0.04em",
              }}
            >
              Official Stamp &amp; Signature Well
            </span>
          </div>

          <div style={{ marginTop: "6px", textAlign: "center" }}>
            <div
              style={{
                fontSize: "9.5px",
                fontWeight: 700,
                color: "#1E293B",
              }}
            >
              Tandatangan, Cop Rasmi &amp; No. MMC Pegawai Perubatan
            </div>
            <div
              style={{
                fontSize: "9.5px",
                fontFamily: "'JetBrains Mono', 'Courier New', monospace",
                color: "#475569",
                marginTop: "2px",
              }}
            >
              Tarikh / Date: ____ / ____ / {mytTime.year}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

PrintableReport.displayName = "PrintableReport";

export default PrintableReport;
