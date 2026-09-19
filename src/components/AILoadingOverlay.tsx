import React, { useEffect, useState } from 'react';
import { Sparkles, Truck, MapPin, FileText, CheckCircle2 } from 'lucide-react';

interface AILoadingOverlayProps {
  isOpen: boolean;
}

export const AILoadingOverlay: React.FC<AILoadingOverlayProps> = ({ isOpen }) => {
  const [progress, setProgress] = useState<number>(0);

  const steps = [
    {
      icon: Sparkles,
      title: 'Ekstraksi Instruksi',
      desc: 'Menganalisis komoditas, tanggal, berat & remarks',
      threshold: 35,
    },
    {
      icon: MapPin,
      title: 'Pemetaan Logistik',
      desc: 'Validasi BL number, PO & terminal tujuan',
      threshold: 75,
    },
    {
      icon: FileText,
      title: 'Format Dokumen A4',
      desc: 'Menyusun layout resmi standar NLS Logistik',
      threshold: 98,
    },
  ];

  useEffect(() => {
    if (!isOpen) {
      setProgress(0);
      return;
    }

    setProgress(8);
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev < 35) return prev + Math.random() * 8 + 4;
        if (prev < 75) return prev + Math.random() * 6 + 3;
        if (prev < 96) return prev + Math.random() * 4 + 1.5;
        return 98;
      });
    }, 120);

    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  // Determine current active step
  const currentStepIndex =
    progress < 35 ? 0 : progress < 75 ? 1 : progress < 98 ? 2 : 3;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#120a1b]/85 backdrop-blur-2xl animate-fade-in">
      {/* Ambient glowing fluid background blurs */}
      <div className="absolute w-96 h-96 bg-[#a855f7]/25 rounded-full blur-[110px] pointer-events-none animate-pulse" />
      <div className="absolute w-80 h-80 bg-[#faedd9]/15 rounded-full blur-[100px] pointer-events-none" />

      {/* Main Liquid Card */}
      <div className="relative z-10 max-w-lg w-full rounded-[36px] sm:rounded-[44px] p-6 sm:p-8 liquid-hero-glass shadow-[0_35px_100px_rgba(0,0,0,0.6)] border-[0.5px] border-white/20 overflow-hidden">
        {/* Specular hairline top reflection line */}
        <div className="absolute inset-x-12 top-0 h-[0.5px] bg-gradient-to-r from-transparent via-white/50 to-transparent pointer-events-none" />
        <div className="absolute -top-32 -left-32 w-72 h-72 bg-gradient-to-br from-white/20 via-[#d8b4fe]/10 to-transparent rounded-full blur-3xl pointer-events-none" />

        {/* Top Header with Pulsing Glow Orb */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="relative mb-4">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-[#c084fc] via-[#f472b6] to-[#faedd9] animate-spin-slow opacity-60 blur-md absolute inset-0" />
            <div className="w-16 h-16 rounded-3xl bg-[#1c102a] border-[0.5px] border-white/25 flex items-center justify-center relative shadow-inner">
              <Truck className="w-7 h-7 text-[#faedd9] animate-bounce" />
            </div>
          </div>

          <h3 className="text-xl sm:text-2xl font-black text-[#fffdfa] tracking-tight">
            Menyusun Surat Jalan...
          </h3>
          <p className="text-xs sm:text-sm text-[#faedd9]/75 mt-1">
            Mengolah data instruksi pengiriman secara real-time
          </p>
        </div>

        {/* PROGRESS BAR SECTION */}
        <div className="mb-7 p-4 sm:p-5 rounded-3xl bg-white/[0.03] border-[0.5px] border-white/[0.08] shadow-[inset_0_1px_2px_rgba(255,255,255,0.06)]">
          {/* Progress Header Info */}
          <div className="flex items-center justify-between text-xs mb-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#faedd9] animate-ping" />
              <span className="font-bold text-[#fffdfa] text-xs sm:text-sm">
                Progress Generasi
              </span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.06] border-[0.5px] border-white/15 backdrop-blur-md">
              <Sparkles className="w-3 h-3 text-[#d8b4fe]" />
              <span className="font-mono font-bold text-xs text-[#faedd9] tabular-nums">
                {Math.min(100, Math.round(progress))}%
              </span>
            </div>
          </div>

          {/* Delivery Truck Runner on Track */}
          <div className="relative h-6 mb-1 overflow-visible">
            <div
              className="absolute top-0 flex items-center gap-1 transition-all duration-300 ease-out"
              style={{
                left: `calc(${Math.min(92, Math.max(0, progress))}% - 14px)`,
              }}
            >
              <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-[#faedd9] to-white flex items-center justify-center shadow-lg shadow-purple-500/30">
                <Truck className="w-4 h-4 text-[#181022]" />
              </div>
              <span className="text-[10px] animate-pulse">✨</span>
            </div>
          </div>

          {/* The Liquid Gradient Progress Bar Track */}
          <div className="relative h-3 sm:h-3.5 w-full rounded-full bg-black/40 border-[0.5px] border-white/10 p-0.5 overflow-hidden shadow-inner">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#a855f7] via-[#f472b6] to-[#faedd9] relative transition-all duration-300 ease-out shadow-[0_0_15px_rgba(250,237,217,0.5)]"
              style={{ width: `${Math.min(100, progress)}%` }}
            >
              {/* Animated liquid light beam passing through the bar */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/45 to-transparent animate-shimmer-slide" />
              {/* Glowing sparkler head orb at the tip */}
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-white shadow-[0_0_8px_#ffffff,0_0_16px_#faedd9]" />
            </div>
          </div>
        </div>

        {/* STEP MILESTONES PIPELINE */}
        <div className="space-y-2.5">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            const isDone = progress >= step.threshold;
            const isCurrent = currentStepIndex === idx;

            return (
              <div
                key={idx}
                className={`flex items-center gap-3.5 p-3 sm:p-3.5 rounded-2xl transition-all duration-300 border-[0.5px] ${
                  isDone
                    ? 'bg-white/[0.05] border-[#faedd9]/25 text-[#fffdfa]'
                    : isCurrent
                    ? 'bg-white/[0.08] border-[#faedd9]/40 shadow-sm text-[#fffdfa]'
                    : 'bg-white/[0.02] border-white/[0.04] text-[#c4b5fd]/40 opacity-55'
                }`}
              >
                {/* Step Status Icon */}
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-all ${
                    isDone
                      ? 'bg-[#faedd9] text-[#181022] shadow-md shadow-[#faedd9]/20 scale-105'
                      : isCurrent
                      ? 'bg-purple-500/20 text-[#faedd9] border border-[#faedd9]/40 animate-pulse'
                      : 'bg-white/[0.04] text-[#c4b5fd]/40'
                  }`}
                >
                  {isDone ? (
                    <CheckCircle2 className="w-5 h-5 text-[#181022]" />
                  ) : (
                    <Icon className="w-4 h-4" />
                  )}
                </div>

                {/* Step Text Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs sm:text-sm font-bold block truncate ${
                        isDone || isCurrent ? 'text-[#fffdfa]' : 'text-[#c4b5fd]/60'
                      }`}
                    >
                      {step.title}
                    </span>
                    {isDone && (
                      <span className="text-[10px] font-bold text-[#faedd9] uppercase tracking-wider">
                        Selesai
                      </span>
                    )}
                    {isCurrent && !isDone && (
                      <span className="text-[10px] font-bold text-[#d8b4fe] animate-pulse">
                        Memproses...
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] sm:text-xs text-[#faedd9]/65 truncate">
                    {step.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
