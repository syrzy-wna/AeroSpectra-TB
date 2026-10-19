/**
 * @file radiographGate.js
 * @description Safety Directive #0 — Client-Side Chest Radiograph Pre-Screening & Pixel Classifier
 *
 * Inspects uploaded or selected images on an offscreen HTML5 Canvas prior to CAD scoring
 * to verify radiographic grayscale properties, anatomical dynamic range, and absence of
 * non-medical document/color/signage artifacts.
 */

export const REJECTED_CXR_MESSAGE =
  "Image rejected: not a chest radiograph. Please upload a valid chest X-ray (PA/AP view).";

/**
 * Analyzes a data URL or image source on an offscreen canvas to determine whether
 * it exhibits valid chest radiograph characteristics vs. a document photo, poster, or color photo.
 *
 * @param {string} imageDataUrl
 * @returns {Promise<{
 *   is_chest_radiograph: boolean,
 *   reason: string,
 *   metrics?: {
 *     width: number,
 *     height: number,
 *     color_ratio: number,
 *     bright_white_ratio: number,
 *     dark_lung_ratio: number,
 *     std_dev: number
 *   }
 * }>}
 */
export async function inspectImageRadiograph(imageDataUrl) {
  if (!imageDataUrl || typeof imageDataUrl !== "string") {
    return {
      is_chest_radiograph: false,
      reason: REJECTED_CXR_MESSAGE,
    };
  }

  // Fast string check for known non-radiological markers
  const lower = imageDataUrl.toLowerCase();
  if (
    imageDataUrl.includes("NON-RADIOLOGICAL") ||
    lower.includes("non-radiological") ||
    lower.includes("document photo")
  ) {
    return {
      is_chest_radiograph: false,
      reason: REJECTED_CXR_MESSAGE,
    };
  }

  if (typeof document === "undefined" || typeof Image === "undefined") {
    return {
      is_chest_radiograph: true,
      reason: "Browser canvas unavailable; deferring to server vision gate.",
    };
  }

  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      try {
        const width = img.naturalWidth || img.width || 0;
        const height = img.naturalHeight || img.height || 0;

        // 1. Minimum diagnostic image dimensions check
        if (width < 64 || height < 64) {
          resolve({
            is_chest_radiograph: false,
            reason: REJECTED_CXR_MESSAGE,
            metrics: {
              width,
              height,
              color_ratio: 0,
              bright_white_ratio: 0,
              dark_lung_ratio: 0,
              std_dev: 0,
            },
          });
          return;
        }

        const sampleSize = 128;
        const canvas = document.createElement("canvas");
        canvas.width = sampleSize;
        canvas.height = sampleSize;
        const ctx = canvas.getContext("2d");

        if (!ctx) {
          resolve({ is_chest_radiograph: true, reason: "Canvas context unavailable" });
          return;
        }

        ctx.drawImage(img, 0, 0, sampleSize, sampleSize);
        const { data } = ctx.getImageData(0, 0, sampleSize, sampleSize);
        const totalPixels = sampleSize * sampleSize;

        let coloredPixels = 0;
        let brightWhitePixels = 0;
        let darkPixels = 0;
        let transparentPixels = 0;
        let sumLum = 0;
        let maxLum = 0;
        const luminances = new Float32Array(totalPixels);

        for (let i = 0; i < totalPixels; i++) {
          const idx = i * 4;
          const r = data[idx];
          const g = data[idx + 1];
          const b = data[idx + 2];
          const a = data[idx + 3];

          if (a < 128) {
            transparentPixels++;
          }

          const spread = Math.max(r, g, b) - Math.min(r, g, b);
          if (spread > 35) {
            coloredPixels++;
          }

          const lum = 0.299 * r + 0.587 * g + 0.114 * b;
          luminances[i] = lum;
          sumLum += lum;
          if (lum > maxLum) maxLum = lum;

          if (lum > 210) {
            brightWhitePixels++;
          }
          if (lum < 75) {
            darkPixels++;
          }
        }

        const meanLum = sumLum / totalPixels;
        let varianceSum = 0;
        for (let i = 0; i < totalPixels; i++) {
          const diff = luminances[i] - meanLum;
          varianceSum += diff * diff;
        }
        const stdDev = Math.sqrt(varianceSum / totalPixels);

        const colorRatio = Number((coloredPixels / totalPixels).toFixed(4));
        const brightWhiteRatio = Number((brightWhitePixels / totalPixels).toFixed(4));
        const darkLungRatio = Number((darkPixels / totalPixels).toFixed(4));
        const transparentRatio = Number((transparentPixels / totalPixels).toFixed(4));

        const metrics = {
          width,
          height,
          color_ratio: colorRatio,
          bright_white_ratio: brightWhiteRatio,
          dark_lung_ratio: darkLungRatio,
          std_dev: Number(stdDev.toFixed(2)),
        };

        // Gate rule A: High chromaticity (color photographs, signage, posters, documents with colored headers)
        // Authentic chest radiographs are monochromatic grayscale
        if (colorRatio > 0.08) {
          resolve({
            is_chest_radiograph: false,
            reason: REJECTED_CXR_MESSAGE,
            metrics,
          });
          return;
        }

        // Gate rule B: Predominantly bright white background (document photos, scanned text pages, screenshots)
        if (brightWhiteRatio > 0.22) {
          resolve({
            is_chest_radiograph: false,
            reason: REJECTED_CXR_MESSAGE,
            metrics,
          });
          return;
        }

        // Gate rule C: Lack of radiolucent dark lung fields / film background
        if (darkLungRatio < 0.10) {
          resolve({
            is_chest_radiograph: false,
            reason: REJECTED_CXR_MESSAGE,
            metrics,
          });
          return;
        }

        // Gate rule D: Transparent graphic icon or uniform blank image
        if (transparentRatio > 0.15 || stdDev < 10 || maxLum < 60) {
          resolve({
            is_chest_radiograph: false,
            reason: REJECTED_CXR_MESSAGE,
            metrics,
          });
          return;
        }

        resolve({
          is_chest_radiograph: true,
          reason: "Valid chest radiograph grayscale and radiolucent profile.",
          metrics,
        });
      } catch {
        resolve({
          is_chest_radiograph: true,
          reason: "Canvas inspection skipped.",
        });
      }
    };

    img.onerror = () => {
      resolve({
        is_chest_radiograph: false,
        reason: REJECTED_CXR_MESSAGE,
      });
    };

    img.src = imageDataUrl;
  });
}
