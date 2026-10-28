/**
 * @file radiographGate.js
 * @description Safety Directive #0 — 3-Tier Radiograph Gate Helper
 *
 * Pre-screens built-in presets (A–D) and explicit Scenario E document markers on the client,
 * while passing all user-uploaded images to the server's 3-Tier Gemini Vision classifier:
 *   - TIER 1: Chest X-Ray (PA, AP, or lateral, any quality/rotation/screenshot/annotations) -> Full CAD analysis
 *   - TIER 2: Non-Chest X-Ray (hand/wrist, leg/knee, skull, spine, abdomen/pelvis) -> Findings only, no TB score
 *   - TIER 3: Not an X-Ray (documents, signage, photos of people/objects, selfies, text pages) -> Reject
 */

export const REJECTED_CXR_MESSAGE =
  "Image rejected: not a chest radiograph. Please upload a valid chest X-ray (PA/AP view).";

export const NON_CHEST_XRAY_NOTE =
  "TB CAD scoring applies to chest radiographs only.";

export const INCONCLUSIVE_CXR_MESSAGE =
  "Inconclusive — image quality insufficient, please retake";

/**
 * Inspects an image data URL to identify built-in scenario presets (A–D) or explicit
 * Scenario E non-radiological test documents. Never false-rejects user-uploaded images
 * via brittle pixel histograms — user uploads are evaluated by the 3-tier vision model.
 *
 * @param {string} imageDataUrl
 * @returns {Promise<{
 *   is_chest_radiograph: boolean,
 *   is_inconclusive_quality: boolean,
 *   detected_preset: string | null,
 *   tier: string,
 *   reason: string
 * }>}
 */
export async function inspectImageRadiograph(imageDataUrl, options = {}) {
  const { forceOverride = false } = options || {};

  if (!imageDataUrl || typeof imageDataUrl !== "string") {
    return {
      is_chest_radiograph: false,
      is_inconclusive_quality: false,
      detected_preset: null,
      tier: "TIER_3_NOT_XRAY",
      reason: REJECTED_CXR_MESSAGE,
    };
  }

  // If Clinician Override is active, bypass client-side gate checks immediately
  if (forceOverride) {
    return {
      is_chest_radiograph: true,
      is_inconclusive_quality: false,
      detected_preset: null,
      tier: "TIER_1_CHEST_XRAY",
      force_override: true,
      reason: "Clinician Override active — forcing full Tuberculosis CAD analysis.",
    };
  }

  // Fast check ONLY for built-in Scenario E explicit non-radiological SVG/data marker
  const lower = imageDataUrl.toLowerCase();
  if (
    imageDataUrl.includes("NON-RADIOLOGICAL DOCUMENT PHOTO") ||
    lower.includes("non-radiological document photo")
  ) {
    return {
      is_chest_radiograph: false,
      is_inconclusive_quality: false,
      detected_preset: "invalid",
      tier: "TIER_3_NOT_XRAY",
      reason: REJECTED_CXR_MESSAGE,
    };
  }

  if (typeof document === "undefined" || typeof Image === "undefined") {
    return {
      is_chest_radiograph: true,
      is_inconclusive_quality: false,
      detected_preset: null,
      tier: "PENDING_VISION",
      reason: "Deferring to server vision classifier.",
    };
  }

  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      try {
        const width = img.naturalWidth || img.width || 0;
        const height = img.naturalHeight || img.height || 0;

        const canvas = document.createElement("canvas");
        canvas.width = 4;
        canvas.height = 4;
        const ctx = canvas.getContext("2d");

        if (ctx && width > 0 && height > 0) {
          ctx.drawImage(img, 0, 0, width, height, 0, 0, 4, 4);
          const { data } = ctx.getImageData(0, 0, 1, 1);
          const r0 = data[0];
          const g0 = data[1];
          const b0 = data[2];

          // Built-in presets A–D top-left (0,0) signature only on exact 640x640 synthetic canvas
          if (width === 640 && height === 640 && r0 === g0 && g0 === b0) {
            let detectedPreset = null;
            if (r0 === 11) detectedPreset = "normal";
            else if (r0 === 12) detectedPreset = "moderate";
            else if (r0 === 13) detectedPreset = "severe";
            else if (r0 === 14) detectedPreset = "occupational";

            if (detectedPreset) {
              resolve({
                is_chest_radiograph: true,
                is_inconclusive_quality: false,
                detected_preset: detectedPreset,
                tier: "TIER_1_CHEST_XRAY",
                reason: "Built-in clinical scenario preset verified.",
              });
              return;
            }
          }
        }

        // All user-uploaded images proceed to the server's Vision Classifier without client-side heuristic rejection
        resolve({
          is_chest_radiograph: true,
          is_inconclusive_quality: false,
          detected_preset: null,
          tier: "PENDING_VISION",
          reason: "Ready for multimodal vision classification.",
        });
      } catch {
        resolve({
          is_chest_radiograph: true,
          is_inconclusive_quality: false,
          detected_preset: null,
          tier: "PENDING_VISION",
          reason: "Ready for multimodal vision classification.",
        });
      }
    };

    img.onerror = () => {
      // Never block custom uploads on client decode error; defer to server multimodal model
      resolve({
        is_chest_radiograph: true,
        is_inconclusive_quality: false,
        detected_preset: null,
        tier: "PENDING_VISION",
        reason: "Deferring to server multimodal vision classifier.",
      });
    };

    img.src = imageDataUrl;
  });
}
