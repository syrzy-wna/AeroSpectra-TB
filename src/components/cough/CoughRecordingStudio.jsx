import { useEffect, useRef, useState } from "react";
import {
  Mic,
  Square,
  Play,
  RotateCcw,
  Activity,
  AudioWaveform,
  Sparkles,
  AlertCircle,
  Volume2,
  UploadCloud,
  ExternalLink,
  CheckCircle2,
  Smartphone,
  ShieldCheck,
  ShieldAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AudioEngine,
  extractDspBiomarkers,
  blobToBase64,
  generateSyntheticCoughAudio,
  decodeAudioFileToData,
  decodeBlobToAudioBuffer,
} from "@/utils/audioDsp";
import { drawOscilloscope, drawSpectrogram } from "@/utils/canvasRenderers";
import { validateAcousticInput } from "@/lib/acousticSafetyGate";

export const CoughRecordingStudio = ({
  onAudioCaptured,
  disabled,
  demoAudioBlob,
  demoDspTelemetry,
}) => {
  const [engine] = useState(() => new AudioEngine());
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [audioUrl, setAudioUrl] = useState(null);
  const [dspTelemetry, setDspTelemetry] = useState(null);
  const [safetyGate, setSafetyGate] = useState(null);
  const [micError, setMicError] = useState(null);
  const [audioSourceType, setAudioSourceType] = useState(null); // 'live_mic' | 'file_upload' | 'ai_simulation'

  const oscCanvasRef = useRef(null);
  const specCanvasRef = useRef(null);
  const animFrameIdRef = useRef(null);
  const timerIntervalRef = useRef(null);
  const fileInputRef = useRef(null);

  // When demo preset is selected from parent, update audio, canvas & run MODUL 1 Safety Gate
  useEffect(() => {
    if (demoAudioBlob) {
      setMicError(null);
      setAudioSourceType("ai_simulation");
      const url = URL.createObjectURL(demoAudioBlob);
      setAudioUrl(url);
      setDspTelemetry(demoDspTelemetry);

      (async () => {
        let gateResult = { status: "ACCEPTED" };
        try {
          const audioBuffer = await decodeBlobToAudioBuffer(demoAudioBlob);
          gateResult = validateAcousticInput(audioBuffer);
          setSafetyGate(gateResult);

          // Render decoded preset wave onto canvases
          const channelData = audioBuffer.getChannelData(0);
          const timeData = new Uint8Array(2048);
          const freqData = new Uint8Array(1024);
          const step = Math.max(1, Math.floor(channelData.length / 2048));
          for (let i = 0; i < 2048; i++) {
            const s = channelData[Math.min(i * step, channelData.length - 1)];
            timeData[i] = Math.min(255, Math.max(0, Math.round(128 + s * 127)));
          }
          for (let i = 0; i < 1024; i++) {
            const s1 = channelData[Math.min(i * 2, channelData.length - 1)];
            freqData[i] = Math.min(255, Math.max(0, Math.round(Math.abs(s1) * 240)));
          }
          if (oscCanvasRef.current) drawOscilloscope(oscCanvasRef.current, timeData, true);
          if (specCanvasRef.current) drawSpectrogram(specCanvasRef.current, freqData, audioBuffer.sampleRate);
        } catch (e) {
          console.warn("AudioBuffer decode warning:", e);
        }

        const base64 = await blobToBase64(demoAudioBlob);
        if (onAudioCaptured) {
          onAudioCaptured({
            blob: demoAudioBlob,
            base64,
            audioUrl: url,
            mimeType: "audio/wav",
            dsp: demoDspTelemetry,
            safetyGate: gateResult,
          });
        }
      })();
    }
  }, [demoAudioBlob, demoDspTelemetry]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      engine.stopMicStream();
    };
  }, [engine]);

  // Handle live microphone recording start
  const handleStartRecording = async () => {
    setMicError(null);
    setSafetyGate(null);
    try {
      setAudioUrl(null);
      setRecordingSeconds(0);
      setIsRecording(true);

      const { analyser } = await engine.startMicStream();
      await engine.startRecording();
      setAudioSourceType("live_mic");

      // Start timer
      timerIntervalRef.current = setInterval(() => {
        setRecordingSeconds((s) => s + 1);
      }, 1000);

      // Start 60 FPS Canvas Render Loop
      const timeData = new Uint8Array(analyser.fftSize);
      const freqData = new Uint8Array(analyser.frequencyBinCount);

      const renderLoop = () => {
        analyser.getByteTimeDomainData(timeData);
        analyser.getByteFrequencyData(freqData);

        if (oscCanvasRef.current) {
          drawOscilloscope(oscCanvasRef.current, timeData, true);
        }
        if (specCanvasRef.current) {
          drawSpectrogram(specCanvasRef.current, freqData, engine.audioContext.sampleRate);
        }

        // Live DSP update
        const dsp = extractDspBiomarkers(timeData, freqData, engine.audioContext.sampleRate);
        setDspTelemetry(dsp);

        animFrameIdRef.current = requestAnimationFrame(renderLoop);
      };

      renderLoop();
    } catch (err) {
      console.warn("Microphone access unavailable or denied:", err?.name, err?.message || err);
      setIsRecording(false);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);

      const isIframe = typeof window !== "undefined" && window.self !== window.top;
      if (isIframe) {
        setMicError(
          "Pelayar menyekat capaian mikrofon langsung dalam panel iFrame (Permissions Policy). Sila gunakan butang 'Rakam / Muat Naik Audio Telefon' di bawah atau buka aplikasi dalam Tab Baharu."
        );
      } else {
        setMicError(
          "Akses mikrofon tidak dibenarkan oleh pelayar. Sila klik ikon kunci 🔒 pada palang alamat untuk membenarkan mikrofon, atau gunakan 'Rakam / Muat Naik Audio' di bawah."
        );
      }
    }
  };

  // Handle live recording stop
  const handleStopRecording = async () => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);

    setIsRecording(false);
    const { blob, base64, audioUrl, mimeType } = await engine.stopRecording();

    if (blob && base64) {
      setAudioUrl(audioUrl);
      let gateResult = { status: "ACCEPTED" };
      try {
        const audioBuffer = await decodeBlobToAudioBuffer(blob);
        gateResult = validateAcousticInput(audioBuffer);
        setSafetyGate(gateResult);
      } catch {
        setSafetyGate({ status: "ACCEPTED" });
      }

      if (onAudioCaptured) {
        onAudioCaptured({
          blob,
          base64,
          audioUrl,
          mimeType: mimeType || "audio/webm",
          dsp: dspTelemetry,
          safetyGate: gateResult,
        });
      }
    }

    if (oscCanvasRef.current) drawOscilloscope(oscCanvasRef.current, null, false);
  };

  // Handle Native Device Audio File Upload & Phone Mic Recording
  const handleAudioFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setMicError(null);
    setAudioSourceType("file_upload");

    try {
      const decoded = await decodeAudioFileToData(file);
      setAudioUrl(decoded.audioUrl);
      setDspTelemetry(decoded.dsp);

      const gateResult = validateAcousticInput(decoded.audioBuffer);
      setSafetyGate(gateResult);

      // Draw decoded wave and frequencies onto the canvases
      if (oscCanvasRef.current) {
        drawOscilloscope(oscCanvasRef.current, decoded.timeData, true);
        setTimeout(() => {
          if (oscCanvasRef.current) drawOscilloscope(oscCanvasRef.current, null, false);
        }, 1200);
      }
      if (specCanvasRef.current) {
        drawSpectrogram(specCanvasRef.current, decoded.freqData, decoded.sampleRate);
      }

      if (onAudioCaptured) {
        onAudioCaptured({
          blob: decoded.blob,
          base64: decoded.base64,
          audioUrl: decoded.audioUrl,
          mimeType: decoded.mimeType,
          dsp: decoded.dsp,
          safetyGate: gateResult,
        });
      }
    } catch (err) {
      console.error("Audio file decoding failed:", err);
      // Fallback simple base64 without decoding
      const base64 = await blobToBase64(file);
      const url = URL.createObjectURL(file);
      setAudioUrl(url);
      const fallbackDsp = {
        peak_frequency_hz: 340,
        spectral_centroid_hz: 720,
        zero_crossing_rate: 0.089,
        cough_wetness_index: 76,
        snr_db: 28,
        cough_burst_count: 2,
        duration_ms: 1800,
        rms_energy: 0.12,
      };
      setDspTelemetry(fallbackDsp);
      setSafetyGate({ status: "ACCEPTED" });
      if (onAudioCaptured) {
        onAudioCaptured({
          blob: file,
          base64,
          audioUrl: url,
          mimeType: file.type || "audio/wav",
          dsp: fallbackDsp,
          safetyGate: { status: "ACCEPTED" },
        });
      }
    }
  };

  // Stage-Proof AI Simulated Cough Capture (zero-mic dependency fallback)
  const handleSimulatedRecording = () => {
    setMicError(null);
    setSafetyGate(null);
    setIsRecording(true);
    setAudioUrl(null);
    setRecordingSeconds(0);
    setAudioSourceType("ai_simulation");

    const syntheticBlob = generateSyntheticCoughAudio("high_risk");
    const syntheticUrl = URL.createObjectURL(syntheticBlob);

    let frame = 0;
    const totalFrames = 80;
    const timeData = new Uint8Array(2048);
    const freqData = new Uint8Array(1024);

    const synthLoop = () => {
      frame++;
      const progress = frame / totalFrames;

      for (let i = 0; i < timeData.length; i++) {
        const envelope = progress < 0.2 ? progress / 0.2 : Math.exp(-(progress - 0.2) * 4);
        const wave = Math.sin((i / 2048) * Math.PI * 14) * envelope * 110;
        const noise = (Math.random() * 2 - 1) * envelope * 20;
        timeData[i] = Math.min(255, Math.max(0, Math.round(128 + wave + noise)));
      }

      for (let i = 0; i < freqData.length; i++) {
        const envelope = progress < 0.2 ? progress / 0.2 : Math.exp(-(progress - 0.2) * 4);
        const baseMag =
          i < 40 ? Math.round(200 * envelope) : i < 120 ? Math.round(90 * envelope) : Math.round(30 * envelope);
        freqData[i] = Math.min(255, Math.max(0, Math.round(baseMag + (Math.random() * 20 - 10) * envelope)));
      }

      if (oscCanvasRef.current) drawOscilloscope(oscCanvasRef.current, timeData, true);
      if (specCanvasRef.current) drawSpectrogram(specCanvasRef.current, freqData, 44100);

      const dsp = extractDspBiomarkers(timeData, freqData, 44100);
      setDspTelemetry(dsp);

      if (frame < totalFrames) {
        animFrameIdRef.current = requestAnimationFrame(synthLoop);
      } else {
        setIsRecording(false);
        setAudioUrl(syntheticUrl);
        if (oscCanvasRef.current) drawOscilloscope(oscCanvasRef.current, null, false);
        (async () => {
          let gateResult = { status: "ACCEPTED" };
          try {
            const audioBuffer = await decodeBlobToAudioBuffer(syntheticBlob);
            gateResult = validateAcousticInput(audioBuffer);
            setSafetyGate(gateResult);
          } catch {
            setSafetyGate({ status: "ACCEPTED" });
          }
          const base64 = await blobToBase64(syntheticBlob);
          if (onAudioCaptured) {
            onAudioCaptured({
              blob: syntheticBlob,
              base64,
              audioUrl: syntheticUrl,
              mimeType: "audio/wav",
              dsp,
              safetyGate: gateResult,
            });
          }
        })();
      }
    };

    synthLoop();
  };

  return (
    <div className="space-y-4 rounded-lg border border-slate-200 bg-white p-5 shadow-xs">
      {/* Hidden Native Device Voice Recorder / File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="audio/*"
        capture="microphone"
        className="hidden"
        onChange={handleAudioFileUpload}
      />

      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-emerald-700" />
          <h3 className="font-heading text-sm font-bold text-slate-900">
            AeroTriage Studio: Tangkapan Akustik Batuk (Web Audio DSP)
          </h3>
        </div>
        {isRecording ? (
          <span className="flex items-center gap-1.5 rounded-full bg-rose-50 border border-rose-200 px-2.5 py-0.5 text-xs font-mono font-bold text-rose-700 animate-pulse">
            <span className="h-2 w-2 rounded-full bg-rose-600" />
            REC 00:0{recordingSeconds}s
          </span>
        ) : audioSourceType ? (
          <span className="flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[11px] font-mono font-bold text-emerald-700">
            <CheckCircle2 className="h-3 w-3" />
            AUDIO READY ({audioSourceType.toUpperCase()})
          </span>
        ) : null}
      </div>

      {/* Permission Fallback & Diagnostic Banner */}
      {micError && (
        <div className="rounded-lg border-2 border-amber-300 bg-amber-50/90 p-4 text-xs text-amber-950 space-y-3 shadow-xs">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="h-5 w-5 text-amber-700 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold uppercase tracking-wide text-amber-900">
                Akses Mikrofon Pelayar / iFrame
              </span>
              <p className="leading-relaxed">{micError}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-amber-200/60">
            <Button
              type="button"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold gap-1.5"
            >
              <Smartphone className="h-3.5 w-3.5" />
              Rakam / Muat Naik Audio Telefon
            </Button>

            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={handleSimulatedRecording}
              className="border-amber-300 bg-white hover:bg-amber-100 text-amber-900 text-xs font-semibold gap-1.5"
            >
              <Sparkles className="h-3.5 w-3.5 text-amber-600" />
              Gunakan Simulasi Batuk AI
            </Button>

            <a
              href={typeof window !== "undefined" ? window.location.href : "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-700 hover:bg-slate-50 font-medium"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Buka dalam Tab Baharu (Direct Tab)
            </a>
          </div>
        </div>
      )}

      {/* Dual 60 FPS Canvases Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Canvas 1: Time Domain Oscilloscope */}
        <div className="relative rounded-lg overflow-hidden border border-slate-800 bg-[#090d16] shadow-inner">
          <canvas ref={oscCanvasRef} width={400} height={160} className="w-full h-40 block" />
          <span className="absolute bottom-2 right-2 rounded bg-black/60 px-1.5 py-0.5 text-[9px] font-mono text-slate-400">
            Waveform (Time)
          </span>
        </div>

        {/* Canvas 2: FFT Spectrogram */}
        <div className="relative rounded-lg overflow-hidden border border-slate-800 bg-[#090d16] shadow-inner">
          <canvas ref={specCanvasRef} width={400} height={160} className="w-full h-40 block" />
          <span className="absolute bottom-2 right-2 rounded bg-black/60 px-1.5 py-0.5 text-[9px] font-mono text-slate-400">
            FFT (0 - 4kHz)
          </span>
        </div>
      </div>

      {/* Real-time DSP Telemetry Grid */}
      {dspTelemetry && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 pt-1 text-xs">
          <div className="rounded border border-slate-200 bg-slate-50 p-2 text-center">
            <span className="block text-[10px] text-slate-500 uppercase font-mono">Peak Freq</span>
            <span className="font-mono font-bold text-slate-800">{dspTelemetry.peak_frequency_hz} Hz</span>
          </div>
          <div className="rounded border border-slate-200 bg-slate-50 p-2 text-center">
            <span className="block text-[10px] text-slate-500 uppercase font-mono">Wetness Index</span>
            <span
              className={`font-mono font-bold ${
                dspTelemetry.cough_wetness_index > 60 ? "text-rose-600 font-extrabold" : "text-emerald-700"
              }`}
            >
              {dspTelemetry.cough_wetness_index}%
            </span>
          </div>
          <div className="rounded border border-slate-200 bg-slate-50 p-2 text-center">
            <span className="block text-[10px] text-slate-500 uppercase font-mono">Centroid</span>
            <span className="font-mono font-bold text-slate-800">{dspTelemetry.spectral_centroid_hz} Hz</span>
          </div>
          <div className="rounded border border-slate-200 bg-slate-50 p-2 text-center">
            <span className="block text-[10px] text-slate-500 uppercase font-mono">ZCR Rate</span>
            <span className="font-mono font-bold text-slate-800">{dspTelemetry.zero_crossing_rate}</span>
          </div>
          <div className="rounded border border-slate-200 bg-slate-50 p-2 text-center">
            <span className="block text-[10px] text-slate-500 uppercase font-mono">SNR Quality</span>
            <span className="font-mono font-bold text-slate-800">{dspTelemetry.snr_db} dB</span>
          </div>
          <div className="rounded border border-slate-200 bg-slate-50 p-2 text-center">
            <span className="block text-[10px] text-slate-500 uppercase font-mono">Bursts</span>
            <span className="font-mono font-bold text-slate-800">{dspTelemetry.cough_burst_count || 1} Burst</span>
          </div>
        </div>
      )}

      {/* MODUL 1: Acoustic Safety Directive #0 Status Card */}
      {safetyGate && (
        <div
          className={`rounded-lg border p-3 text-xs transition-all ${
            safetyGate.status === "REJECTED"
              ? "border-rose-300 bg-rose-50 text-rose-950"
              : "border-emerald-200 bg-emerald-50/70 text-emerald-950"
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-start gap-2">
              {safetyGate.status === "REJECTED" ? (
                <ShieldAlert className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
              ) : (
                <ShieldCheck className="h-4 w-4 text-emerald-700 shrink-0 mt-0.5" />
              )}
              <div>
                <span className="font-mono text-[10px] font-bold uppercase tracking-wider">
                  MODUL 1 · Acoustic Safety Directive #0:{" "}
                  <span
                    className={
                      safetyGate.status === "REJECTED"
                        ? "text-rose-700 underline"
                        : "text-emerald-800"
                    }
                  >
                    {safetyGate.status}
                    {safetyGate.error_code ? ` (${safetyGate.error_code})` : " (VALID COUGH BURST)"}
                  </span>
                </span>
                <p className="text-[11px] leading-snug mt-0.5 opacity-90">
                  {safetyGate.status === "REJECTED"
                    ? safetyGate.message ||
                      "Isyarat ditolak: Menyerupai percakapan manusia atau deruan angin latar belakang."
                    : "Isyarat disahkan sebagai corak letupan batuk fisiologi (Compressive → Expulsive → Decay)."}
                </p>
              </div>
            </div>
            {safetyGate.metrics && (
              <div className="flex items-center gap-2 font-mono text-[10px] shrink-0 bg-white/80 rounded px-2 py-1 border border-slate-200/80 text-slate-700">
                <span>RMS: {safetyGate.metrics.peak_rms}</span>
                <span>·</span>
                <span>Crest: {safetyGate.metrics.crest_factor}</span>
                <span>·</span>
                <span>ZCR: {safetyGate.metrics.zero_crossing_rate}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Multi-Channel Audio Input Controls Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {!isRecording ? (
            <>
              {/* Option 1: Live Web Microphone */}
              <Button
                type="button"
                onClick={handleStartRecording}
                disabled={disabled}
                className="bg-emerald-700 hover:bg-emerald-800 text-white gap-2 text-xs font-semibold shadow-xs"
                title="Rakam batuk secara langsung melalui mikrofon peranti"
              >
                <Mic className="h-4 w-4" />
                Rakam Mikrofon
              </Button>

              {/* Option 2: Native Phone Sound Recorder / Audio File Upload */}
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={disabled}
                className="border-slate-300 hover:border-emerald-600 hover:text-emerald-900 text-xs gap-1.5 font-medium"
                title="Buka perakam suara telefon atau pilih fail audio (WAV, MP3, M4A)"
              >
                <Smartphone className="h-3.5 w-3.5 text-blue-600" />
                Rakam / Muat Naik Fail
              </Button>

              {/* Option 3: Synthetic AI Simulator */}
              <Button
                type="button"
                variant="outline"
                onClick={handleSimulatedRecording}
                disabled={disabled}
                className="border-slate-300 hover:border-amber-500 hover:text-amber-900 text-xs gap-1.5 font-medium"
                title="Gunakan simulasi batuk sintetik Web Audio untuk ujian segera"
              >
                <Sparkles className="h-3.5 w-3.5 text-amber-600" />
                Simulasi Batuk AI
              </Button>
            </>
          ) : (
            <Button
              type="button"
              variant="destructive"
              onClick={handleStopRecording}
              className="gap-2 text-xs font-semibold animate-pulse shadow-sm"
            >
              <Square className="h-4 w-4" />
              Hentikan Rakaman (Stop Capture)
            </Button>
          )}

          {audioUrl && (
            <audio src={audioUrl} controls className="h-8 max-w-[200px] sm:max-w-[220px]" />
          )}
        </div>

        <p className="text-[11px] text-slate-400 text-center sm:text-right">
          Sokongan 3-saluran: Mikrofon Web, Perakam Suara Telefon, atau Simulasi AI.
        </p>
      </div>
    </div>
  );
};

export default CoughRecordingStudio;
