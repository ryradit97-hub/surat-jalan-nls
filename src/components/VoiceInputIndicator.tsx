import React from 'react';
import { Mic, Square, Loader2, AlertCircle, X, Sparkles } from 'lucide-react';

interface VoiceInputIndicatorProps {
  isListening: boolean;
  isTranscribing: boolean;
  recordingSeconds: number;
  interimTranscript: string;
  errorMessage: string | null;
  mode: 'web-speech' | 'gemini-ai' | null;
  onStop: () => void;
  onClearError: () => void;
  className?: string;
}

export const VoiceInputIndicator: React.FC<VoiceInputIndicatorProps> = ({
  isListening,
  isTranscribing,
  recordingSeconds,
  interimTranscript,
  errorMessage,
  mode,
  onStop,
  onClearError,
  className = '',
}) => {
  const formatSeconds = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const remainingSecs = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  if (!isListening && !isTranscribing && !errorMessage && !interimTranscript) {
    return null;
  }

  return (
    <div className={`w-full transition-all duration-300 animate-in fade-in zoom-in-95 ${className}`}>
      {/* Error Message Card with Mic Permission Help */}
      {errorMessage && (
        <div className="mb-3 p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-200 text-xs flex items-start gap-3 backdrop-blur-md shadow-lg shadow-rose-950/30">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="font-bold text-rose-100 text-sm">Kendala Akses Mikrofon</p>
            <p className="mt-1 leading-relaxed text-rose-200/90">{errorMessage}</p>
            <div className="mt-2 text-[11px] text-rose-300/80 bg-black/20 p-2 rounded-xl border border-rose-500/20">
              💡 <strong>Tips Cepat:</strong> Klik ikon gembok / slider di sebelah kiri URL browser (address bar), lalu pastikan <strong>Mikrofon</strong> diatur ke <strong>Izinkan (Allow)</strong>, kemudian klik tombol mikrofon lagi.
            </div>
          </div>
          <button
            type="button"
            onClick={onClearError}
            className="p-1 rounded-lg hover:bg-rose-500/20 text-rose-300 transition-colors"
            title="Tutup"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Actively Listening / Recording Indicator */}
      {isListening && (
        <div className="p-3 rounded-2xl bg-gradient-to-r from-purple-950/80 via-[#231730]/90 to-pink-950/80 border border-pink-500/40 shadow-xl shadow-pink-950/40 backdrop-blur-md flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {/* Pulsing red mic dot */}
            <div className="relative flex items-center justify-center w-8 h-8 rounded-full bg-pink-500/20 border border-pink-500/40">
              <span className="absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75 animate-ping" />
              <Mic className="w-4 h-4 text-pink-300 relative z-10 animate-pulse" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-pink-200 tracking-wide uppercase">
                  {mode === 'gemini-ai' ? 'Merekam Audio (Gemini AI)' : 'Mendengarkan Suara...'}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-pink-500/20 text-pink-300 border border-pink-500/30">
                  {formatSeconds(recordingSeconds)}
                </span>
              </div>
              <p className="text-[11px] text-[#faedd9]/70 mt-0.5">
                Bicarakan rincian surat jalan (tanggal, tujuan, BL, muatan, dsb.)
              </p>
            </div>
          </div>

          {/* Animated Audio Wave bars */}
          <div className="flex items-center gap-1 h-5 px-2">
            <span className="w-1 bg-pink-400 rounded-full animate-bounce [animation-delay:0ms] h-3" />
            <span className="w-1 bg-pink-300 rounded-full animate-bounce [animation-delay:150ms] h-5" />
            <span className="w-1 bg-purple-400 rounded-full animate-bounce [animation-delay:300ms] h-2" />
            <span className="w-1 bg-pink-300 rounded-full animate-bounce [animation-delay:450ms] h-4" />
            <span className="w-1 bg-purple-300 rounded-full animate-bounce [animation-delay:200ms] h-3" />
          </div>

          {/* Stop / Finish button */}
          <button
            type="button"
            onClick={onStop}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 shadow-md shadow-pink-600/30 active:scale-95 transition-all cursor-pointer border border-pink-400/40"
          >
            <Square className="w-3.5 h-3.5 fill-current" />
            <span>Selesai & Transkrip</span>
          </button>
        </div>
      )}

      {/* Interim Live Transcript Preview */}
      {interimTranscript && (
        <div className="mt-2 px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-xs italic text-[#faedd9]/90 backdrop-blur-sm flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-pink-400 animate-ping shrink-0" />
          <span className="truncate">"{interimTranscript}"</span>
        </div>
      )}

      {/* Transcribing with Gemini AI */}
      {isTranscribing && (
        <div className="p-3 rounded-2xl bg-purple-950/80 border border-purple-400/40 shadow-xl shadow-purple-950/40 backdrop-blur-md flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 text-xs text-purple-200">
            <Loader2 className="w-4 h-4 text-purple-300 animate-spin" />
            <Sparkles className="w-3.5 h-3.5 text-[#faedd9] animate-pulse" />
            <span className="font-semibold">
              Gemini AI sedang mengubah rekaman suara Anda menjadi teks...
            </span>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
            Memproses
          </span>
        </div>
      )}
    </div>
  );
};
