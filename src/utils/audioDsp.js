// Web Audio API DSP and Audio Synthesis Engine for AeroTriage TB

export class AudioEngine {
  constructor() {
    this.audioContext = null;
    this.analyser = null;
    this.mediaStream = null;
    this.mediaRecorder = null;
    this.audioChunks = [];
    this.isRecording = false;
  }

  async init() {
    if (!this.audioContext) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.audioContext = new AudioCtx();
    }
    if (this.audioContext.state === "suspended") {
      await this.audioContext.resume();
    }
  }

  async startMicStream() {
    await this.init();
    if (!this.mediaStream) {
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        },
      });
    }

    this.analyser = this.audioContext.createAnalyser();
    this.analyser.fftSize = 2048;
    this.analyser.smoothingTimeConstant = 0.8;

    const source = this.audioContext.createMediaStreamSource(this.mediaStream);
    source.connect(this.analyser);

    return { stream: this.mediaStream, analyser: this.analyser };
  }

  stopMicStream() {
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => track.stop());
      this.mediaStream = null;
    }
  }

  async startRecording() {
    await this.startMicStream();
    this.audioChunks = [];
    this.isRecording = true;

    // Use webm or mp4 audio
    let mimeType = "audio/webm";
    if (!MediaRecorder.isTypeSupported("audio/webm")) {
      mimeType = MediaRecorder.isTypeSupported("audio/mp4") ? "audio/mp4" : "";
    }

    const options = mimeType ? { mimeType } : undefined;
    this.mediaRecorder = new MediaRecorder(this.mediaStream, options);

    this.mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        this.audioChunks.push(e.data);
      }
    };

    this.mediaRecorder.start(100);
  }

  async stopRecording() {
    return new Promise((resolve) => {
      if (!this.mediaRecorder || this.mediaRecorder.state === "inactive") {
        this.isRecording = false;
        resolve({ blob: null, base64: null, audioUrl: null });
        return;
      }

      this.mediaRecorder.onstop = async () => {
        const mimeType = this.mediaRecorder.mimeType || "audio/webm";
        const blob = new Blob(this.audioChunks, { type: mimeType });
        const audioUrl = URL.createObjectURL(blob);
        const base64 = await blobToBase64(blob);
        this.isRecording = false;
        resolve({ blob, base64, audioUrl, mimeType });
      };

      this.mediaRecorder.stop();
    });
  }
}

export function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result;
      const base64 = typeof result === "string" ? result.split(",")[1] : "";
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

// ----------------------------- Client-side DSP Feature Extraction -----------------------------

export function extractDspBiomarkers(timeDomainData, frequencyData, sampleRate = 44100, noiseFloorRms = 0.01) {
  const fftSize = frequencyData.length * 2;
  const binResolution = sampleRate / fftSize;

  // 1. RMS Energy
  let sumSquares = 0;
  for (let i = 0; i < timeDomainData.length; i++) {
    const val = (timeDomainData[i] - 128) / 128;
    sumSquares += val * val;
  }
  const rms = Math.sqrt(sumSquares / timeDomainData.length);

  // 2. Peak Frequency (Hz)
  let maxMag = 0;
  let maxBin = 0;
  for (let i = 1; i < frequencyData.length; i++) {
    if (frequencyData[i] > maxMag) {
      maxMag = frequencyData[i];
      maxBin = i;
    }
  }
  const peakFrequencyHz = Math.round(maxBin * binResolution);

  // 3. Spectral Centroid (Hz)
  let weightedSum = 0;
  let totalEnergy = 0;
  for (let i = 0; i < frequencyData.length; i++) {
    const freq = i * binResolution;
    const mag = frequencyData[i];
    weightedSum += freq * mag;
    totalEnergy += mag;
  }
  const spectralCentroidHz = totalEnergy > 0 ? Math.round(weightedSum / totalEnergy) : 0;

  // 4. Zero-Crossing Rate (ZCR)
  let zeroCrossings = 0;
  for (let i = 1; i < timeDomainData.length; i++) {
    const prev = timeDomainData[i - 1] - 128;
    const curr = timeDomainData[i] - 128;
    if ((prev >= 0 && curr < 0) || (prev < 0 && curr >= 0)) {
      zeroCrossings++;
    }
  }
  const zeroCrossingRate = Number((zeroCrossings / (timeDomainData.length - 1)).toFixed(3));

  // 5. Cough Wetness Index (% estimate based on low-frequency late rales vs high-pitched noise)
  // Low-frequency energy (100 - 600 Hz) typical of fluid/mucus vibrations
  let lowBandEnergy = 0;
  let highBandEnergy = 0;
  const lowBinEnd = Math.floor(600 / binResolution);
  const highBinStart = Math.floor(1500 / binResolution);

  for (let i = 0; i < frequencyData.length; i++) {
    if (i <= lowBinEnd) {
      lowBandEnergy += frequencyData[i];
    } else if (i >= highBinStart) {
      highBandEnergy += frequencyData[i];
    }
  }
  const wetnessRatio = (lowBandEnergy + 1) / (lowBandEnergy + highBandEnergy + 2);
  const coughWetnessIndex = Math.min(Math.round(wetnessRatio * 100), 98);

  // 6. Signal-to-Noise Ratio (dB)
  const snrDb = Math.max(0, Math.round(20 * Math.log10((rms + 1e-4) / (noiseFloorRms + 1e-4))));

  return {
    rms_energy: Number(rms.toFixed(4)),
    peak_frequency_hz: peakFrequencyHz || 320,
    spectral_centroid_hz: spectralCentroidHz || 850,
    zero_crossing_rate: zeroCrossingRate,
    cough_wetness_index: coughWetnessIndex,
    snr_db: snrDb,
    cough_burst_count: rms > 0.08 ? 2 : 1,
    duration_ms: 1850,
  };
}

// ----------------------------- Web Audio Synthesizer (Stage-Proof Demo Simulation) -----------------------------

export function generateSyntheticCoughAudio(preset = "high_risk", sampleRate = 44100) {
  const durationSec = preset === "healthy" ? 0.9 : preset === "bronchitis" ? 1.4 : 2.2;
  const numSamples = Math.floor(sampleRate * durationSec);
  const buffer = new Float32Array(numSamples);

  // Profile acoustics
  const baseFreq = preset === "high_risk" ? 310 : preset === "bronchitis" ? 1650 : 520;
  const wetness = preset === "high_risk" ? 0.85 : preset === "bronchitis" ? 0.2 : 0.15;
  const burstCount = preset === "high_risk" ? 3 : preset === "bronchitis" ? 2 : 1;

  for (let burst = 0; burst < burstCount; burst++) {
    const burstStart = Math.floor((burst * numSamples) / (burstCount + 0.5));
    const burstLen = Math.floor(numSamples / (burstCount + 1));

    for (let i = 0; i < burstLen && burstStart + i < numSamples; i++) {
      const t = i / sampleRate;
      const progress = i / burstLen;

      // Compressive attack & expulsive envelope
      let envelope = 0;
      if (progress < 0.15) {
        envelope = Math.sin((progress / 0.15) * (Math.PI / 2));
      } else {
        envelope = Math.exp(-progress * (preset === "high_risk" ? 3.0 : 5.0));
      }

      // Fundamental resonance + harmonics
      const osc1 = Math.sin(2 * Math.PI * baseFreq * t);
      const osc2 = Math.sin(2 * Math.PI * (baseFreq * 2.1) * t) * 0.4;
      const osc3 = Math.sin(2 * Math.PI * (baseFreq * 0.5) * t) * (wetness * 0.6); // low rumble mucus rales

      // Turbulent noise
      const noise = (Math.random() * 2 - 1) * (1 - wetness * 0.5);

      const sample = (osc1 * 0.4 + osc2 * 0.2 + osc3 * 0.3 + noise * 0.3) * envelope * 0.7;
      buffer[burstStart + i] += sample;
    }
  }

  // Convert Float32Array to 16-bit PCM WAV Blob
  return float32ToWavBlob(buffer, sampleRate);
}

function float32ToWavBlob(samples, sampleRate) {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);

  // RIFF chunk descriptor
  writeString(view, 0, "RIFF");
  view.setUint32(4, 36 + samples.length * 2, true);
  writeString(view, 8, "WAVE");

  // FMT sub-chunk
  writeString(view, 12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM format
  view.setUint16(22, 1, true); // Mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true); // byte rate
  view.setUint16(32, 2, true); // block align
  view.setUint16(34, 16, true); // bits per sample

  // Data sub-chunk
  writeString(view, 36, "data");
  view.setUint32(40, samples.length * 2, true);

  // Write PCM samples
  let offset = 44;
  for (let i = 0; i < samples.length; i++, offset += 2) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }

  return new Blob([view], { type: "audio/wav" });
}

function writeString(view, offset, string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}
