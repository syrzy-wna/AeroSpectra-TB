import { useEffect, useRef, useState } from "react";
import { Mic, Square, Play, RotateCcw, Activity, Waveform as WaveformIcon, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AudioEngine, extractDspBiomarkers, blobToBase64 } from "@/utils/audioDsp";
import { drawOscilloscope, drawSpectrogram } from "@/utils/canvasRenderers";

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

  const oscCanvasRef = useRef(null);
  const specCanvasRef = useRef(null);
  const animFrameIdRef = useRef(null);
  const timerIntervalRef = useRef(null);

  // When demo preset is selected from parent, update audio & telemetry
  useEffect(() => {
    if (demoAudioBlob) {
      const url = URL.createObjectURL(demoAudioBlob);
      setAudioUrl(url);
      setDspTelemetry(demoDspTelemetry);
      blobToBase64(demoAudioBlob).then((base64) => {
        if (onAudioCaptured) {
          onAudioCaptured({
            blob: demoAudioBlob,
            base64,
            audioUrl: url,
            mimeType: "audio/wav",
            dsp: demoDspTelemetry,
          });
        }
      });
    }
  }, [demoAudioBlob, demoDspTelemetry]);

  // Clean up
  useEffect(() => {
    return () => {
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      engine.stopMicStream();
    };
  }, [engine]);

  // Handle live recording start
  const handleStartRecording = async () => {
    try {
      setAudioUrl(null);
      setRecordingSeconds(0);
      setIsRecording(true);

      const { analyser } = await engine.startMicStream();
      await engine.startRecording();

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
      console.error("Microphone error:", err);
      setIsRecording(false);
      alert("Sila benarkan akses mikrofon untuk merakam batuk.");
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
      if (onAudioCaptured) {
        onAudioCaptured({
          blob,
          base64,
          audioUrl,
          mimeType: mimeType || "audio/webm",
          dsp: dspTelemetry,
        });
      }
    }

    // Freeze display with flatline/final state
    if (oscCanvasRef.current) drawOscilloscope(oscCanvasRef.current, null, false);
  };

  return (
    <div className="space-y-4 rounded-lg border border-slate-200 bg-white p-5 shadow-xs">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-emerald-700" />
          <h3 className="font-heading text-sm font-bold text-slate-900">
            AeroTriage Studio: Tangkapan Akustik Batuk (Web Audio DSP)
          </h3>
        </div>
        {isRecording && (
          <span className="flex items-center gap-1.5 rounded-full bg-rose-50 border border-rose-200 px-2.5 py-0.5 text-xs font-mono font-bold text-rose-700 animate-pulse">
            <span className="h-2 w-2 rounded-full bg-rose-600" />
            REC 00:0{recordingSeconds}s
          </span>
        )}
      </div>

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

      {/* Recording Controls & Audio Replay */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-2">
          {!isRecording ? (
            <Button
              type="button"
              onClick={handleStartRecording}
              disabled={disabled}
              className="bg-emerald-700 hover:bg-emerald-800 text-white gap-2 text-xs font-semibold"
            >
              <Mic className="h-4 w-4" />
              Mula Rakaman Batuk (Record Live Cough)
            </Button>
          ) : (
            <Button
              type="button"
              variant="destructive"
              onClick={handleStopRecording}
              className="gap-2 text-xs font-semibold animate-pulse"
            >
              <Square className="h-4 w-4" />
              Hentikan Rakaman (Stop Capture)
            </Button>
          )}

          {audioUrl && (
            <audio src={audioUrl} controls className="h-8 max-w-[200px] sm:max-w-[240px]" />
          )}
        </div>

        <p className="text-[11px] text-slate-400 text-center sm:text-right">
          Arahkan pesakit batuk secara kuat 2–3 kali ke arah mikrofon dari jarak 20 cm.
        </p>
      </div>
    </div>
  );
};

export default CoughRecordingStudio;
