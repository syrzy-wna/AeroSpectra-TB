# 🩺 SPECTRA AI-TB & AeroTriage TB
### Sistem Saringan Radiologi CAD & Triaj Akustik Tuberkulosis Berasaskan AI (KKM · PKDKN · WHO)
**AI-Powered Computer-Aided Detection (CAD) & Clinical Decision Support System for Tuberculosis Screening**

[![MOH Malaysia](https://img.shields.io/badge/MOH%20Malaysia-KKM%20CPG%20Grounded-emerald)](https://i.imgur.com/XKWCWds.png)
[![PKDKN](https://img.shields.io/badge/PKDKN-Unit%20TB%20%2F%20Kusta-blue)](https://i.imgur.com/ptwRs1Q.png)
[![Firebase](https://img.shields.io/badge/Firebase-Firestore%20Live-orange)](https://firebase.google.com/)
[![Gemini AI](https://img.shields.io/badge/Gemini-3.8%20Flash%20Multimodal-purple)](https://ai.google.dev/)
[![Compliance](https://img.shields.io/badge/Compliance-Akta%20342%20%7C%20WHO%20Module%202-red)](#-pematuhan-statutori--garis-panduan-akta-342--who)

---

## 🌐 Pilih Bahasa / Select Language
* 🇲🇾 **[Versi Bahasa Melayu](#-versi-bahasa-melayu)**
* 🇬🇧 **[English Version](#-english-version)**

---

<a name="-versi-bahasa-melayu"></a>
# 🇲🇾 VERSI BAHASA MELAYU

## 📌 Ringkasan Eksekutif & Objektif Sistem

**SPECTRA AI-TB** ialah perisian peranti perubatan Computer-Aided Detection (CAD) dan Sistem Sokongan Keputusan Klinikal (Clinical Decision Support System - CDSS) bertaraf hospital yang dibangunkan khusus untuk menyokong Pegawai Perubatan (MO) di Kementerian Kesihatan Malaysia (KKM) serta fasiliti kesihatan daerah seperti Pejabat Kesihatan Daerah Kuala Nerus (PKDKN).

Sistem ini berlandaskan piawaian klinikal rasmi:
1. **Garis Panduan Amalan Klinikal (CPG) Pengurusan Tuberkulosis KKM (Edisi Ke-4)**.
2. **WHO Consolidated Guidelines on Tuberculosis (Module 2: Screening and Computer-Aided Detection)**.
3. **Akta Pencegahan dan Pengawalan Penyakit Berjangkit 1988 (Akta 342)**.

Aplikasi ini menggabungkan dua saluran diagnostik termaju:
* **CAD Penglihatan Radiologi Dada (CXR):** Menganalisis imej X-ray dada (pandangan PA/AP) untuk mengesan 5 paksi patologi TB utama, memetakan kotak sempadan anotasi 2D, menjana skor keterukan (0–100), dan menguatkuasakan penapis keselamatan anti-halusinasi.
* **AeroTriage TB (Biomarker Akustik Batuk):** Saluran pemprosesan isyarat digital (DSP) Web Audio API untuk mengekstrak ciri-ciri akustik batuk masa nyata (RMS, Frekuensi Puncak, Spectral Centroid, ZCR, SNR, dan bilangan letupan batuk).

---

## 🏛️ Rakan Kerjasama Institusi & Logo Rasmi

| Logo | Institusi | Peranan & Tanggungjawab Klinikal |
| :---: | :--- | :--- |
| <img src="https://i.imgur.com/XKWCWds.png" width="85" alt="KKM" /> | **Kementerian Kesihatan Malaysia (KKM)** | Pihak berkuasa kesihatan persekutuan; penyedia Garis Panduan Amalan Klinikal (CPG) Pengurusan Tuberkulosis & penanda aras penilaian teknologi kesihatan MaHTAS. |
| <img src="https://i.imgur.com/ptwRs1Q.png" width="85" alt="PKDKN" /> | **Pejabat Kesihatan Daerah Kuala Nerus (PKDKN)** | Pusat operasi rintis saringan komuniti, saringan kontak rapat, klinik respiratori, dan unit kawalan TB/Kusta peringkat daerah. |
| <img src="https://i.imgur.com/9YIhQAi.png" width="85" alt="SPECTRA" /> | **SPECTRA AI-TB CAD Engine** | Enjin kecerdasan buatan multimodal berketepatan tinggi untuk sokongan saringan, triaj risiko, dan penjanaan laporan diagnostik berstruktur. |

---

## 📖 Panduan Penggunaan Sistem (How to Use) & Aliran Kerja Klinikal

Aplikasi ini kini dilengkapi modul panduan penggunaan interaktif yang boleh diakses melalui laluan `/guide` atau `/how-to-use`, serta butang pantas pada Navbar dan Halaman Saringan:

```
[1. Daftar Demografi Pesakit] ──> [2. Muat Naik Radiograf Dada / Pilih Senario]
                 │
                 ▼
[3. Pengesahan Keselamatan #0] ──> (Jika Bukan CXR) ──> [Penolakan Serta-Merta: INVALID_IMAGE_TYPE]
                 │
                 ▼ (Jika Sah CXR)
[4. Inferens CAD Multimodal] ──> 5 Paksi Patologi + Skor CAD + Kotak Anotasi 2D
                 │
                 ▼
[5. Pelan Tindakan CPG KKM] ──> Mandatori GeneXpert & AFB x2 + Notifikasi Akta 342 + Laporan PDF
```

### 5 Langkah Standard Operasi Piawai (SOP):

1. **Langkah 1: Pendaftaran Demografi & Kategori Risiko Pesakit**
   - Pilih kategori risiko (contoh: *Kontak Rapat*, *HIV / Immunocompromised*, *Diabetes Mellitus*, *Warga Emas*, *Perokok Tegar*, atau *Banduan/Institusi*).
   - Masukkan umur dan jantina pesakit bagi penyesuaian volum paru-paru dan nisbah kardiotorasik.
2. **Langkah 2: Muat Naik Radiograf Dada (PA/AP Chest X-Ray)**
   - Muat naik fail imej X-ray dada dalam format DICOM, PNG, JPEG, atau WebP.
   - Pilihan pantas: Gunakan *Quick Scenario Picker* untuk menguji senario siap konfigura (Kavitasi Kanan, Konsolidasi Sederhana, Normal, atau Penolakan Imej Bukan X-ray).
3. **Langkah 3: Pengesahan Keselamatan #0 & Analisis CAD**
   - Tekan "Jana Analisis Radiograf". Sistem mengesahkan ketulenan radiograf dada sebelum inferens bermula.
   - Enjin Gemini 3.8 Flash Multimodal mengekstrak ciri parenkima dan lesi apikal.
4. **Langkah 4: Semak Dapatan Radiologi & Sitasi CPG KKM**
   - Semak skor keterukan CAD (0–100), visualisasi lesi pada X-ray, dan sitasi CPG KKM (Bab 3 & 4) serta WHO TPP.
5. **Langkah 5: Pelan Tindakan Klinikal, Notifikasi Akta 342 & Laporan PDF**
   - Jalankan tindakan klinikal yang disyorkan (GeneXpert MTB/RIF dan Sputum AFB Smear x2).
   - Buat notifikasi statutori ke PKD di bawah Akta 342.
   - Jana dan cetak Laporan Rasmi KKM/PKDKN untuk pengesahan cop dan tandatangan Pegawai Perubatan.

---

## 🛡️ Arahan Keselamatan #0: Pengesahan Input Imej Mutlak (Safety Directive #0)

Sebagai jaminan keselamatan pesakit dan pencegahan halusinasi perubatan:
1. **Pengesahan Jenis Imej:** Imej WAJIB merupakan radiograf dada perubatan sebenar dalam format radiologi standard.
2. **Kriteria Penolakan:** Sebarang gambar bukan radiograf dada (gambar orang ramai, reruai majlis, swafoto, ilustrasi grafik, poster kempen, tangkapan skrin teks, atau dokumen bertulis) ditolak serta-merta tanpa menjana sebarang bacaan patologi atau skor CAD palsu.
3. **Struktur Respons Ralat Piawai:**
   ```json
   {
     "status": "REJECTED",
     "error_code": "INVALID_IMAGE_TYPE",
     "message": "RALAT PENGESAHAN IMEJ: Imej yang dimuat naik bukan radiograf dada (Chest X-Ray). Sistem ini hanya memproses imej X-ray dada perubatan yang sah untuk saringan TB. Sila muat naik fail DICOM atau imej X-ray yang betul."
   }
   ```

---

## 🔬 Spesifikasi Klinikal CAD (5 Paksi Patologi TB)

* **Kavitasi (Cavitation):** Lesi berongga berdinding tebal di zon apikal/posterior lobus atas.
* **Konsolidasi (Consolidation):** Kelegapan ruang alveolar fokal dengan tanda bronkogram udara.
* **Nodul / Granuloma (Nodules):** Kelegapan asinar bertabur atau corak endobronkial *tree-in-bud*.
* **Fibrosis (Fibrotic Opacities):** Jalur fibrosis, penarikan hilum, dan kehilangan isipadu lobus.
* **Efusi Pleura (Pleural Effusion):** Kelegapan cecair sudut kostofrenik atau hemitoraks.

### Stratifikasi Keterukan (Severity Triage):
* `NO_LESION` (Skor < 25): Normal keyakinan tinggi; mengurangkan beban pakar radiologi.
* `MINIMAL` (Skor 25–49): Infiltrat fokal kecil; saringan ulangan berjadual.
* `MODERATE` (Skor 50–74): Konsolidasi aktif zon atas; GeneXpert MTB/RIF mandatori.
* `SEVERE` (Skor ≥ 75): Kavitasi luas; pengasingan pernafasan udara serta-merta (N95).

---

## ☁️ Integrasi Google Cloud Firebase Firestore

Sistem menyepadukan Google Cloud Firebase Firestore secara langsung untuk penyelarasan data saringan rentas klinik dan hospital:

* **Cloud Project ID:** `gen-lang-client-0038105363`
* **Wilayah (Region):** `us-west1`
* **ID Pangkalan Data:** `ai-studio-app-9e7bb8ae-469f-4419-a0fc-6e2793b6537a`
* **Skema Blueprint:** `firebase-blueprint.json` (Koleksi `/screenings/{screeningId}`)
* **Peraturan Keselamatan (`firestore.rules`):**
  - Menguatkuasakan keselamatan Zero-Trust ABAC.
  - Pengesahan medan wajib melalui `isValidScreening(data)` dan had ID melalui `isValidId(id)`.
  - Telah berjaya dideploy ke awan secara langsung melalui `DeployRules`.

---

## 🖨️ Format Laporan Klinikal Rasmi (Printable Medical Report)

Laporan PDF gred diagnostik dijana secara terus daripada pelayar pesakit:
* **Kepala Surat Rasmi:** Memaparkan Jata KKM, lambang PKDKN, dan lencana SPECTRA AI-TB dengan penanda `CONFIDENTIAL // SULIT`.
* **Jalur Demografi:** ID saringan, umur, jantina, kategori saringan, dan status CAD.
* **Visualisasi Skor Patologi:** Carta bar 5 paksi patologi TB.
* **Pelan Tindakan Berasaskan CPG:** Tindakan klinikal bernombor dengan sitasi dokumen rasmi.
* **Petak Pengesahan Doktor:** Ruang tandatangan, cop rasmi Pegawai Perubatan, dan tarikh verifikasi.

---
---

<a name="-english-version"></a>
# 🇬🇧 ENGLISH VERSION

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
