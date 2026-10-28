import jsPDF from "jspdf";
import html2canvas from "html2canvas";

/**
 * Renders the PrintableReport DOM node into a crisp, single-page A4 Portrait PDF (210mm x 297mm).
 * Clones the element into a zero-offset (left: 0, top: 0) staging container before capture
 * to prevent html2canvas float32 coordinate clipping caused by negative offscreen offsets.
 */
export async function downloadElementAsPdf(element, filename = "tb-screening-report.pdf") {
  if (!element) return;

  let stagingContainer = null;

  try {
    stagingContainer = document.createElement("div");
    stagingContainer.style.position = "fixed";
    stagingContainer.style.top = "0";
    stagingContainer.style.left = "0";
    stagingContainer.style.width = "794px";
    stagingContainer.style.backgroundColor = "#FFFFFF";
    stagingContainer.style.zIndex = "-9999";
    stagingContainer.style.pointerEvents = "none";
    stagingContainer.style.overflow = "visible";

    const clone = element.cloneNode(true);
    clone.style.margin = "0";
    clone.style.width = "794px";
    stagingContainer.appendChild(clone);
    document.body.appendChild(stagingContainer);

    // Ensure all images inside the cloned report have loaded before html2canvas snapshot
    const images = Array.from(clone.querySelectorAll("img"));
    await Promise.all(
      images.map(
        (img) =>
          new Promise((resolve) => {
            if (img.complete && img.naturalHeight !== 0) {
              resolve();
              return;
            }
            img.onload = () => resolve();
            img.onerror = () => resolve();
          })
      )
    );

    const canvas = await html2canvas(clone, {
      scale: 2.5,
      useCORS: true,
      allowTaint: true,
      logging: false,
      backgroundColor: "#FFFFFF",
      width: 794,
      windowWidth: 794,
      x: 0,
      y: 0,
      scrollX: 0,
      scrollY: 0,
    });

    const imgData = canvas.toDataURL("image/jpeg", 0.96);
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const pageWidth = pdf.internal.pageSize.getWidth(); // 210mm
    const pageHeight = pdf.internal.pageSize.getHeight(); // 297mm

    let renderWidth = pageWidth;
    let renderHeight = (canvas.height * renderWidth) / canvas.width;

    // Guarantee Single-Page A4 Portrait fit with zero bottom or side clipping
    if (renderHeight > pageHeight) {
      renderHeight = pageHeight;
      renderWidth = (canvas.width * renderHeight) / canvas.height;
    }

    const offsetX = (pageWidth - renderWidth) / 2;
    const offsetY = 0;

    pdf.addImage(imgData, "JPEG", offsetX, offsetY, renderWidth, renderHeight);
    pdf.save(filename);
  } catch (error) {
    console.error("PDF generation error, falling back to print dialog:", error);
    window.print();
  } finally {
    if (stagingContainer && stagingContainer.parentNode) {
      stagingContainer.parentNode.removeChild(stagingContainer);
    }
  }
}
