/**
 * @file fhirExporter.ts
 * @description MODUL 3: HL7 FHIR Interoperability Exporter (DiagnosticReport & Observation Bundle)
 *
 * HEALTHCARE DATA STANDARD RATIONALE:
 * In accordance with global digital health standards (HL7 FHIR R4) and the Ministry of Health
 * Malaysia (KKM) Digital Health Plan, clinical decision support software must export interoperable
 * medical summaries compatible with Hospital Information Systems (HIS), Clinic Management Systems (CCMS),
 * and national electronic public health registries.
 *
 * STANDARD CODING SYSTEMS USED:
 * - LOINC:
 *   - 88122-7: Tuberculosis screening assessment
 *   - 24648-8: Chest X-ray Diagnostic imaging study report
 *   - 72170-4: Acoustic cough assessment
 * - SNOMED CT:
 *   - 56717001: Tuberculosis (disorder)
 *   - 428287002: Cavity of lung (disorder)
 *   - 254837009: Consolidation of lung (disorder)
 * - MOH Act 342 Extension:
 *   - Custom URI mapping statutory disease reporting under Malaysian Law.
 */

export interface FhirPatientInput {
  id: string;
  name?: string;
  age: number;
  gender: "Lelaki" | "Perempuan" | string;
  patient_category?: string;
  facility?: string;
}

export interface FhirAiFindingsInput {
  screening_id: string;
  timestamp?: string;
  cxr_score: number;
  cxr_severity: string;
  pathology_scores?: {
    cavitation?: number;
    consolidation?: number;
    nodules?: number;
    fibrosis?: number;
    effusion?: number;
  };
  cough_peak_hz?: number;
  cough_wetness_index?: number;
  who_symptoms_positive?: string[];
  radiological_impression?: string[];
  cpg_recommendations?: string[];
}

export interface FhirDiagnosticReportBundle {
  resourceType: "Bundle";
  id: string;
  type: "collection";
  timestamp: string;
  entry: Array<{
    fullUrl: string;
    resource: any;
  }>;
}

/**
 * Transforms patient data, unified triage index, and multimodal AI findings into a valid
 * HL7 FHIR R4 DiagnosticReport Bundle including Patient, Observations, and Act 342 Extensions.
 *
 * @param patientData - Patient demographics & facility
 * @param triageIndex - Fused triage score (0-100) or outcome object
 * @param aiFindings - Granular radiological and acoustic findings
 * @returns Complete HL7 FHIR R4 JSON Bundle
 */
export function generateFhirReport(
  patientData: FhirPatientInput,
  triageIndex: number | { unified_index: number; risk_level: string; act_342_notification_required?: boolean },
  aiFindings: FhirAiFindingsInput
): FhirDiagnosticReportBundle {
  const timestamp = aiFindings.timestamp || new Date().toISOString();
  const indexValue = typeof triageIndex === "number" ? triageIndex : triageIndex.unified_index;
  const isHighRisk = indexValue >= 60;
  const act342Required =
    typeof triageIndex === "object"
      ? Boolean(triageIndex.act_342_notification_required)
      : isHighRisk;

  const bundleId = `bundle-tb-${aiFindings.screening_id || Date.now()}`;
  const patientRefId = `patient-${patientData.id || "anon"}`;
  const diagnosticReportId = `diagrep-tb-${aiFindings.screening_id || Date.now()}`;
  const triageObservationId = `obs-triage-${aiFindings.screening_id || Date.now()}`;
  const cxrObservationId = `obs-cxr-${aiFindings.screening_id || Date.now()}`;
  const coughObservationId = `obs-cough-${aiFindings.screening_id || Date.now()}`;

  // 1. Patient Resource
  const patientResource = {
    resourceType: "Patient",
    id: patientRefId,
    active: true,
    name: [
      {
        use: "official",
        text: patientData.name || `Pesakit Saringan TB #${patientData.id.slice(0, 8)}`,
      },
    ],
    gender: patientData.gender?.toLowerCase() === "lelaki" ? "male" : "female",
    extension: [
      {
        url: "http://moh.gov.my/fhir/StructureDefinition/patient-screening-tier",
        valueString: patientData.patient_category || "Community Screening",
      },
      {
        url: "http://moh.gov.my/fhir/StructureDefinition/patient-estimated-age",
        valueInteger: patientData.age || 40,
      },
    ],
    managingOrganization: {
      display: patientData.facility || "Pejabat Kesihatan Daerah Kuala Nerus · KKM",
    },
  };

  // 2. Unified Triage Index Observation
  const triageObservationResource = {
    resourceType: "Observation",
    id: triageObservationId,
    status: "final",
    category: [
      {
        coding: [
          {
            system: "http://terminology.hl7.org/CodeSystem/observation-category",
            code: "survey",
            display: "Survey",
          },
        ],
      },
    ],
    code: {
      coding: [
        {
          system: "http://loinc.org",
          code: "88122-7",
          display: "Tuberculosis screening assessment",
        },
      ],
      text: "AeroSpectra TB Unified Triage Index",
    },
    subject: {
      reference: `Patient/${patientRefId}`,
    },
    effectiveDateTime: timestamp,
    valueQuantity: {
      value: indexValue,
      unit: "score",
      system: "http://unitsofmeasure.org",
      code: "{score}",
    },
    interpretation: [
      {
        coding: [
          {
            system: "http://terminology.hl7.org/CodeSystem/v3-ObservationInterpretation",
            code: isHighRisk ? "H" : indexValue >= 35 ? "A" : "N",
            display: isHighRisk ? "High Risk Suspect" : indexValue >= 35 ? "Abnormal" : "Normal",
          },
        ],
      },
    ],
  };

  // 3. Chest X-Ray CAD Observation (with SNOMED CT findings)
  const cxrObservationResource = {
    resourceType: "Observation",
    id: cxrObservationId,
    status: "final",
    code: {
      coding: [
        {
          system: "http://loinc.org",
          code: "24648-8",
          display: "Chest X-ray Diagnostic imaging study report",
        },
      ],
      text: "Gemini 3.8 Flash Multimodal CAD CXR Analysis",
    },
    subject: {
      reference: `Patient/${patientRefId}`,
    },
    effectiveDateTime: timestamp,
    valueQuantity: {
      value: aiFindings.cxr_score,
      unit: "points",
      system: "http://unitsofmeasure.org",
      code: "{points}",
    },
    component: [
      {
        code: {
          coding: [{ system: "http://snomed.info/sct", code: "428287002", display: "Cavity of lung" }],
          text: "Cavitation Score",
        },
        valueQuantity: {
          value: aiFindings.pathology_scores?.cavitation ?? 0,
          unit: "%",
        },
      },
      {
        code: {
          coding: [{ system: "http://snomed.info/sct", code: "254837009", display: "Consolidation of lung" }],
          text: "Consolidation Score",
        },
        valueQuantity: {
          value: aiFindings.pathology_scores?.consolidation ?? 0,
          unit: "%",
        },
      },
    ],
  };

  // 4. Acoustic Cough Biomarker Observation
  const coughObservationResource = {
    resourceType: "Observation",
    id: coughObservationId,
    status: "final",
    code: {
      coding: [
        {
          system: "http://loinc.org",
          code: "72170-4",
          display: "Cough frequency/severity evaluation",
        },
      ],
      text: "AeroTriage Web Audio DSP Cough Biomarkers",
    },
    subject: {
      reference: `Patient/${patientRefId}`,
    },
    effectiveDateTime: timestamp,
    component: [
      {
        code: { text: "Peak Frequency" },
        valueQuantity: {
          value: aiFindings.cough_peak_hz ?? 320,
          unit: "Hz",
          system: "http://unitsofmeasure.org",
          code: "Hz",
        },
      },
      {
        code: { text: "Cough Wetness Index" },
        valueQuantity: {
          value: aiFindings.cough_wetness_index ?? 50,
          unit: "%",
          system: "http://unitsofmeasure.org",
          code: "%",
        },
      },
    ],
  };

  // 5. Main DiagnosticReport Resource with Act 342 Statutory Extension
  const diagnosticReportResource = {
    resourceType: "DiagnosticReport",
    id: diagnosticReportId,
    extension: [
      // Statutory Malaysian Act 342 Notification Extension
      {
        url: "http://moh.gov.my/fhir/StructureDefinition/akta-342-notification",
        extension: [
          {
            url: "notificationRequired",
            valueBoolean: act342Required,
          },
          {
            url: "statutoryAct",
            valueString: "Prevention and Control of Infectious Diseases Act 1988 (Act 342)",
          },
          {
            url: "targetAuthority",
            valueString: "Pejabat Kesihatan Daerah (PKD) Unit Kawalan TB / Kusta",
          },
          {
            url: "notificationWindow",
            valueString: isHighRisk ? "Immediate (< 24 hours) for sputum positive / within 7 days" : "Not applicable",
          },
        ],
      },
      // Clinical Practice Guideline Citation Extension
      {
        url: "http://moh.gov.my/fhir/StructureDefinition/cpg-guideline-grounding",
        valueString: "CPG Management of Tuberculosis (4th Edition) & WHO Consolidated Guidelines Module 2",
      },
    ],
    status: "final",
    category: [
      {
        coding: [
          {
            system: "http://terminology.hl7.org/CodeSystem/v2-0074",
            code: "RAD",
            display: "Radiology",
          },
        ],
      },
    ],
    code: {
      coding: [
        {
          system: "http://snomed.info/sct",
          code: "56717001",
          display: "Tuberculosis",
        },
      ],
      text: "SPECTRA AI-TB & AeroTriage Dual Multimodal TB Screening Report",
    },
    subject: {
      reference: `Patient/${patientRefId}`,
    },
    effectiveDateTime: timestamp,
    issued: timestamp,
    result: [
      { reference: `Observation/${triageObservationId}` },
      { reference: `Observation/${cxrObservationId}` },
      { reference: `Observation/${coughObservationId}` },
    ],
    conclusion:
      aiFindings.radiological_impression?.join("; ") ||
      (isHighRisk
        ? "High probability of active pulmonary tuberculosis. Immediate GeneXpert MTB/RIF Ultra and Sputum AFB x2 mandated."
        : "Low suspicion of active tuberculosis. Routine follow-up."),
  };

  return {
    resourceType: "Bundle",
    id: bundleId,
    type: "collection",
    timestamp,
    entry: [
      {
        fullUrl: `urn:uuid:${patientRefId}`,
        resource: patientResource,
      },
      {
        fullUrl: `urn:uuid:${diagnosticReportId}`,
        resource: diagnosticReportResource,
      },
      {
        fullUrl: `urn:uuid:${triageObservationId}`,
        resource: triageObservationResource,
      },
      {
        fullUrl: `urn:uuid:${cxrObservationId}`,
        resource: cxrObservationResource,
      },
      {
        fullUrl: `urn:uuid:${coughObservationId}`,
        resource: coughObservationResource,
      },
    ],
  };
}
