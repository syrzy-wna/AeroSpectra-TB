/**
 * Generates high-fidelity DICOM-style simulated chest radiograph SVGs converted to base64 data-URIs.
 * Tailored to the National Strategic Plan for Lung Health Initiative Malaysia 2025-2030 (LHI).
 */

function svgToDataUrl(svgString) {
  const cleanSvg = svgString.trim().replace(/\s+/g, " ");
  const base64 = btoa(unescape(encodeURIComponent(cleanSvg)));
  return `data:image/svg+xml;base64,${base64}`;
}

export function generateSyntheticCxr(type = "normal") {
  if (typeof document !== "undefined") {
    try {
      const canvas = document.createElement("canvas");
      canvas.width = 640;
      canvas.height = 640;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        if (type === "invalid") {
          // Draw non-radiological document photo with clear signage
          ctx.fillStyle = "#1E3A8A";
          ctx.fillRect(0, 0, 640, 640);
          ctx.fillStyle = "#FFFFFF";
          ctx.fillRect(30, 30, 580, 580);
          ctx.fillStyle = "#0F7650";
          ctx.fillRect(50, 50, 540, 160);

          ctx.fillStyle = "#FFFFFF";
          ctx.font = "bold 20px sans-serif";
          ctx.textAlign = "center";
          ctx.fillText("LUNG HEALTH INITIATIVE MALAYSIA", 320, 110);
          ctx.font = "14px sans-serif";
          ctx.fillStyle = "#A7F3D0";
          ctx.fillText("KEMENTERIAN KESIHATAN MALAYSIA (2025-2030)", 320, 150);

          ctx.fillStyle = "#EF4444";
          ctx.beginPath();
          ctx.arc(320, 340, 65, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = "#FFFFFF";
          ctx.fillRect(310, 290, 20, 100);
          ctx.fillRect(270, 330, 100, 20);

          ctx.fillStyle = "#1E293B";
          ctx.font = "bold 18px sans-serif";
          ctx.fillText("NON-RADIOLOGICAL DOCUMENT PHOTO", 320, 460);
          ctx.font = "13px sans-serif";
          ctx.fillStyle = "#64748B";
          ctx.fillText("KLINIK KESIHATAN KUALA NERUS - PUSAT KESIHATAN AWAM", 320, 490);
          ctx.fillText("Safety Directive #0 Gate Validation Input", 320, 520);

          return canvas.toDataURL("image/png");
        }

        // Draw realistic PA Chest Radiograph
        // 1. Film base background
        const bgGrad = ctx.createRadialGradient(320, 300, 50, 320, 300, 400);
        bgGrad.addColorStop(0, "#10141e");
        bgGrad.addColorStop(0.7, "#06080d");
        bgGrad.addColorStop(1, "#020305");
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, 640, 640);

        // 2. Thoracic cage soft tissue contour
        ctx.save();
        ctx.fillStyle = "rgba(18, 24, 38, 0.75)";
        ctx.beginPath();
        ctx.moveTo(100, 140);
        ctx.quadraticCurveTo(320, 110, 540, 140);
        ctx.quadraticCurveTo(600, 250, 590, 520);
        ctx.quadraticCurveTo(320, 580, 50, 520);
        ctx.quadraticCurveTo(40, 250, 100, 140);
        ctx.fill();

        // 3. Bilateral Aerated Lungs
        const lungGrad = ctx.createLinearGradient(0, 140, 0, 520);
        lungGrad.addColorStop(0, "#040608");
        lungGrad.addColorStop(1, "#080c14");
        ctx.fillStyle = lungGrad;

        // Right hemithorax
        ctx.beginPath();
        ctx.moveTo(300, 140);
        ctx.quadraticCurveTo(230, 150, 160, 210);
        ctx.quadraticCurveTo(110, 270, 100, 410);
        ctx.quadraticCurveTo(90, 490, 140, 520);
        ctx.quadraticCurveTo(220, 530, 300, 500);
        ctx.closePath();
        ctx.fill();

        // Left hemithorax
        ctx.beginPath();
        ctx.moveTo(340, 140);
        ctx.quadraticCurveTo(410, 150, 480, 210);
        ctx.quadraticCurveTo(530, 270, 540, 410);
        ctx.quadraticCurveTo(550, 490, 500, 520);
        ctx.quadraticCurveTo(420, 530, 340, 500);
        ctx.closePath();
        ctx.fill();

        // 4. Mediastinal silhouette, Heart, and Spine
        ctx.fillStyle = "rgba(148, 163, 184, 0.25)";
        ctx.fillRect(305, 110, 30, 440);
        for (let i = 0; i < 11; i++) {
          ctx.fillStyle = "rgba(203, 213, 225, 0.3)";
          ctx.fillRect(308, 130 + i * 36, 24, 22);
        }

        // Trachea radiolucency & Carina
        ctx.fillStyle = "#030406";
        ctx.fillRect(314, 110, 12, 130);
        ctx.lineWidth = 6;
        ctx.strokeStyle = "#030406";
        ctx.beginPath();
        ctx.moveTo(320, 240);
        ctx.lineTo(285, 290);
        ctx.moveTo(320, 240);
        ctx.lineTo(355, 290);
        ctx.stroke();

        // Cardiac silhouette (left ventricular bulge, normal CTR ~0.45)
        ctx.fillStyle = "rgba(203, 213, 225, 0.75)";
        ctx.beginPath();
        ctx.moveTo(320, 260);
        ctx.quadraticCurveTo(350, 280, 370, 320);
        ctx.quadraticCurveTo(390, 380, 360, 470);
        ctx.quadraticCurveTo(320, 490, 240, 480);
        ctx.quadraticCurveTo(210, 420, 250, 350);
        ctx.quadraticCurveTo(290, 300, 320, 260);
        ctx.fill();

        // Aortic knob
        ctx.beginPath();
        ctx.arc(295, 260, 22, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(226, 232, 240, 0.7)";
        ctx.fill();

        // 5. Rib Cage
        ctx.lineWidth = 4.5;
        ctx.strokeStyle = "rgba(226, 232, 240, 0.35)";
        for (let r = 0; r < 9; r++) {
          const yOffset = 160 + r * 38;
          ctx.beginPath();
          ctx.moveTo(305, yOffset);
          ctx.quadraticCurveTo(200, yOffset - 15, 110, yOffset + 25);
          ctx.stroke();

          ctx.beginPath();
          ctx.moveTo(335, yOffset);
          ctx.quadraticCurveTo(440, yOffset - 15, 530, yOffset + 25);
          ctx.stroke();
        }

        // 6. Clavicles
        ctx.lineWidth = 7;
        ctx.strokeStyle = "rgba(241, 245, 249, 0.65)";
        ctx.beginPath();
        ctx.moveTo(300, 155);
        ctx.bezierCurveTo(240, 140, 180, 175, 120, 160);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(340, 155);
        ctx.bezierCurveTo(400, 140, 460, 175, 520, 160);
        ctx.stroke();

        // 7. Diaphragms & Sharp Costophrenic Sulci
        ctx.fillStyle = "rgba(226, 232, 240, 0.85)";
        ctx.beginPath();
        ctx.moveTo(95, 520);
        ctx.quadraticCurveTo(200, 460, 310, 490);
        ctx.lineTo(310, 600);
        ctx.lineTo(95, 600);
        ctx.closePath();
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(330, 495);
        ctx.quadraticCurveTo(440, 475, 545, 520);
        ctx.lineTo(545, 600);
        ctx.lineTo(330, 600);
        ctx.closePath();
        ctx.fill();

        // 8. Dynamic Pathology injection
        if (type === "moderate") {
          // Patchy consolidation in Right Upper Lobe (anatomical right = viewer's left)
          const grad = ctx.createRadialGradient(200, 210, 10, 200, 210, 75);
          grad.addColorStop(0, "rgba(241, 245, 249, 0.85)");
          grad.addColorStop(0.5, "rgba(203, 213, 225, 0.6)");
          grad.addColorStop(1, "rgba(100, 116, 139, 0)");
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(200, 210, 75, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = "rgba(248, 250, 252, 0.85)";
          for (const [nx, ny, nr] of [[180, 190, 8], [225, 220, 7], [160, 235, 6], [210, 260, 5]]) {
            ctx.beginPath();
            ctx.arc(nx, ny, nr, 0, Math.PI * 2);
            ctx.fill();
          }
        } else if (type === "severe") {
          // Large cavity in Right Upper Lobe with dense consolidation
          const grad = ctx.createRadialGradient(210, 200, 20, 210, 200, 95);
          grad.addColorStop(0, "rgba(248, 250, 252, 0.95)");
          grad.addColorStop(0.6, "rgba(203, 213, 225, 0.75)");
          grad.addColorStop(1, "rgba(51, 65, 85, 0)");
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(210, 200, 95, 0, Math.PI * 2);
          ctx.fill();

          // Thick-walled cavity: dense rim with radiolucent air center
          ctx.lineWidth = 9;
          ctx.strokeStyle = "rgba(248, 250, 252, 0.95)";
          ctx.fillStyle = "#05070a";
          ctx.beginPath();
          ctx.arc(210, 200, 36, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();

          // Horizontal air-fluid level
          ctx.fillStyle = "rgba(226, 232, 240, 0.75)";
          ctx.fillRect(180, 210, 60, 15);

          // Volume loss traction lines
          ctx.lineWidth = 2.5;
          ctx.strokeStyle = "rgba(203, 213, 225, 0.7)";
          ctx.setLineDash([4, 2]);
          ctx.beginPath();
          ctx.moveTo(210, 160);
          ctx.lineTo(240, 120);
          ctx.moveTo(180, 180);
          ctx.lineTo(150, 140);
          ctx.stroke();
          ctx.setLineDash([]);
        } else if (type === "occupational") {
          // Diffuse bilateral reticulonodular opacities
          ctx.fillStyle = "rgba(226, 232, 240, 0.65)";
          for (let i = 0; i < 35; i++) {
            const rx = 140 + (i * 37) % 130;
            const ry = 170 + (i * 29) % 190;
            ctx.beginPath();
            ctx.arc(rx, ry, 2.5 + (i % 3), 0, Math.PI * 2);
            ctx.fill();

            const lx = 360 + (i * 41) % 130;
            const ly = 170 + (i * 31) % 190;
            ctx.beginPath();
            ctx.arc(lx, ly, 2.5 + (i % 3), 0, Math.PI * 2);
            ctx.fill();
          }
        }

        // Anatomical orientation marker only (PA VIEW watermark rendered by XrayViewer only after passing gate)
        ctx.fillStyle = "rgba(148, 163, 184, 0.6)";
        ctx.font = "11px monospace";
        ctx.fillText("R", 50, 140);

        ctx.restore();

        // Deterministic grayscale DICOM-preset signature block at top-left (0,0,8,8)
        const markerVal =
          type === "normal"
            ? 11
            : type === "moderate"
            ? 12
            : type === "severe"
            ? 13
            : type === "occupational"
            ? 14
            : 0;
        if (markerVal > 0) {
          ctx.fillStyle = `rgb(${markerVal}, ${markerVal}, ${markerVal})`;
          ctx.fillRect(0, 0, 8, 8);
        }

        return canvas.toDataURL("image/png");
      }
    } catch (e) {
      console.warn("Canvas rasterization error, falling back to SVG:", e);
    }
  }

  let pathologyElements = "";
  if (type === "moderate") {
    pathologyElements = `
      <radialGradient id="infiltrateGrad" cx="68%" cy="32%" r="18%">
        <stop offset="0%" stop-color="#E2E8F0" stop-opacity="0.85"/>
        <stop offset="40%" stop-color="#CBD5E1" stop-opacity="0.65"/>
        <stop offset="75%" stop-color="#94A3B8" stop-opacity="0.3"/>
        <stop offset="100%" stop-color="#475569" stop-opacity="0"/>
      </radialGradient>
      <circle cx="580" cy="270" r="85" fill="url(#infiltrateGrad)" />
      <circle cx="540" cy="250" r="14" fill="#F1F5F9" opacity="0.85" filter="blur(2px)" />
      <circle cx="565" cy="280" r="11" fill="#F8FAFC" opacity="0.8" filter="blur(2px)" />
      <circle cx="610" cy="260" r="16" fill="#F1F5F9" opacity="0.9" filter="blur(3px)" />
    `;
  } else if (type === "severe") {
    pathologyElements = `
      <radialGradient id="consolidationGrad" cx="70%" cy="30%" r="22%">
        <stop offset="0%" stop-color="#F8FAFC" stop-opacity="0.95"/>
        <stop offset="50%" stop-color="#CBD5E1" stop-opacity="0.75"/>
        <stop offset="85%" stop-color="#64748B" stop-opacity="0.3"/>
        <stop offset="100%" stop-color="#334155" stop-opacity="0"/>
      </radialGradient>
      <circle cx="600" cy="260" r="110" fill="url(#consolidationGrad)" />
      <circle cx="600" cy="260" r="46" fill="#0A0C10" stroke="#F1F5F9" stroke-width="12" filter="blur(1px)" />
      <path d="M 565 272 Q 600 274 635 272 L 635 285 Q 600 290 565 285 Z" fill="#E2E8F0" opacity="0.75" />
    `;
  } else if (type === "occupational") {
    pathologyElements = `
      <g opacity="0.8" filter="blur(1.5px)">
        <circle cx="340" cy="280" r="9" fill="#E2E8F0" />
        <circle cx="370" cy="310" r="8" fill="#F1F5F9" />
        <circle cx="580" cy="270" r="11" fill="#E2E8F0" />
        <circle cx="610" cy="300" r="9" fill="#F1F5F9" />
      </g>
    `;
  } else if (type === "invalid") {
    const invalidSvg = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800" width="800" height="800">
        <rect width="800" height="800" fill="#1E3A8A" />
        <rect x="40" y="40" width="720" height="720" rx="16" fill="#FFFFFF" />
        <rect x="80" y="80" width="640" height="240" rx="8" fill="#0F7650" />
        <text x="400" y="170" font-family="sans-serif" font-size="30" font-weight="bold" fill="#FFFFFF" text-anchor="middle">LUNG HEALTH INITIATIVE MALAYSIA</text>
        <text x="400" y="590" font-family="sans-serif" font-size="22" font-weight="bold" fill="#1E293B" text-anchor="middle">NON-RADIOLOGICAL DOCUMENT PHOTO</text>
        <text x="400" y="625" font-family="sans-serif" font-size="16" fill="#64748B" text-anchor="middle">Safety Directive #0 Gate Validation Test Input</text>
      </svg>
    `;
    return svgToDataUrl(invalidSvg);
  }

  const cxrSvg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 900" width="900" height="900">
      <defs>
        <radialGradient id="cxrGlow" cx="50%" cy="45%" r="60%">
          <stop offset="0%" stop-color="#141824"/>
          <stop offset="100%" stop-color="#020305"/>
        </radialGradient>
      </defs>
      <rect width="900" height="900" fill="url(#cxrGlow)" />
      <path d="M 420 180 Q 320 190 240 250 Q 170 320 160 480 Q 150 630 190 730 Q 300 750 420 720 Z" fill="#05070A" stroke="#334155" stroke-width="1.5" />
      <path d="M 480 180 Q 580 190 660 250 Q 730 320 740 480 Q 750 630 710 730 Q 600 760 480 720 Z" fill="#05070A" stroke="#334155" stroke-width="1.5" />
      <text x="80" y="140" font-family="monospace" font-size="32" font-weight="bold" fill="#E2E8F0" opacity="0.8">R</text>
      ${pathologyElements}
    </svg>
  `;
  return svgToDataUrl(cxrSvg);
}

export const DEMO_SCENARIOS = [
  {
    id: "scenario-normal",
    title: "Scenario A: NHSI Community Screening (Normal)",
    titleBm: "Senario A: Saringan Komuniti NHSI (Normal Keyakinan Tinggi)",
    patient_category: "Screening",
    smoking_status: "Non-Smoker",
    age: 28,
    gender: "Perempuan",
    type: "normal",
    description: "Young female, routine National Health Screening Initiative (NHSI). Lungs completely clear, sharp angles, no lesion.",
    descriptionBm: "Wanita muda melalui Inisiatif Saringan Kesihatan Kebangsaan (NHSI). Medan paru-paru jelas sepenuhnya, Tier 1 pelepasan saringan.",
    lhiPillar: "Pillar 1: Early Detection & NHSI Integration",
    expectedScore: 6,
    expectedSeverity: "NO_LESION",
    expectedResult: {
      is_valid_radiograph: true,
      invalid_reason: null,
      en: {
        radiological_findings: [
          "Bilateral lung parenchyma well-expanded and completely clear of active infiltrates.",
          "Cardiothoracic ratio within normal limits (< 0.50) with sharp bilateral costophrenic recesses.",
          "Trachea is midline with normal hilar bronchovascular arborization.",
        ],
        impression: [
          "Normal chest radiograph with high diagnostic confidence under LHI primary care protocol.",
          "No radiological evidence of active or prior pulmonary tuberculosis or chronic airway distortion.",
        ],
        recommendation: [
          "Reassure patient; routine NHSI health screening interval according to MOH guidelines.",
          "Continue primordial prevention under National Lung Health Initiative.",
        ],
      },
      bm: {
        penemuan_radiologi: [
          "Parenkima paru-paru kedua-dua belah mengembang baik dan jelas tanpa sebarang infiltrat aktif.",
          "Nisbah kardiotorasik dalam had normal (< 0.50) dengan sudut kostofrenik yang tajam.",
          "Trakea berada di garisan tengah dengan corak vaskular hilum yang normal.",
        ],
        impresi: [
          "X-ray dada normal dengan tahap keyakinan diagnostik tinggi di bawah protokol LHI penjagaan primer.",
          "Tiada bukti radiologi penyakit tuberkulosis aktif atau gangguan saluran pernafasan kronik.",
        ],
        cadangan: [
          "Beri keyakinan kepada pesakit; jadual saringan rutin NHSI mengikut garis panduan KKM.",
          "Teruskan langkah pencegahan primordial di bawah Pelan Strategik Kesihatan Paru-paru Kebangsaan.",
        ],
      },
      severity: "NO_LESION",
      tb_score: 6,
      pathology_scores: { cavitation: 0, consolidation: 3, fibrosis: 4, effusion: 0, nodules: 2 },
      is_high_confidence_normal: true,
      incidental_findings: [],
      annotations: [],
    },
  },
  {
    id: "scenario-moderate",
    title: "Scenario B: Close Contact Tracing (LHI Tier 3 GeneXpert)",
    titleBm: "Senario B: Kontak Rapat TB (Tier 3 GeneXpert MTB/RIF)",
    patient_category: "Contact",
    smoking_status: "Ex-Smoker",
    age: 44,
    gender: "Lelaki",
    type: "moderate",
    description: "Close contact of index smear-positive TB case. Right apical patchy consolidation and nodular spread.",
    descriptionBm: "Kontak rapat kes indeks TB positif calitan. Konsolidasi bertompok apeks kanan, memerlukan ujian pantas Tier 3 GeneXpert.",
    lhiPillar: "Pillar 2: Clinical Management & Contact Tracing",
    expectedScore: 74,
    expectedSeverity: "MODERATE",
    expectedResult: {
      is_valid_radiograph: true,
      invalid_reason: null,
      en: {
        radiological_findings: [
          "Confluent patchy alveolar consolidation within the apical and posterior segments of the right upper lobe.",
          "Associated ill-defined nodular opacities extending towards the right mid-zone reflecting early broncho-alveolar spread.",
          "Cardiac size normal; left lung clear.",
        ],
        impression: [
          "Active right upper lobe parenchymal tuberculosis in a documented close contact.",
        ],
        recommendation: [
          "Stat LHI Tier 3 molecular assay: GeneXpert MTB/RIF cartridge test to detect M. tuberculosis & rifampicin resistance.",
          "Collect 2 direct sputum smears for Acid-Fast Bacilli (AFB) examination.",
          "Register family contact tracing through Pejabat Kesihatan Daerah (PKD) under Act 342.",
        ],
      },
      bm: {
        penemuan_radiologi: [
          "Konsolidasi alveolar bertompok di segmen apikal dan posterior lobus atas paru-paru kanan.",
          "Kelegapan nodular tidak bersempadan jelas merebak ke zon tengah kanan menunjukkan penularan bronko-alveolar.",
          "Saiz jantung normal; paru-paru kiri jelas.",
        ],
        impresi: [
          "Tuberkulosis parenkima aktif di lobus atas paru-paru kanan pada kontak rapat kes disahkan.",
        ],
        cadangan: [
          "Lakukan ujian molekular LHI Tier 3: GeneXpert MTB/RIF dengan segera bagi mengesan kuman TB & kerintangan rifampisin.",
          "Ambil 2 sampel kahak untuk calitan kuman tahan asid (AFB).",
          "Daftar pengesanan kontak keluarga melalui Pejabat Kesihatan Daerah (PKD) di bawah Akta 342.",
        ],
      },
      severity: "MODERATE",
      tb_score: 74,
      pathology_scores: { cavitation: 15, consolidation: 82, fibrosis: 45, effusion: 10, nodules: 68 },
      is_high_confidence_normal: false,
      incidental_findings: ["Mild thoracic scoliosis convexity to right"],
      annotations: [
        { label: "RUL Consolidation & Infiltrates", box_2d: [180, 500, 420, 780] },
      ],
    },
  },
  {
    id: "scenario-severe",
    title: "Scenario C: Advanced Cavitary TB (OTA Fast-Track Referral)",
    titleBm: "Senario C: TB Kavitasi Teruk (Laluan Pantas Program OTA)",
    patient_category: "Patient",
    smoking_status: "Current Smoker",
    age: 58,
    gender: "Lelaki",
    type: "severe",
    description: "Symptomatic chronic cough with hemoptysis. 4.6cm thick-walled cavity in right apex; immediate On-Time Access (OTA) enrollment.",
    descriptionBm: "Pesakit batuk kronik berdarah & berpeluh malam. Kavitasi berdinding tebal 4.6cm di apeks kanan; kemasukan segera Program OTA.",
    lhiPillar: "Chapter 4: On-Time Access Program (OTA) & Hospital Referral",
    expectedScore: 94,
    expectedSeverity: "SEVERE",
    expectedResult: {
      is_valid_radiograph: true,
      invalid_reason: null,
      en: {
        radiological_findings: [
          "Large, thick-walled cavity measuring approximately 4.6 cm in the right apical-posterior region with an internal air-fluid level.",
          "Dense surrounding confluent consolidation with upper lobe volume contraction and ipsilateral tracheal pull.",
          "Endobronchial acinar tree-in-bud nodular opacities throughout right mid and lower zones.",
        ],
        impression: [
          "Advanced cavitary pulmonary tuberculosis with high bacillary burden and extensive bronchogenic dissemination.",
        ],
        recommendation: [
          "IMMEDIATE RESPIRATORY AIRBORNE ISOLATION (N95 precautions).",
          "Enroll patient into On-Time Access Program (OTA) using Patient Financial Eligibility Tool (PFET) for rapid therapy access.",
          "Statutory infectious disease notification to Pejabat Kesihatan Daerah under Act 342 within 24 hours.",
          "Stat GeneXpert MTB/RIF + initiate standard 4-drug DOTS therapy (EHRZ) under supervision.",
          "Refer to Specialist Hospital (e.g. HRPZ II / HKL / HTAR) for thoracic assessment.",
        ],
      },
      bm: {
        penemuan_radiologi: [
          "Kavitasi besar berdinding tebal berukuran kira-kira 4.6 cm di kawasan apikal-posterior kanan dengan paras cecair-udara.",
          "Konsolidasi padat di sekeliling dengan pengecutan isipadu lobus atas kanan dan tarikan trakea ke arah lesi.",
          "Kelegapan nodular 'tree-in-bud' bertaburan di zon tengah dan bawah kanan.",
        ],
        impresi: [
          "Tuberkulosis pulmonari kavitasi lanjutan dengan beban bakteria tinggi dan penularan bronkogenik meluas.",
        ],
        cadangan: [
          "PENGASINGAN PERNAFASAN UDARA SERTA-MERTA (Langkah pencegahan N95).",
          "Daftar pesakit ke dalam Program On-Time Access (OTA) melalui instrumen PFET untuk akses rawatan pantas tanpa halangan kewangan.",
          "Notifikasi statutori ke Pejabat Kesihatan Daerah (PKD) di bawah Akta 342 dalam tempoh 24 jam.",
          "Ujian segera GeneXpert MTB/RIF + mulakan terapi 4-ubat DOTS (EHRZ) di bawah penyeliaan.",
          "Rujukan ke Hospital Pakar Respiratori (cth. HRPZ II / HKL / HTAR) untuk penilaian lanjut.",
        ],
      },
      severity: "SEVERE",
      tb_score: 94,
      pathology_scores: { cavitation: 96, consolidation: 91, fibrosis: 82, effusion: 28, nodules: 79 },
      is_high_confidence_normal: false,
      incidental_findings: ["Right apical pleural thickening", "Right hilar elevation"],
      annotations: [
        { label: "Thick-Walled Cavity & Consolidation", box_2d: [150, 480, 420, 810] },
      ],
    },
  },
  {
    id: "scenario-occupational",
    title: "Scenario D: High-Risk Workplace / Silica Exposure (LHI Pillar)",
    titleBm: "Senario D: Saringan Tempat Kerja / Habuk Silika & Asbestos",
    patient_category: "Occupational",
    smoking_status: "E-Cigarette/Vape",
    age: 49,
    gender: "Lelaki",
    type: "occupational",
    description: "Quarry and construction worker with 15 years silica exposure. Bilateral reticulonodular opacities, screening under LHI workplace program.",
    descriptionBm: "Pekerja kuari & pembinaan dengan pendedahan silika 15 tahun. Kelegapan retikulonodular bilateral di bawah Pilar Tempat Kerja LHI.",
    lhiPillar: "LHI Workplace Health Risk Reduction (OSH & Act 852)",
    expectedScore: 52,
    expectedSeverity: "MINIMAL",
    expectedResult: {
      is_valid_radiograph: true,
      invalid_reason: null,
      en: {
        radiological_findings: [
          "Bilateral symmetric reticulonodular opacities predominantly in the upper lung zones.",
          "Subtle hilar lymph node prominent calcification (eggshell appearance).",
          "No focal cavitation or acute confluent consolidation.",
        ],
        impression: [
          "Chronic occupational pneumoconiosis (consistent with silicosis exposure) with indeterminate score for concomitant early TB.",
        ],
        recommendation: [
          "Perform Tier 1 Functional Spirometry to evaluate restrictive lung defect.",
          "Order Low-Dose CT (LDCT) to rule out concomitant early-stage lung malignancy (LHI downstaging protocol).",
          "Conduct sputum GeneXpert to exclude active silicotuberculosis.",
          "Notify Occupational Safety & Health (DOSH/JKKP) and refer to Workplace Health Program.",
        ],
      },
      bm: {
        penemuan_radiologi: [
          "Kelegapan retikulonodular simetri pada zon atas kedua-dua belah paru-paru.",
          "Kalsifikasi nodus limfa hilum yang ketara ('eggshell calcification').",
          "Tiada kavitasi fokal atau konsolidasi padat akut.",
        ],
        impresi: [
          "Pneumokoniosis pekerjaan kronik (konsisten dengan pendedahan silika) dengan risiko silikotuberkulosis.",
        ],
        cadangan: [
          "Lakukan ujian spirometri Tier 1 untuk menilai kecacatan fungsi paru-paru restriktif.",
          "Rujuk imbasan Low-Dose CT (LDCT) bagi menolak kemungkinan kanser peringkat awal (protokol downstaging LHI).",
          "Lakukan GeneXpert kahak untuk menolak siliko-tuberkulosis aktif.",
          "Notifikasi Keselamatan & Kesihatan Pekerjaan (DOSH/JKKP) di bawah program kesihatan tempat kerja LHI.",
        ],
      },
      severity: "MINIMAL",
      tb_score: 52,
      pathology_scores: { cavitation: 0, consolidation: 22, fibrosis: 65, effusion: 0, nodules: 58 },
      is_high_confidence_normal: false,
      incidental_findings: ["Bilateral hilar lymphadenopathy with peripheral rim calcification"],
      annotations: [
        { label: "Bilateral Reticulonodular Opacities", box_2d: [240, 280, 480, 720] },
      ],
    },
  },
  {
    id: "scenario-invalid",
    title: "Scenario E: Non-CXR Input (Safety Directive #0 Gate)",
    titleBm: "Senario E: Gambar Bukan X-Ray (Ujian Pintu Keselamatan #0)",
    patient_category: "Screening",
    smoking_status: "Non-Smoker",
    age: 35,
    gender: "Lelaki",
    type: "invalid",
    description: "User submitted a photograph of a document/signage. Safety Gate Directive #0 triggers immediate safety-lock.",
    descriptionBm: "Pengguna memuat naik foto dokumen papan tanda. Pintu Keselamatan Arahan #0 mengunci pemarkahan serta-merta.",
    lhiPillar: "MaHTAS Clinical Safety Directive #0 (Invariant Rule)",
    expectedScore: 0,
    expectedSeverity: "NO_LESION",
    expectedResult: {
      status: "REJECTED",
      error_code: "INVALID_IMAGE_TYPE",
      message: "Image rejected: not a chest radiograph. Please upload a valid chest X-ray (PA/AP view).",
      is_valid_radiograph: false,
      invalid_reason: {
        en: "Image rejected: not a chest radiograph. Please upload a valid chest X-ray (PA/AP view).",
        bm: "RALAT PENGESAHAN IMEJ: Imej yang dimuat naik bukan radiograf dada (Chest X-Ray). Sistem ini hanya memproses imej X-ray dada perubatan yang sah untuk saringan TB. Sila muat naik fail DICOM atau imej X-ray yang betul.",
      },
      en: {
        radiological_findings: [],
        impression: ["Image rejected by safety validation: Not an authentic medical chest radiograph."],
        recommendation: ["Please capture or upload an authentic digital PA chest radiograph."],
      },
      bm: {
        penemuan_radiologi: [],
        impresi: ["Imej ditolak oleh pengesahan keselamatan: Bukan radiograf dada perubatan yang sah."],
        cadangan: ["Sila muat naik fail DICOM atau imej X-ray dada yang betul."],
      },
      severity: "NO_LESION",
      tb_score: 0,
      pathology_scores: { cavitation: 0, consolidation: 0, fibrosis: 0, effusion: 0, nodules: 0 },
      is_high_confidence_normal: false,
      incidental_findings: [],
      annotations: [],
    },
  },
];
