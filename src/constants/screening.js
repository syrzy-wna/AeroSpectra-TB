export const PATIENT_CATEGORIES = [
  {
    value: "Patient",
    label: "Symptomatic Patient (Pesakit Simptomatik)",
    description: "Batuk > 2 minggu, demam, berpeluh malam, batuk berdarah (hemoptysis) mengikut kriteria CPG KKM.",
  },
  {
    value: "Contact",
    label: "Close Contact (Kontak Rapat)",
    description: "Ahli isi rumah atau kontak bersemuka kepada kes indeks TB positif calitan kahak.",
  },
  {
    value: "Screening",
    label: "Community & NHSI Screening (Saringan Komuniti)",
    description: "Inisiatif Saringan Kesihatan Kebangsaan (NHSI), warga emas, pesakit diabetes, atau pekerja asing.",
  },
  {
    value: "Occupational",
    label: "High-Risk Workplace (Pekerja Risiko Tinggi)",
    description: "Pendedahan kepada habuk silika, asbes, asap diesel, atau bahan kimia industri (Pilar Tempat Kerja LHI).",
  },
];

export const GENDER_OPTIONS = [
  { value: "Lelaki", label: "Male (Lelaki)" },
  { value: "Perempuan", label: "Female (Perempuan)" },
];

export const SMOKING_STATUS_OPTIONS = [
  { value: "Non-Smoker", label: "Non-Smoker (Bukan Perokok)" },
  { value: "Current Smoker", label: "Current Tobacco Smoker (Perokok Tembakau Aktif - Akta 852)" },
  { value: "E-Cigarette/Vape", label: "E-Cigarette / Vape User (Pengguna Rokok Elektronik)" },
  { value: "Dual User", label: "Dual User (Perokok & Vape)" },
  { value: "Ex-Smoker", label: "Former Smoker (Bekas Perokok)" },
];

export const SEVERITY_CONFIG = {
  NO_LESION: {
    label: "No Active Lesion",
    labelBm: "Tiada Lesi Aktif",
    badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
    scoreRange: "0 - 29",
    color: "#059669",
    risk: "Low Risk (Risiko Rendah)",
    summary: "Clear lung fields without active parenchymal infiltration or cavitation.",
    summaryBm: "Medan paru-paru jelas tanpa infiltrasi parenkima aktif atau kavitasi.",
    lhiPathway: "Reassurance & routine NHSI screening interval",
  },
  MINIMAL: {
    label: "Minimal Abnormality",
    labelBm: "Keabnormalan Minimal",
    badgeClass: "bg-blue-50 text-blue-700 border-blue-200",
    scoreRange: "30 - 60",
    color: "#2563EB",
    risk: "Indeterminate / Early Stage",
    summary: "Discrete non-cavitary infiltrates confined to small anatomical volume.",
    summaryBm: "Infiltrat bukan kavitasi terhad kepada isipadu paru-paru yang kecil.",
    lhiPathway: "Tier 1: Spirometry + Sputum AFB 2x + Clinic review in 2 weeks",
  },
  MODERATE: {
    label: "Moderate TB Lesion",
    labelBm: "Lesi TB Sederhana",
    badgeClass: "bg-amber-50 text-amber-700 border-amber-200",
    scoreRange: "61 - 85",
    color: "#D97706",
    risk: "High Suspicion (Kecurigaan Tinggi)",
    summary: "Dense or confluent consolidation across one or more lobes with nodular spread.",
    summaryBm: "Konsolidasi padat atau bercantum melibatkan satu atau lebih lobus.",
    lhiPathway: "Tier 3: Stat GeneXpert MTB/RIF + Rapid molecular test + Contact tracing registration",
  },
  SEVERE: {
    label: "Severe / Advanced TB",
    labelBm: "TB Lanjutan / Teruk",
    badgeClass: "bg-rose-50 text-rose-700 border-rose-200",
    scoreRange: "86 - 100",
    color: "#E11D48",
    risk: "Critical / Immediate Triage (Triage Segera)",
    summary: "Extensive involvement, multiple lobar consolidation, thick-walled cavity, or pleural compromise.",
    summaryBm: "Penglibatan meluas, konsolidasi multilobar, kavitasi berdinding tebal, atau komplikasi pleura.",
    lhiPathway: "Airborne Isolation (N95) + Urgent OTA Program Enrollment + Stat Chest Physician Referral",
  },
};

export const PATHOLOGY_LABELS = {
  cavitation: {
    en: "Cavitation",
    bm: "Kavitasi",
    desc: "Gas-filled lucency within lung consolidation with thick fibrotic walls (classic hallmark of secondary TB)",
  },
  consolidation: {
    en: "Consolidation",
    bm: "Konsolidasi",
    desc: "Alveolar exudate replacing air spaces, commonly affecting apical and posterior upper lobe segments",
  },
  fibrosis: {
    en: "Fibrosis & Volume Loss",
    bm: "Fibrosis & Susutan Isipadu",
    desc: "Architectural distortion, traction bronchiectasis, and tracheal shift reflecting chronic inflammatory scarring",
  },
  effusion: {
    en: "Pleural Effusion",
    bm: "Efusi Pleura",
    desc: "Fluid accumulation in pleural space, blunting costophrenic recesses or causing meniscus formation",
  },
  nodules: {
    en: "Nodules / Micronodules",
    bm: "Nodul / Mikronodul",
    desc: "Well-circumscribed opacities or tree-in-bud endobronchial seeding reflecting active dissemination",
  },
};

export const LHI_DIAGNOSTIC_TIERS = {
  TIER_1: {
    name: "Tier 1: Functional Testing & Primary Care Baseline",
    nameBm: "Peringkat 1: Ujian Fungsi & Garis Asas Penjagaan Primer",
    tools: ["Functional Spirometry", "Digital AI-Assisted Chest X-Ray", "Fractional Exhaled Nitric Oxide (FeNO)"],
    facility: "Klinik Kesihatan (Target: >250 clinics by 2027)",
  },
  TIER_2: {
    name: "Tier 2: Advanced Imaging & Interventional Endoscopy",
    nameBm: "Peringkat 2: Pengimejan Lanjutan & Endoskopi Intervensi",
    tools: ["Low-Dose CT (LDCT)", "Navigational Bronchoscopy", "Endobronchial Ultrasound (EBUS) Linear & Radial"],
    facility: "Referral & State General Hospitals (e.g. HRPZ II, HKL, HTAR, HSB)",
  },
  TIER_3: {
    name: "Tier 3: Molecular Diagnostics & Rapid Genomic Assays",
    nameBm: "Peringkat 3: Diagnostik Molekular & Asai Genomik Pantas",
    tools: ["GeneXpert MTB/RIF Cartridge Assay", "TB-LAMP", "Interferon Gamma Release Assay (IGRA)", "Next Generation Sequencing (NGS)"],
    facility: "Specialist Respiratory Reference Centers & Molecular Labs",
  },
};
