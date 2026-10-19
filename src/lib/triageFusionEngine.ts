/**
 * @file triageFusionEngine.ts
 * @description MODUL 2: Unified TB Triage Index (Late-Fusion Multimodal Clinical Algorithm)
 *
 * CLINICAL RATIONALE:
 * In accordance with WHO Target Product Profiles (TPP) for Tuberculosis Triage and
 * Ministry of Health Malaysia (KKM) CPG (4th Edition), single-modality screening can yield
 * false negatives (e.g. early endobronchial TB without visible cavitation on CXR, or immunocompromised
 * patients with atypical presentations).
 *
 * A multi-modal late-fusion approach synthesizes:
 *  1. Structural Anatomical Evidence (Chest X-Ray CAD - 60% weight): Cavitation, consolidation, apical infiltrates.
 *  2. Functional Acoustic Biomarkers (AeroTriage Audio - 30% weight): Low-frequency bronchial secretions (<400Hz),
 *     wetness index, explosive paroxysmal bursts.
 *  3. Host Vulnerability Multiplier (Demographic Risk Tier - 10% base weighting + scaling factor):
 *     Accounts for impaired cellular immunity (HIV, uncontrolled Diabetes) and high transmission exposure.
 */

export interface CoughAcousticFeatures {
  peak_frequency_hz: number;
  cough_burst_count: number;
  cough_wetness_index?: number; // 0 - 100%
  zero_crossing_rate?: number;
  duration_ms?: number;
}

export type PatientRiskTier =
  | "HIV / Immunocompromised"
  | "Kontak Rapat"
  | "Diabetes Mellitus"
  | "Warga Emas"
  | "Perokok Tegar"
  | "Banduan / Institusi"
  | "Patient"
  | "Screening"
  | string;

export interface UnifiedTriageOutcome {
  unified_index: number; // 0 - 100 clamped integer
  risk_level: "HIGH_RISK" | "MODERATE_RISK" | "LOW_RISK";
  breakdown: {
    cxr_component: number;       // Weighted 60%
    cough_component: number;     // Weighted 30%
    demographic_weight: number;  // Weighted 10%
    risk_multiplier: number;     // Multiplier applied
  };
  clinical_recommendation: {
    bm: string;
    en: string;
  };
  act_342_notification_required: boolean;
}

/**
 * Maps patient risk tier to an evidence-grounded epidemiological multiplier.
 * Grounded in CPG KKM TB (4th Ed) Table 3.1: Relative Risk for Active TB Progression.
 */
export function getDemographicRiskMultiplier(tier: PatientRiskTier): number {
  switch (tier) {
    case "HIV / Immunocompromised":
      // Relative risk > 20x for active disease progression
      return 1.25;
    case "Kontak Rapat":
      // Close household contact with infectious smear-positive index case
      return 1.15;
    case "Diabetes Mellitus":
      // Impaired neutrophil chemotaxis and cell-mediated immunity (~3x risk)
      return 1.10;
    case "Banduan / Institusi":
      // Congregate high-density living conditions
      return 1.10;
    case "Warga Emas":
      // Age > 65 with immunosenescence
      return 1.08;
    case "Perokok Tegar":
      // Impaired mucociliary escalator and alveolar macrophage function
      return 1.05;
    default:
      // General community baseline
      return 1.00;
  }
}

/**
 * Computes the normalized acoustic cough severity score (0 to 100) based on
 * cough burst multiplicity, low-frequency bronchial resonance, and mucosal wetness.
 *
 * Clinical Rule:
 * - Productive, heavy TB coughs typically exhibit low peak frequencies (250Hz - 450Hz)
 *   from bronchial mucus bubbling and multiple paroxysmal bursts (>=2 bursts).
 * - Higher frequencies (>1200Hz) represent dry tracheal/laryngeal irritation (e.g. viral tracheitis).
 */
export function computeAcousticSeverity(features: CoughAcousticFeatures): number {
  let score = 0;

  // 1. Burst Multiplicity Scoring (0 to 40 pts)
  const burstCount = Math.max(1, features.cough_burst_count || 1);
  if (burstCount >= 3) {
    score += 40; // Paroxysmal coughing fit
  } else if (burstCount === 2) {
    score += 28;
  } else {
    score += 15; // Single isolated cough
  }

  // 2. Peak Frequency Resonant Profile (0 to 35 pts)
  const freq = features.peak_frequency_hz || 500;
  if (freq >= 200 && freq <= 450) {
    // Classic bronchial rumbling / cavitary fluid resonance
    score += 35;
  } else if (freq > 450 && freq <= 750) {
    score += 22;
  } else if (freq > 750 && freq <= 1300) {
    score += 14;
  } else {
    // Very high pitch (>1300 Hz) usually signifies dry superficial friction
    score += 8;
  }

  // 3. Cough Wetness Contribution (0 to 25 pts)
  const wetness = Math.min(100, Math.max(0, features.cough_wetness_index ?? 30));
  score += Math.round((wetness / 100) * 25);

  return Math.min(100, Math.max(0, score));
}

/**
 * Unified Late-Fusion Algorithm merging CXR, Audio, and Demographic Host Susceptibility.
 *
 * @param cxrScore - Chest X-Ray CAD score (0 to 100)
 * @param coughFeatures - Extracted acoustic biomarkers from Web Audio API
 * @param patientRiskTier - Clinical risk category string
 * @returns UnifiedTriageOutcome with locked 0-100 index and CPG recommendations
 */
export function calculateTriageIndex(
  cxrScore: number,
  coughFeatures: CoughAcousticFeatures,
  patientRiskTier: PatientRiskTier = "Screening"
): UnifiedTriageOutcome {
  // Clamping CXR input to 0-100
  const normalizedCxr = Math.min(100, Math.max(0, Number(cxrScore) || 0));

  // Compute acoustic cough sub-score (0-100)
  const rawCoughSeverity = computeAcousticSeverity(coughFeatures);

  // Demographic risk multiplier
  const multiplier = getDemographicRiskMultiplier(patientRiskTier);

  // Baseline weighted fusion: 60% CXR + 30% Cough + 10% Demographic Baseline
  const demographicBaseScore = 50; // Baseline neutral score for demographic component
  const weightedCxr = normalizedCxr * 0.6;
  const weightedCough = rawCoughSeverity * 0.3;
  const weightedDemo = demographicBaseScore * 0.1;

  // Unadjusted fused score
  const baseFused = weightedCxr + weightedCough + weightedDemo;

  // Apply host vulnerability multiplier
  const adjustedFused = baseFused * multiplier;

  // Lock and clamp final integer strictly to [0, 100]
  const unifiedIndex = Math.min(100, Math.max(0, Math.round(adjustedFused)));

  // Clinical Risk Stratification
  let riskLevel: "HIGH_RISK" | "MODERATE_RISK" | "LOW_RISK" = "LOW_RISK";
  let act342Required = false;

  if (unifiedIndex >= 60 || normalizedCxr >= 70) {
    riskLevel = "HIGH_RISK";
    act342Required = true;
  } else if (unifiedIndex >= 35 || normalizedCxr >= 40) {
    riskLevel = "MODERATE_RISK";
  } else {
    riskLevel = "LOW_RISK";
  }

  return {
    unified_index: unifiedIndex,
    risk_level: riskLevel,
    breakdown: {
      cxr_component: Number(weightedCxr.toFixed(1)),
      cough_component: Number(weightedCough.toFixed(1)),
      demographic_weight: Number(weightedDemo.toFixed(1)),
      risk_multiplier: multiplier,
    },
    act_342_notification_required: act342Required,
    clinical_recommendation: {
      bm:
        riskLevel === "HIGH_RISK"
          ? "TRIAGE TINGGI: Indeks triaj gabungan menunjukkan kecurigaan tinggi Tuberkulosis aktif. Wajib lakukan ujian pantas molekular GeneXpert MTB/RIF Ultra dan Sputum AFB x2 serta notifikasi ke Pejabat Kesihatan Daerah (PKD) di bawah Akta 342 dalam 7 hari."
          : riskLevel === "MODERATE_RISK"
          ? "TRIAGE SEDERHANA: Penemuan respiratori bermakna dikesan. Rujuk pesakit ke Klinik Kesihatan untuk pemeriksaan kahak ulangan dan penilaian gejala lanjut."
          : "TRIAGE RENDAH: Tiada bukti klinikal atau radiologi yang mencurigakan bagi TB aktif. Teruskan pemantauan kesihatan biasa.",
      en:
        riskLevel === "HIGH_RISK"
          ? "HIGH RISK TRIAGE: Unified late-fusion index indicates strong suspicion of active pulmonary TB. Mandates rapid molecular GeneXpert MTB/RIF Ultra, 2x sputum AFB smears, and statutory Act 342 notification to District Health Office within 7 days."
          : riskLevel === "MODERATE_RISK"
          ? "MODERATE RISK: Meaningful respiratory findings present. Refer to Health Clinic for repeat sputum evaluation and symptom surveillance."
          : "LOW RISK: No significant radiographic or acoustic evidence of active TB. Routine health monitoring indicated.",
    },
  };
}
