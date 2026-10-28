# Safety Directive #0 / #4 Image Gatekeeper Relaxation & Clinician Override Plan

An update to the AeroSpectra TB CXR screening workflow that eliminates false-negative rejections of real-world Posteroanterior (PA) and Anteroposterior (AP) chest radiographs while providing clinicians with an explicit override mechanism to force full Tuberculosis CAD analysis when needed.

## User Review & Critical Decisions

> [!IMPORTANT]
> **Key Decisions Confirmed for Implementation:**
> - **Relaxed Multimodal CXR Validation (Safety Directive #0 / #4)**: Any radiograph showing a ribcage, clavicles, mediastinum, or lung fields will be accepted as a valid chest radiograph (`TIER_1_CHEST_XRAY` / `VALID_CXR`), explicitly tolerating black borders/letterboxing, severe pathology (massive cardiomegaly, large pleural effusions, white-out hemithorax, dense consolidations), photos of films on lightboxes or hospital monitor screens (glare, moiré patterns, tilt), and anatomical markers (`L`/`R`) or minor cropping.
> - **Tier 2 Non-Chest Radiographs Preserved**: Radiographs of other anatomical regions (e.g., hand, wrist, knee, spine) continue to enter Tier 2 limited mode (displaying radiological findings without a TB CAD score), now paired with the new **Override & Analyze Anyway (Clinician Override)** button.
> - **Clinician Override Persistence**: When a clinician triggers **Override & Analyze Anyway (Clinician Override)** from either a rejected state or Tier 2 limited mode, the forced Tuberculosis CAD analysis is saved to History, Firestore, and offline storage identically to standard verified screenings, and unlocks full PDF/FHIR report export and viewport annotations.

---

## 1. Overview & Core Concept

Clinical chest radiographs uploaded in field and hospital settings frequently exhibit non-ideal artifacts—such as lightbox glare, monitor moiré patterns, heavy black padding, rotation, or severe parenchymal opacification (e.g., complete hemithorax white-out or large pleural effusions) that obscure normal cardiomediastinal and costophrenic contours. Overly rigid gatekeeping causes false-negative rejections (`INVALID_IMAGE_TYPE`) on genuine patient radiographs.

This update refines the Safety Directive #0 / #4 validation pipeline across three layers:
1. **Permissive Clinical Vision Gate**: Re-aligns the multimodal system instructions so `INVALID_IMAGE_TYPE` is strictly reserved for images that are 100% unmistakably non-radiological (e.g., text documents, selfies, landscapes, everyday objects), while any thoracic radiograph—regardless of pathology severity or capture medium—proceeds directly to full Tuberculosis CAD scoring.
2. **Unobstructed Image Payload Pipeline**: Ensures custom image uploads pass their clean base64 payload (stripped of `data:image/...;base64,` prefixes) and exact MIME type (`image/jpeg`, `image/png`, `image/webp`) directly to the Gemini multimodal endpoint without brittle client-side pixel, aspect-ratio, or filename heuristics blocking evaluation.
3. **Clinician Override Fallback (`force_override`)**: Empowers clinicians with an explicit **"Override & Analyze Anyway (Clinician Override)"** control on both the rejected alert banner and the Tier 2 non-chest limited view, bypassing the gatekeeper to execute full Tuberculosis CAD scoring and persist the resulting clinical record.

---

## 2. User Experience & Visual Design

- **Aesthetic & Clinical Precision**: Maintains AeroSpectra's high-contrast clinical radiology workstation aesthetic (`#07090E` deep obsidian viewport, crisp `1px` slate hairlines, tabular monospace telemetry readouts, and bilingual Bahasa Malaysia / English structured reporting).
- **Safety Directive #0 / #4 Rejection Banner (`InvalidImageBanner`)**:
  - Displays the clear diagnostic alert when a non-radiological image (such as Scenario E or a document photo) is blocked.
  - Adds a secondary action button directly inside the card: **"Override & Analyze Anyway (Clinician Override)"** with an active loading state while the forced CAD re-analysis is running.
- **Tier 2 Limited Mode & Inconclusive States (`ResultPanel`)**:
  - Preserves the radiological findings summary and `"TB CAD scoring applies to chest radiographs only."` notice for non-chest X-rays, and adds the **"Override & Analyze Anyway (Clinician Override)"** button so clinicians can force full CAD scoring if an atypical thoracic view was misclassified as non-chest or inconclusive.
- **Post-Override Viewport & Report Transition**:
  - Once overridden, the viewport badge transitions from `UNVERIFIED INPUT` to `PA VIEW · DIGITAL RADIOGRAPHY` / `VIEWPORT // DICOM CXR`, the full TB SCORE gauge and bilingual Findings / Impression / Recommended Actions tabs populate, and the record is saved to History.

---

## 3. Key Product Decisions & Trade-Offs

- **Inclusive Thoracic Recognition vs. Strict Gatekeeping**:
  - *Decision*: Instruct the vision model that if any thoracic structure (ribcage, clavicles, mediastinum, hemidiaphragm, or lung fields) is visible—even when heavily obscured by pathology, cropped, rotated, or photographed off a monitor—it must classify as `TIER_1_CHEST_XRAY` (`VALID`).
  - *Trade-off*: Maximizes clinical sensitivity so abnormal or portable AP films are never falsely blocked, while still catching unmistakable non-radiographs (documents, faces, everyday scenes) and routing extremity/skeletal radiographs to Tier 2.
- **Separate Deterministic Cache Key for Override Runs**:
  - *Decision*: Include the `force_override` state in the deterministic SHA-256 request cache key on the backend (`imageHash + demographics + forceOverride`).
  - *Trade-off*: Prevents a prior `REJECTED` or `NON_CHEST_XRAY` cached response for the same image from blocking a subsequent Clinician Override request, while preserving deterministic repeatability for both standard and overridden runs.
- **Full History & Export Parity on Clinician Override**:
  - *Decision*: Treat clinician-overridden analyses as verified clinical screenings in History, Firestore, and PDF/FHIR exports.
  - *Trade-off*: Ensures clinicians who override a false rejection are not penalized with missing History records or disabled PDF exports.

---

## 4. Technical Architecture & Data Strategy

```
+-------------------------------------------------------------------------+
|                   Client UI (NewScreening / ResultPanel)                |
|  1. Custom Upload -> Clean Data URL + Exact MIME (jpeg / png / webp)    |
|  2. Standard Analyze (force_override: false)                            |
|  3. Clinician Override Button -> Re-POSTs with (force_override: true)   |
+------------------------------------+------------------------------------+
                                     |
                                     v
+-------------------------------------------------------------------------+
|                     Express Backend (POST /api/analyze)                 |
|  - Strips `data:image/...;base64,` prefix & validates MIME type         |
|  - Built-in Scenarios A-D -> Returns locked clinical reference outputs  |
|  - Scenario E -> Rejects by default; runs full CAD if force_override    |
+------------------------------------+------------------------------------+
                                     |
             +-----------------------+-----------------------+
             | force_override: false                         | force_override: true
             v                                               v
+--------------------------------------------+  +-------------------------+
|   Safety Directive #0/#4 Vision Gate       |  | Bypass Rejection Gate   |
|   - Tier 1: Valid CXR (includes borders,   |  | - Forces Tier 1 Full    |
|     severe pathology, monitor/film photos) |  |   TB CAD Scoring        |
|   - Tier 2: Non-Chest X-Ray (Findings only)|  | - Status: VALID         |
|   - Tier 3: Unmistakably Not X-Ray (Reject)|  | - Saves to History      |
+--------------------------------------------+  +-------------------------+
```

- **Payload Sanitation & MIME Fidelity**: The client reads uploaded files via `FileReader.readAsDataURL`, preserving the image's MIME type (`image/jpeg`, `image/png`, `image/webp`), and the server strips the `data:image/...;base64,` header cleanly before passing `inlineData: { data: rawBase64, mimeType }` to `@google/genai`.
- **Client-Side Gate Inspection**: The client-side helper (`inspectImageRadiograph`) performs zero pixel-variance, aspect-ratio, brightness, or filename rejections, delegating classification entirely to the multimodal model.
- **Forced CAD Prompting (`force_override: true`)**: When `force_override` is active, the backend instructs `gemini-3.8-flash` that a licensed clinician has overridden the image gatekeeper and requires a complete `TIER_1_CHEST_XRAY` (`status: "VALID"`) Tuberculosis CAD assessment with quantitative `tb_score`, `severity`, `pathology_scores`, and bilingual clinical text, which is then persisted to History and Firestore.
