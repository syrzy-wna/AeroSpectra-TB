// 60 FPS HTML5 Canvas Visualizers for AeroTriage TB

export function drawOscilloscope(canvas, dataArray, isRecording = false) {
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const width = canvas.width;
  const height = canvas.height;

  // Background
  ctx.fillStyle = "#090d16";
  ctx.fillRect(0, 0, width, height);

  // Graticule grid lines
  ctx.strokeStyle = "#162338";
  ctx.lineWidth = 1;
  ctx.setLineDash([4, 4]);

  // Horizontal center & quarter lines
  ctx.beginPath();
  ctx.moveTo(0, height * 0.25);
  ctx.lineTo(width, height * 0.25);
  ctx.moveTo(0, height * 0.5);
  ctx.lineTo(width, height * 0.5);
  ctx.moveTo(0, height * 0.75);
  ctx.lineTo(width, height * 0.75);
  ctx.stroke();

  // Vertical time grid lines
  for (let x = 0; x < width; x += width / 8) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  ctx.setLineDash([]);

  if (!dataArray || dataArray.length === 0) {
    // Flat baseline trace
    ctx.strokeStyle = isRecording ? "#059669" : "#334155";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, height / 2);
    ctx.lineTo(width, height / 2);
    ctx.stroke();
    return;
  }

  // Waveform trace
  ctx.lineWidth = 2.5;
  ctx.strokeStyle = isRecording ? "#10b981" : "#0284c7";
  ctx.shadowColor = isRecording ? "rgba(16, 185, 129, 0.6)" : "rgba(2, 132, 199, 0.4)";
  ctx.shadowBlur = 8;

  ctx.beginPath();
  const sliceWidth = width / dataArray.length;
  let x = 0;

  for (let i = 0; i < dataArray.length; i++) {
    const v = dataArray[i] / 128.0;
    const y = (v * height) / 2;

    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
    x += sliceWidth;
  }

  ctx.lineTo(width, height / 2);
  ctx.stroke();
  ctx.shadowBlur = 0;

  // Real-time amplitude label
  ctx.fillStyle = "#64748b";
  ctx.font = "9px 'JetBrains Mono', monospace";
  ctx.fillText("TIME DOMAIN · OSCILLOSCOPE (±1.0 V)", 8, 14);
}

export function drawSpectrogram(canvas, frequencyData, sampleRate = 44100) {
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const width = canvas.width;
  const height = canvas.height;

  // Background
  ctx.fillStyle = "#090d16";
  ctx.fillRect(0, 0, width, height);

  // Anatomical Resonance Frequency Band Regions
  // 1. Bronchial Resonance (0 - 500 Hz) - TB Mucus Rales
  const px500 = (500 / 4000) * width;
  ctx.fillStyle = "rgba(16, 185, 129, 0.08)";
  ctx.fillRect(0, 0, px500, height);

  // 2. Tracheal Turbulence (500 - 1500 Hz)
  const px1500 = (1500 / 4000) * width;
  ctx.fillStyle = "rgba(14, 165, 233, 0.05)";
  ctx.fillRect(px500, 0, px1500 - px500, height);

  // 3. High-Pitched Wheeze / Friction (1500 - 4000 Hz)
  ctx.fillStyle = "rgba(244, 63, 94, 0.05)";
  ctx.fillRect(px1500, 0, width - px1500, height);

  // Band label overlays
  ctx.font = "8px 'JetBrains Mono', monospace";
  ctx.fillStyle = "#10b981";
  ctx.fillText("BRONCHIAL (0-500Hz)", 6, height - 6);
  ctx.fillStyle = "#0ea5e9";
  ctx.fillText("TRACHEAL (0.5-1.5kHz)", px500 + 6, height - 6);
  ctx.fillStyle = "#f43f5e";
  ctx.fillText("FRICTION / WHEEZE (1.5-4kHz)", px1500 + 6, height - 6);

  if (!frequencyData || frequencyData.length === 0) return;

  // FFT Bars (0 to 4000 Hz)
  const maxFreq = 4000;
  const maxBin = Math.floor((maxFreq / (sampleRate / 2)) * frequencyData.length);
  const barWidth = width / maxBin;

  for (let i = 0; i < maxBin; i++) {
    const magnitude = frequencyData[i]; // 0 to 255
    const barHeight = (magnitude / 255) * (height - 20);
    const x = i * barWidth;
    const y = height - barHeight - 16;

    // Spectral color gradient based on frequency
    if (i * (maxFreq / maxBin) < 600) {
      ctx.fillStyle = "#10b981"; // Emerald for bronchial
    } else if (i * (maxFreq / maxBin) < 1800) {
      ctx.fillStyle = "#38bdf8"; // Sky blue
    } else {
      ctx.fillStyle = "#f43f5e"; // Rose
    }

    ctx.fillRect(x, y, Math.max(1, barWidth - 1), barHeight);
  }

  // Header tag
  ctx.fillStyle = "#64748b";
  ctx.font = "9px 'JetBrains Mono', monospace";
  ctx.fillText("FFT SPECTRUM (0 - 4000 Hz)", 8, 14);
}
