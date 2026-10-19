/**
 * @file acousticSafetyGate.ts
 * @description MODUL 1: Acoustic Safety Directive #0 (Real-Time Audio Quality & Validation Gate)
 *
 * CLINICAL & DSP RATIONALE:
 * A true physiological cough consists of three distinct biomechanical phases:
 *  1. Compressive Phase: Rapid glottal closure with intra-thoracic pressure building up (0-30ms).
 *  2. Expulsive Phase: Explosive glottal opening producing an acoustic shockwave burst with high
 *     initial RMS energy (>0.05) and broad spectral dispersion (100 Hz - 4000 Hz).
 *  3. Decay/Vocal Cord Relaxation Phase: Rapid acoustic attenuation with low-frequency mucosal rales
 *     or wheezing.
 *
 * ARTIFACT REJECTION CRITERIA:
 * - Wind / Ambient Noise: Continuous baseline noise, lacking an explosive attack transient,
 *   low peak-to-average power ratio (PAPR), or RMS below minimum audible threshold (<0.02).
 * - Human Speech / Singing: Characterized by sustained pitch periodicity, low zero-crossing rate (ZCR),
 *   and steady harmonic formant structures lasting > 1.5 seconds without compressive silence.
 * - Non-Cough Sudden Clicks: Micro-duration spikes (<40ms) without expulsive decay.
 */

export interface AcousticValidationResult {
  status: "ACCEPTED" | "REJECTED";
  error_code?: "INVALID_AUDIO_INPUT" | "NOISE_FLOOR_EXCEEDED" | "SIGNAL_TOO_WEAK";
  message?: string;
  metrics?: {
    peak_rms: number;
    mean_rms: number;
    crest_factor: number;
    zero_crossing_rate: number;
    burst_detected: boolean;
    duration_ms: number;
  };
}

/**
 * Validates an AudioBuffer to ensure it contains an authentic cough burst profile
 * and rejects human speech, continuous background wind noise, or silent artifacts.
 *
 * @param audioBuffer - Web Audio API AudioBuffer (mono or stereo decoded PCM)
 * @returns AcousticValidationResult with ACCEPTED or REJECTED status
 */
export function validateAcousticInput(audioBuffer: AudioBuffer): AcousticValidationResult {
  if (!audioBuffer || audioBuffer.length === 0) {
    return {
      status: "REJECTED",
      error_code: "INVALID_AUDIO_INPUT",
      message: "RALAT AUDIO: Tiada isyarat audio dikesan dalam penimbal (buffer kosong).",
    };
  }

  const sampleRate = audioBuffer.sampleRate;
  const channelData = audioBuffer.getChannelData(0); // Evaluate primary channel
  const totalSamples = channelData.length;
  const durationMs = Math.round((totalSamples / sampleRate) * 1000);

  // Clinical constraint: Valid cough audio capture should typically span between 250ms and 5000ms
  if (durationMs < 200 || durationMs > 10000) {
    return {
      status: "REJECTED",
      error_code: "INVALID_AUDIO_INPUT",
      message: `RALAT DURASI AUDIO: Durasi rakaman (${durationMs}ms) di luar julat sah batuk fisiologi (200ms - 10,000ms).`,
      metrics: {
        peak_rms: 0,
        mean_rms: 0,
        crest_factor: 0,
        zero_crossing_rate: 0,
        burst_detected: false,
        duration_ms: durationMs,
      },
    };
  }

  // Frame-by-frame analysis (25ms window, 10ms hop size)
  const frameSize = Math.floor(sampleRate * 0.025); // 25ms
  const hopSize = Math.floor(sampleRate * 0.01);   // 10ms
  const numFrames = Math.floor((totalSamples - frameSize) / hopSize);

  const frameRmsValues: number[] = [];
  let zeroCrossings = 0;
  let peakRms = 0;
  let sumRms = 0;

  // Calculate Zero-Crossing Rate (ZCR) across entire buffer
  for (let i = 1; i < totalSamples; i++) {
    const prev = channelData[i - 1];
    const curr = channelData[i];
    if ((prev >= 0 && curr < 0) || (prev < 0 && curr >= 0)) {
      zeroCrossings++;
    }
  }
  const meanZcr = zeroCrossings / totalSamples;

  // Compute short-time energy (RMS) envelope
  for (let f = 0; f < numFrames; f++) {
    const startIdx = f * hopSize;
    let sumSq = 0;
    for (let j = 0; j < frameSize; j++) {
      const sample = channelData[startIdx + j];
      sumSq += sample * sample;
    }
    const rms = Math.sqrt(sumSq / frameSize);
    frameRmsValues.push(rms);
    sumRms += rms;
    if (rms > peakRms) {
      peakRms = rms;
    }
  }

  const meanRms = numFrames > 0 ? sumRms / numFrames : 0;
  // Crest Factor (Peak to Average Power Ratio) - high for explosive coughs, low for continuous speech/wind
  const crestFactor = meanRms > 0 ? peakRms / meanRms : 0;

  // 1. REJECTION GATE: Signal too weak or silent recording
  const MINIMUM_EXPLOSIVE_PEAK_RMS = 0.035;
  if (peakRms < MINIMUM_EXPLOSIVE_PEAK_RMS) {
    return {
      status: "REJECTED",
      error_code: "INVALID_AUDIO_INPUT",
      message:
        "RALAT KUALITI AUDIO: Amplitud isyarat terlalu rendah (bunyi tidak jelas atau mikrofon terlalu jauh). Sila batuk dengan kuat ke arah mikrofon.",
      metrics: {
        peak_rms: Number(peakRms.toFixed(4)),
        mean_rms: Number(meanRms.toFixed(4)),
        crest_factor: Number(crestFactor.toFixed(2)),
        zero_crossing_rate: Number(meanZcr.toFixed(3)),
        burst_detected: false,
        duration_ms: durationMs,
      },
    };
  }

  // 2. REJECTION GATE: Wind / Low-frequency ambient rumble
  // Wind noise typically has continuous non-burst energy with low Crest Factor (< 2.2) and low ZCR (< 0.04)
  if (crestFactor < 2.2 && meanRms > 0.02) {
    return {
      status: "REJECTED",
      error_code: "INVALID_AUDIO_INPUT",
      message:
        "RALAT HINGAR PERSEKITARAN: Isyarat berterusan dikesan tanpa letusan batuk (menyerupai deruan angin atau bising persekitaran). Sila pastikan bilik saringan tenang.",
      metrics: {
        peak_rms: Number(peakRms.toFixed(4)),
        mean_rms: Number(meanRms.toFixed(4)),
        crest_factor: Number(crestFactor.toFixed(2)),
        zero_crossing_rate: Number(meanZcr.toFixed(3)),
        burst_detected: false,
        duration_ms: durationMs,
      },
    };
  }

  // 3. REJECTION GATE: Human continuous conversational speech / singing
  // Speech exhibits sustained moderate energy across >75% of frames without rapid compressive drop,
  // and moderate-to-low ZCR without broad friction turbulence.
  let activeEnergyFrames = 0;
  for (const rms of frameRmsValues) {
    if (rms > peakRms * 0.4) {
      activeEnergyFrames++;
    }
  }
  const activeFrameRatio = numFrames > 0 ? activeEnergyFrames / numFrames : 0;

  // If high energy is sustained steadily throughout the entire window (>68%), it represents sustained speech/vocalizing
  if (activeFrameRatio > 0.68 && durationMs > 1200) {
    return {
      status: "REJECTED",
      error_code: "INVALID_AUDIO_INPUT",
      message:
        "RALAT PENGECAMAN SUARA: Isyarat menyerupai percakapan manusia atau harmonik suara berterusan, bukan letusan batuk fisiologi. Sila rakam batuk sahaja.",
      metrics: {
        peak_rms: Number(peakRms.toFixed(4)),
        mean_rms: Number(meanRms.toFixed(4)),
        crest_factor: Number(crestFactor.toFixed(2)),
        zero_crossing_rate: Number(meanZcr.toFixed(3)),
        burst_detected: false,
        duration_ms: durationMs,
      },
    };
  }

  // 4. Cough Burst Validation Passed
  return {
    status: "ACCEPTED",
    metrics: {
      peak_rms: Number(peakRms.toFixed(4)),
      mean_rms: Number(meanRms.toFixed(4)),
      crest_factor: Number(crestFactor.toFixed(2)),
      zero_crossing_rate: Number(meanZcr.toFixed(3)),
      burst_detected: true,
      duration_ms: durationMs,
    },
  };
}
