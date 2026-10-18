import { useState } from "react";
import { Link } from "react-router-dom";
import {
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  UploadCloud,
  ShieldCheck,
  Stethoscope,
  FileText,
  ArrowRight,
  Sparkles,
  HelpCircle,
  Activity,
  Layers,
  FileCheck,
  Mic,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { LOGOS } from "@/constants/logos";

const HowToUse = () => {
  const [lang, setLang] = useState("bm"); // "bm" | "en"

  const content = {
    bm: {
      title: "Panduan Penggunaan Sistem SPECTRA AI-TB",
      subtitle:
        "Protokol Operasi Piawai (SOP) Saringan CAD Radiologi Dada & Sokongan Keputusan Klinikal Tuberkulosis berpandukan CPG KKM & WHO.",
      switchLang: "English Version",
      quickStart: "Mula Saringan Sekarang",
      stepsTitle: "5 Langkah Aliran Kerja Klinikal (Clinical Workflow)",
      steps: [
        {
          num: "01",
          icon: Layers,
          title: "Daftar Demografi & Kategori Risiko Pesakit",
          desc: "Lengkapkan kategori saringan pesakit (contoh: Kontak Rapat, Diabetes Mellitus, HIV / Immunocompromised, Warga Emas, atau Perokok Tegar). Masukkan umur dan jantina untuk penyesuaian nisbah kardiotorasik dan risiko klinikal.",
          tip: "Pesakit dalam kategori 'Kontak Rapat' mempunyai ambang kecurigaan klinikal yang lebih tinggi mengikut CPG KKM Bab 3.",
        },
        {
          num: "02",
          icon: UploadCloud,
          title: "Muat Naik Radiograf Dada (PA Chest X-ray)",
          desc: "Muat naik fail imej X-ray dada pandangan Posteroanterior (PA) atau Anteroposterior (AP) dalam format DICOM, PNG, JPEG, atau WebP. Pastikan kedua-dua zon apikal dan sudut kostofrenik kelihatan jelas.",
          tip: "Untuk pembentangan atau demonstrasi pantas, gunakan 'Quick Scenario Picker' untuk memilih senario pesakit yang telah siap dikonfigurasikan.",
        },
        {
          num: "03",
          icon: ShieldCheck,
          title: "Pengesahan Keselamatan #0 & Analisis Enjin CAD",
          desc: "Klik 'Jana Analisis Radiograf'. Sistem akan menguatkuasakan Safety Directive #0 untuk mengesahkan bahawa imej adalah radiograf dada sebenar. Imej bukan perubatan akan ditolak secara automatik bagi mengelakkan halusinasi AI.",
          tip: "Enjin Gemini 3.8 Flash akan menganalisis 5 paksi patologi: Kavitasi, Konsolidasi, Nodul/Granuloma, Fibrosis, dan Efusi Pleura.",
        },
        {
          num: "04",
          icon: Stethoscope,
          title: "Semak Penemuan Radiologi & Sitasi CPG KKM",
          desc: "Teliti skor CAD (0–100), visualisasi kotak sempadan (bounding box) pada kawasan lesi apikal, serta stratifikasi keparahan (NO_LESION, MINIMAL, MODERATE, SEVERE). Semak rujukan muka surat CPG KKM dan WHO yang dipadankan.",
          tip: "Bagi kes 'Kavitasi' atau 'Konsolidasi Apikal', sistem secara mandatori mewajibkan ujian GeneXpert MTB/RIF dan Sputum AFB Smear x2.",
        },
        {
          num: "05",
          icon: FileCheck,
          title: "Tindakan Klinikal, Notifikasi Akta 342 & Laporan PDF",
          desc: "Ambil tindakan susulan mengikut cadangan pelan rawatan. Lakukan notifikasi statutori ke Pejabat Kesihatan Daerah (PKD) di bawah Akta 342 bagi kes kecurigaan tinggi. Jana dan cetak Laporan Rasmi KKM/PKDKN dengan cop pengesahan Pegawai Perubatan.",
          tip: "Laporan PDF menyertakan kepala surat rasmi KKM, PKDKN, dan SPECTRA berserta penanda keselamatan SULIT.",
        },
      ],
      safetyTitle: "Arahan Keselamatan #0: Penapis Imej Bukan Perubatan",
      safetyDesc:
        "Bagi memastikan keselamatan pesakit dan mengelakkan sebarang halusinasi algoritma, SPECTRA AI-TB menolak serta-merta imej yang BUKAN radiograf dada sebenar:",
      safetyList: [
        "Gambar orang ramai, majlis keraian, atau reruai pameran.",
        "Swafoto (selfie), potret peribadi, atau tangkapan skrin telefon.",
        "Ilustrasi grafik, poster kempen, atau dokumen teks bertulis.",
        "X-ray anatomi lain (contoh: anggota kaki, tangan, tengkorak, atau pelvis).",
      ],
      faqTitle: "Soalan Lazim (FAQ) Klinikal",
      faqs: [
        {
          q: "Adakah sistem ini menggantikan diagnosis Pegawai Perubatan?",
          a: "Tidak. SPECTRA AI-TB direka khas sebagai Alat Sokongan Keputusan Klinikal (Clinical Decision Support System) pra-diagnostik selaras piawaian WHO. Keputusan muktamad diagnosis dan rawatan kekal di bawah tanggungjawab Pegawai Perubatan yang merawat.",
        },
        {
          q: "Apakah fungsi Mod Demonstrasi (Exhibition Demo Mode)?",
          a: "Mod Demonstrasi (boleh diaktifkan di Tetapan) memanjangkan tempoh analisis kepada 15 saat dengan paparan Karusel Fakta Klinikal KKM/WHO. Ini memberi masa kepada juri atau audiens pameran untuk memahami proses penaakulan berbilang peringkat AI sebelum keputusan dipaparkan.",
        },
        {
          q: "Bagaimanakah data saringan disimpan?",
          a: "Data saringan disimpan secara setempat dan diselaraskan secara automatik ke pangkalan data awan selamat Google Cloud Firebase Firestore yang dilindungi oleh peraturan Zero-Trust ABAC.",
        },
        {
          q: "Bila kes perlu dinotifikasikan di bawah Akta 342?",
          a: "Mengikut Akta Pencegahan dan Pengawalan Penyakit Berjangkit 1988 (Akta 342), sebarang kes yang disahkan atau disyaki tinggi Tuberkulosis Pulmonari wajib dinotifikasikan ke PKD dalam tempoh 7 hari (atau serta-merta bagi kes calitan kahak positif).",
        },
      ],
    },
    en: {
      title: "SPECTRA AI-TB User & Clinical Guide",
      subtitle:
        "Standard Operating Procedure (SOP) for Chest X-Ray CAD Triage and Clinical Decision Support grounded in MOH Malaysia CPG & WHO Guidelines.",
      switchLang: "Versi Bahasa Melayu",
      quickStart: "Start Screening Now",
      stepsTitle: "5-Step Clinical Workflow",
      steps: [
        {
          num: "01",
          icon: Layers,
          title: "Register Patient Demographics & Risk Profile",
          desc: "Select the patient screening category (e.g., Close Contact, Diabetes Mellitus, HIV / Immunocompromised, Elderly, or Heavy Smoker). Enter the patient's age and biological sex to calibrate cardiothoracic ratio benchmarks and clinical risk baselines.",
          tip: "Patients categorized under 'Close Contact' have a heightened index of suspicion per MOH CPG Chapter 3.",
        },
        {
          num: "02",
          icon: UploadCloud,
          title: "Upload Posteroanterior (PA) Chest Radiograph",
          desc: "Upload a standard PA or AP chest radiograph in DICOM, PNG, JPEG, or WebP format. Ensure both apical lung zones and costophrenic sulci are fully captured without severe motion artifacts.",
          tip: "For quick demonstrations, use the 'Quick Scenario Picker' to test pre-configured clinical profiles instantly.",
        },
        {
          num: "03",
          icon: ShieldCheck,
          title: "Safety Directive #0 Gate & CAD Vision Analysis",
          desc: "Click 'Analyze Radiograph'. The system executes Safety Directive #0 to verify the image is an authentic chest radiograph. Non-radiological files are rejected immediately to eliminate AI hallucination.",
          tip: "The Gemini 3.8 Flash engine quantifies 5 pathological axes: Cavitation, Consolidation, Nodules, Fibrosis, and Pleural Effusion.",
        },
        {
          num: "04",
          icon: Stethoscope,
          title: "Review Radiological Findings & CPG Grounding",
          desc: "Examine the CAD score (0–100), visual lesion bounding boxes (apical infiltrates, cavitation rings), and severity tier (NO_LESION, MINIMAL, MODERATE, SEVERE). Review specific chapter and page citations from MOH CPG and WHO guidelines.",
          tip: "Cavitation or apical consolidation findings strictly mandate GeneXpert MTB/RIF and Sputum AFB Smear x2.",
        },
        {
          num: "05",
          icon: FileCheck,
          title: "Clinical Action, Act 342 Notification & PDF Report",
          desc: "Follow the evidence-grounded action plan. Submit statutory notifications to the District Health Office (PKD) under Act 342 for high-suspicion cases. Generate and print the official MOH/PKDKN report for clinical sign-off.",
          tip: "The generated PDF includes official KKM, PKDKN, and SPECTRA letterhead with confidential classification.",
        },
      ],
      safetyTitle: "Safety Directive #0: Non-Radiological Image Rejection Gate",
      safetyDesc:
        "To guarantee patient safety and prevent algorithmic hallucinations, SPECTRA AI-TB immediately blocks and rejects non-chest radiographs:",
      safetyList: [
        "Crowd photos, social events, or exhibition booth pictures.",
        "Selfies, personal portraits, or mobile phone screenshots.",
        "Graphic illustrations, campaign posters, or text documents.",
        "Radiographs of non-thoracic anatomy (e.g. limbs, skull, or pelvis).",
      ],
      faqTitle: "Clinical Frequently Asked Questions",
      faqs: [
        {
          q: "Does this system replace a Medical Officer's diagnosis?",
          a: "No. SPECTRA AI-TB is an assistive Clinical Decision Support System (CDSS) for pre-diagnostic triage aligned with WHO Target Product Profiles. Final clinical correlation and diagnostic confirmation remain the sole responsibility of the attending Medical Officer.",
        },
        {
          q: "What is Exhibition Demo Mode?",
          a: "Exhibition Demo Mode (accessible in Settings) sets a paced 15-second inspection cadence with an educational Clinical Facts Carousel. This ensures evaluators and stage audiences have ample time to review the multi-stage AI inference process before results display.",
        },
        {
          q: "Where is screening data stored?",
          a: "Screenings are cached locally and synchronized in real-time to Google Cloud Firebase Firestore, safeguarded by hardened Zero-Trust ABAC security rules.",
        },
        {
          q: "When must cases be statutorily notified under Act 342?",
          a: "Under the Prevention and Control of Infectious Diseases Act 1988 (Act 342), any confirmed or high-suspicion active pulmonary TB case must be notified to the District Health Office within 7 days (or immediately for sputum smear-positive cases).",
        },
      ],
    },
  };

  const t = content[lang];

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      {/* Top Banner & Language Switcher */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 shadow-xs">
              <img src={LOGOS.kkm} alt="KKM" className="h-5 w-auto object-contain" />
              <img src={LOGOS.pkdkn} alt="PKDKN" className="h-5 w-auto object-contain" />
              <div className="h-3.5 w-px bg-slate-200" />
              <img src={LOGOS.spectra} alt="Spectra" className="h-4 w-auto object-contain rounded-xs" />
              <span className="text-xs font-semibold text-slate-700">MOH / KKM · PKDKN SOP</span>
            </div>
          </div>
          <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            {t.title}
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{t.subtitle}</p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setLang(lang === "bm" ? "en" : "bm")}
            className="text-xs font-medium"
          >
            🌐 {t.switchLang}
          </Button>
          <Link to="/">
            <Button size="sm" className="bg-emerald-700 hover:bg-emerald-800 text-white gap-1.5 text-xs">
              <Activity className="h-3.5 w-3.5" />
              {t.quickStart}
            </Button>
          </Link>
        </div>
      </div>

      {/* Dual Screening Modality Overview Cards */}
      <div className="mb-10 rounded-xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-6 shadow-xs">
        <div className="flex items-center gap-2 mb-2">
          <Layers className="h-5 w-5 text-emerald-700" />
          <h2 className="font-heading text-lg font-bold text-slate-900">
            {lang === "bm"
              ? "Dua Saluran Saringan Bersepadu dalam Satu Aplikasi"
              : "Dual Screening Modalities Integrated in One Platform"}
          </h2>
        </div>
        <p className="text-xs text-slate-500 mb-5 leading-relaxed">
          {lang === "bm"
            ? "SPECTRA AI-TB menggabungkan dua kaedah saringan saling melengkapi bagi membolehkan pengesanan awal dari peringkat komuniti hingga ke klinik respiratori:"
            : "SPECTRA AI-TB unifies two complementary screening modalities to enable early tuberculosis detection from frontline community outreach to specialized chest clinics:"}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Card 1: CXR CAD */}
          <div className="rounded-lg border-2 border-emerald-500/80 bg-white p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="rounded bg-emerald-100 text-emerald-800 px-2 py-0.5 text-xs font-mono font-bold">
                SARINGAN 1
              </span>
              <Activity className="h-5 w-5 text-emerald-700" />
            </div>
            <div>
              <h3 className="font-heading text-base font-bold text-slate-900">
                {lang === "bm" ? "Saringan Radiologi Dada (CXR CAD)" : "Chest X-Ray CAD Vision Engine"}
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                {lang === "bm"
                  ? "Analisis visual imej radiograf dada (PA/AP) bagi mengesan 5 paksi patologi (kaviti, konsolidasi, nodul, fibrosis, efusi pleura) beserta kotak sempadan 2D berpandukan CPG KKM."
                  : "Deep visual analysis of PA chest radiographs detecting 5 cardinal TB signs with 2D lesion bounding boxes and MOH CPG grounding."}
              </p>
            </div>
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-400 font-mono text-[11px]">Fasiliti: Klinik Kesihatan / Hospital</span>
              <Link to="/">
                <Button size="sm" variant="ghost" className="text-emerald-800 hover:text-emerald-950 text-xs font-bold gap-1 p-0">
                  {lang === "bm" ? "Buka Saringan CXR →" : "Launch CXR CAD →"}
                </Button>
              </Link>
            </div>
          </div>

          {/* Card 2: Acoustic Cough */}
          <div className="rounded-lg border-2 border-blue-500/80 bg-white p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="rounded bg-blue-100 text-blue-800 px-2 py-0.5 text-xs font-mono font-bold">
                SARINGAN 2
              </span>
              <Mic className="h-5 w-5 text-blue-700" />
            </div>
            <div>
              <h3 className="font-heading text-base font-bold text-slate-900">
                {lang === "bm" ? "Saringan Triaj Akustik Batuk (AeroTriage TB)" : "Acoustic Cough Triage (AeroTriage TB)"}
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                {lang === "bm"
                  ? "Tangkapan batuk mikrofon masa nyata, dwi-kanvas 60 FPS (Oscilloscope & FFT Spektrogram), ekstraksi biopenanda DSP (Peak Hz, Wetness, Centroid), dan saringan 4-gejala WHO."
                  : "Real-time microphone capture, 60 FPS dual canvas (Oscilloscope & FFT Spectrogram), client-side DSP extraction (Peak Hz, Wetness, Centroid), and WHO 4-symptom triage."}
              </p>
            </div>
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-400 font-mono text-[11px]">Fasiliti: Komuniti / Outreach / Klinik Desa</span>
              <Link to="/cough">
                <Button size="sm" variant="ghost" className="text-blue-800 hover:text-blue-950 text-xs font-bold gap-1 p-0">
                  {lang === "bm" ? "Buka Saringan Batuk →" : "Launch Cough Triage →"}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* 5-Step Workflow Section */}
      <div className="mb-12 space-y-6">
        <div className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-emerald-700" />
          <h2 className="font-heading text-xl font-bold text-foreground">{t.stepsTitle}</h2>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {t.steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={idx}
                className="group relative flex flex-col md:flex-row items-start gap-5 rounded-lg border border-border bg-white p-5 shadow-xs transition-all hover:border-emerald-300 hover:shadow-sm"
              >
                <div className="flex items-center gap-3 md:flex-col md:items-center shrink-0">
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-800 font-mono font-bold text-sm border border-emerald-200">
                    {step.num}
                  </span>
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-slate-100 text-slate-700">
                    <Icon className="h-4 w-4" />
                  </div>
                </div>

                <div className="flex-1 space-y-2">
                  <h3 className="font-heading text-base font-semibold text-foreground group-hover:text-emerald-900">
                    {step.title}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{step.desc}</p>
                  <div className="inline-flex items-center gap-1.5 rounded-md bg-emerald-50/70 border border-emerald-100 px-2.5 py-1 text-[11px] text-emerald-900 font-medium">
                    <Sparkles className="h-3 w-3 text-emerald-600 shrink-0" />
                    <span>{step.tip}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Safety Directive #0 Callout */}
      <div className="mb-12 rounded-lg border-2 border-amber-300 bg-amber-50/60 p-6 shadow-xs">
        <div className="flex items-center gap-2.5 text-amber-900 mb-2">
          <AlertTriangle className="h-5 w-5 text-amber-700 shrink-0" />
          <h3 className="font-heading text-base font-bold">{t.safetyTitle}</h3>
        </div>
        <p className="text-xs text-amber-950 mb-4 leading-relaxed">{t.safetyDesc}</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-amber-900">
          {t.safetyList.map((item, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-600 shrink-0" />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* FAQs Section */}
      <div className="mb-12 space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <HelpCircle className="h-5 w-5 text-blue-600" />
          <h2 className="font-heading text-xl font-bold text-foreground">{t.faqTitle}</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {t.faqs.map((faq, i) => (
            <div key={i} className="rounded-lg border border-border bg-white p-5 shadow-xs space-y-2">
              <h4 className="font-semibold text-xs text-foreground flex items-start gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{faq.q}</span>
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed pl-5">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom CTA Strip */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-lg border border-border bg-gradient-to-r from-emerald-50 via-teal-50 to-white p-6 shadow-xs">
        <div className="space-y-1 text-center sm:text-left">
          <h3 className="font-heading text-base font-bold text-foreground">
            {lang === "bm"
              ? "Bersedia untuk menjalankan saringan pesakit?"
              : "Ready to perform clinical patient screening?"}
          </h3>
          <p className="text-xs text-muted-foreground">
            {lang === "bm"
              ? "Pilih senario demonstrasi atau muat naik radiograf dada untuk analisis masa nyata."
              : "Select a demo scenario or upload a chest radiograph for real-time analysis."}
          </p>
        </div>
        <Link to="/">
          <Button className="bg-emerald-700 hover:bg-emerald-800 text-white gap-2 text-xs font-semibold px-5">
            {lang === "bm" ? "Buka Saringan Baru" : "Open New Screening"}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default HowToUse;
