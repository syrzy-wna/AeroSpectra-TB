# 🩺 SPECTRA AI-TB & AeroTriage TB
### AI-Powered Computer-Aided Detection (CAD) & Clinical Decision Support System for Tuberculosis Screening
**Compliant with Ministry of Health Malaysia (MOH / KKM), Pejabat Kesihatan Daerah Kuala Nerus (PKDKN) & WHO Tuberculosis Guidelines**

[![MOH Malaysia](https://img.shields.io/badge/MOH%20Malaysia-KKM%20CPG%20Grounded-emerald)](https://i.imgur.com/XKWCWds.png)
[![PKDKN](https://img.shields.io/badge/PKDKN-Unit%20TB%20%2F%20Kusta-blue)](https://i.imgur.com/ptwRs1Q.png)
[![Firebase](https://img.shields.io/badge/Firebase-Firestore%20Live-orange)](https://firebase.google.com/)
[![Gemini AI](https://img.shields.io/badge/Gemini-3.8%20Flash%20Multimodal-purple)](https://ai.google.dev/)
[![Compliance](https://img.shields.io/badge/Compliance-Act%20342%20%7C%20WHO%20Module%202-red)](#-statutory-reporting--guidelines-act-342--dots)

---

## 📌 Executive Summary & Medical Objectives

**SPECTRA AI-TB** is a hospital-grade Computer-Aided Detection (CAD) and Clinical Decision Support System (CDSS) specifically engineered to assist Medical Officers (MO) within the Ministry of Health Malaysia (MOH / KKM) and district-level health authorities such as Pejabat Kesihatan Daerah Kuala Nerus (PKDKN).

The system is rigorously grounded in official clinical authorities:
1. **Malaysian Clinical Practice Guidelines (CPG) on the Management of Tuberculosis (4th Edition)**.
2. **WHO Consolidated Guidelines on Tuberculosis (Module 2: Screening and Computer-Aided Detection)**.
3. **Prevention and Control of Infectious Diseases Act 1988 (Act 342)**.

The software encompasses dual diagnostic triage channels:
* **Chest Radiograph (CXR) CAD Vision Engine:** Evaluates standard PA/AP chest radiographs, quantifies 5 cardinal TB pathological signs, renders 2D anatomical bounding boxes, computes CAD severity scores (0–100), and enforces strict anti-hallucination image verification.
* **AeroTriage TB (Acoustic Cough Biomarker Pipeline):** Real-time Web Audio API Digital Signal Processing (DSP) engine extracting clinical acoustic cough biomarkers (RMS Energy, Peak Frequency, Spectral Centroid, ZCR, SNR, and Cough Burst Count).

---

## 🏛️ Institutional Partners & Official Logos

| Logo | Institution | Clinical Role & Responsibility |
| :---: | :--- | :--- |
| <img src="https://i.imgur.com/XKWCWds.png" width="85" alt="KKM" /> | **Ministry of Health Malaysia (KKM)** | Federal healthcare authority; custodian of National TB Clinical Practice Guidelines (CPG) and MaHTAS assessment standards. |
| <img src="https://i.imgur.com/ptwRs1Q.png" width="85" alt="PKDKN" /> | **Pejabat Kesihatan Daerah Kuala Nerus (PKDKN)** | Operational district health office for pilot community screening, contact tracing, and District TB/Leprosy control units. |
| <img src="https://i.imgur.com/9YIhQAi.png" width="85" alt="SPECTRA" /> | **SPECTRA AI-TB CAD Engine** | Multimodal clinical AI detection engine providing structured diagnostic outputs, severity triage, and decision support. |

---

## 📖 How to Use the System & Clinical Workflow

The application includes an interactive user and clinical guide accessible via the `/guide` and `/how-to-use` routes, as well as quick triggers in the top Navbar and New Screening interface:

```
[1. Patient Demographics & Risk Tier] ──> [2. Upload PA Chest Radiograph / Demo Preset]
                     │
                     ▼
[3. Safety Directive #0 Image Gate] ──> (Non-Radiograph) ──> [Instant Rejection: INVALID_IMAGE_TYPE]
                     │
                     ▼ (Valid Chest Radiograph)
[4. Multimodal CAD Inference] ──> 5 Pathological Axes + CAD Score (0-100) + 2D Bounding Boxes
                     │
                     ▼
[5. MOH CPG Action Plan] ──> Mandatory GeneXpert & AFB x2 + Act 342 Notification + Official PDF
```

### The 5 Standard Operating Procedure (SOP) Steps:

1. **Step 1: Patient Demographics & Risk Tier Profiling**
   - Select patient risk tier (*Close Contact*, *HIV / Immunocompromised*, *Diabetes Mellitus*, *Elderly*, *Heavy Smoker*, or *Incarcerated/Institutionalized*).
   - Input age and biological sex to calibrate thoracic volume baselines and cardiothoracic ratios.
2. **Step 2: Upload Posteroanterior (PA) Chest Radiograph**
   - Upload DICOM, PNG, JPEG, or WebP chest X-ray images.
   - Presenter shortcut: Use the *Quick Scenario Picker* to instantly inspect calibrated clinical cases (Right Apical Cavity, Moderate Consolidation, High-Confidence Normal, or Non-X-ray Rejection).
3. **Step 3: Safety Directive #0 Gate & CAD Vision Analysis**
   - Click "Analyze Radiograph". The safety discriminator validates the image format prior to running clinical inferences.
   - Gemini 3.8 Flash Multimodal engine segments lung fields and quantifies pathological lesions.
4. **Step 4: Review Radiological Findings & MOH CPG Grounding**
   - Review CAD severity score (0–100), visual lesion bounding boxes, and specific chapter and page citations from MOH CPG and WHO guidelines.
5. **Step 5: Clinical Action Plan, Act 342 Notification & PDF Report**
   - Order rapid molecular GeneXpert MTB/RIF and direct Sputum AFB Smears x2 for cases with cavitation or consolidation.
   - Initiate statutory notification under Act 342 to the District Health Office.
   - Generate and print the official MOH/PKDKN report for Medical Officer verification stamp and signature.

---

## 🛡️ Safety Directive #0: Mandatory Input Image Verification

To safeguard clinical decision-making and prevent artificial intelligence hallucinations:
1. **Verification Gate:** The file MUST be an authentic PA or AP chest radiograph in valid grayscale format.
2. **Immediate Rejection:** Any non-radiological image (crowd scenes, exhibition booths, personal selfies, infographics, posters, text documents, or screenshots) is rejected immediately without generating simulated anatomical findings or CAD scores.
3. **Standardized Rejection Payload:**
   ```json
   {
     "status": "REJECTED",
     "error_code": "INVALID_IMAGE_TYPE",
     "message": "RALAT PENGESAHAN IMEJ: Imej yang dimuat naik bukan radiograf dada (Chest X-Ray). Sistem ini hanya memproses imej X-ray dada perubatan yang sah untuk saringan TB. Sila muat naik fail DICOM atau imej X-ray yang betul."
   }
   ```

---

## 🔬 Clinical CAD Specifications (5 Cardinal Pathological Axes)

* **Cavitation:** Thick-walled parenchymal lucencies with or without air-fluid levels.
* **Consolidation:** Confluent alveolar airspace opacification with air bronchograms.
* **Nodules / Granulomas:** Clustered micronodular opacities or "tree-in-bud" endobronchial spread.
* **Fibrotic Opacities:** Linear scarring, architectural distortion, and apical volume loss.
* **Pleural Effusion:** Costophrenic sulcus blunting or pleural fluid collection.

### Severity Stratification:
* `NO_LESION` (Score < 25): High-confidence normal; safe for community discharge and radiologist workload offloading.
* `MINIMAL` (Score 25–49): Localized subtle opacities; scheduled interval repeat screening.
* `MODERATE` (Score 50–74): Active upper lobe consolidation; rapid molecular diagnostics required.
* `SEVERE` (Score ≥ 75): Extensive cavitary disease; mandatory immediate airborne isolation (N95).

---

## ☁️ Google Cloud Firebase Firestore Architecture

The platform utilizes Google Cloud Firebase Firestore for reliable multi-device cloud synchronization across clinics and mobile screening vans:

* **Cloud Project ID:** `gen-lang-client-0038105363`
* **Region:** `us-west1`
* **Database ID:** `ai-studio-app-9e7bb8ae-469f-4419-a0fc-6e2793b6537a`
* **Blueprint Schema:** `firebase-blueprint.json` (Collection `/screenings/{screeningId}`)
* **Hardened Security Rules (`firestore.rules`):**
  - Zero-Trust Attribute-Based Access Control (ABAC).
  - Schema integrity checks via `isValidScreening(data)` and ID safety via `isValidId(id)`.
  - Deployed directly to cloud production via `DeployRules`.

---

## 🖨️ Official Printable Medical Report Format

High-fidelity PDF export engineered for clinical sign-off:
* **Official Letterhead:** Features high-resolution KKM, PKDKN, and SPECTRA logos with `CONFIDENTIAL // SULIT` classification.
* **Patient Demographics Strip:** Displays Patient ID, Age, Gender, Screening Tier, and CAD Status.
* **Pathology Visualizer:** 5-axis pathological score breakdown.
* **CPG-Grounded Clinical Action Plan:** Actionable steps with exact document citations.
* **Medical Officer Sign-off:** Signature line, official stamp box, and verification timestamp.

---

## 🚀 Installation & Developer Quickstart

```bash
# 1. Clone repository & install dependencies
npm install

# 2. Configure environment variables in .env
cp .env.example .env
# Set GEMINI_API_KEY=AIzaSy...

# 3. Start development server (Port 3000)
npm run dev

# 4. Verify code validity
npm run lint

# 5. Build for production deployment
npm run build
npm run start
```

---

## 👥 Acknowledgments & Copyright
* **Ministry of Health Malaysia (KKM)**
* **Pejabat Kesihatan Daerah Kuala Nerus (PKDKN)**
* **SPECTRA AI-TB Clinical & AI Engineering Architecture Team**
* Public Health Statutes: Act 342, MaHTAS CPG Tuberculosis, WHO Target Product Profiles.
