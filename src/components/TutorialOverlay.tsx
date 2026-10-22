import React, { useState, useEffect, useCallback } from 'react';
import {
  Sparkles,
  Sliders,
  FileText,
  Mic,
  ArrowRight,
  ArrowLeft,
  X,
  Check,
  Package,
  Truck,
  Eye,
  MessageSquare,
  HelpCircle,
} from 'lucide-react';

export interface TourStep {
  targetId: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  position?: 'top' | 'bottom' | 'auto';
  actionLabel?: string;
  onAction?: () => void;
}

interface TutorialOverlayProps {
  isOpen: boolean;
  onClose: (dontShowAgain?: boolean) => void;
  onGoToPrompt?: () => void;
  onGoToManual?: () => void;
  currentScreen?: 'hero-prompt' | 'studio';
}

export const TutorialOverlay: React.FC<TutorialOverlayProps> = ({
  isOpen,
  onClose,
  onGoToPrompt,
  onGoToManual,
  currentScreen = 'hero-prompt',
}) => {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [dontShowAgain, setDontShowAgain] = useState<boolean>(true);
  const [spotlightRect, setSpotlightRect] = useState<{
    top: number;
    left: number;
    width: number;
    height: number;
  } | null>(null);

  // TOUR STEPS FOR PROMPT SCREEN (HERO PROMPT)
  const promptSteps: TourStep[] = [
    {
      targetId: 'tour-prompt-textarea',
      title: 'Area Input Kalimat Prompt',
      description:
        'Ketik atau tempel rincian pengiriman dengan bahasa sehari-hari. Cantumkan nomor BL, PO, tujuan gudang/pelabuhan, nama barang, dan berat kargo.',
      icon: <Sparkles className="w-4 h-4 text-purple-300" />,
    },
    {
      targetId: 'tour-mic-btn',
      title: 'Dikte Suara (Mikrofon)',
      description:
        'Tidak perlu mengetik di keyboard! Klik tombol mikrofon ini dan sebutkan data pengiriman dalam Bahasa Indonesia. Suara Anda akan otomatis diubah menjadi teks.',
      icon: <Mic className="w-4 h-4 text-rose-300" />,
    },
    {
      targetId: 'tour-paraphrase-btn',
      title: 'Parafrase Kata AI',
      description:
        'Gunakan tombol ini untuk merapikan kalimat yang berantakan atau singkatan tidak baku menjadi format instruksi logistik yang terstruktur rapi.',
      icon: <Sparkles className="w-4 h-4 text-purple-300" />,
    },
    {
      targetId: 'tour-submit-btn',
      title: 'Tombol Buat Surat Jalan',
      description:
        'Klik di sini untuk memproses kalimat prompt. AI otomatis mengekstrak seluruh rincian dan menyusun dokumen surat jalan resmi A4 siap cetak.',
      icon: <ArrowRight className="w-4 h-4 text-emerald-300" />,
    },
    {
      targetId: 'tour-templates',
      title: 'Contoh Template Siap Pakai',
      description:
        'Pilih salah satu template contoh di bawah (format shorthand DO, rute Terminal Koja, NPCT, JICT, atau batch 4 surat jalan) untuk mencoba seketika.',
      icon: <MessageSquare className="w-4 h-4 text-amber-300" />,
    },
    {
      targetId: 'tour-manual-link',
      title: 'Beralih ke Input Manual',
      description:
        'Ingin mengisi spesifikasi detail per kolom formulir? Klik di sini untuk masuk ke ruang kerja studio dan mengisi formulir manual.',
      icon: <Sliders className="w-4 h-4 text-amber-300" />,
      actionLabel: 'Buka Input Manual ➔',
      onAction: () => {
        if (onGoToManual) onGoToManual();
      },
    },
  ];

  // TOUR STEPS FOR STUDIO SCREEN (MANUAL INPUT)
  const studioSteps: TourStep[] = [
    {
      targetId: 'tour-workflow-toggle',
      title: 'Pilihan Alur (Workflow Mode)',
      description:
        'Beralih fleksibel antara Mode Prompt Cepat (AI) dan Mode Input Manual langsung dari bilah ini tanpa kehilangan data dokumen aktif.',
      icon: <Sliders className="w-4 h-4 text-amber-300" />,
    },
    {
      targetId: 'tour-form-info',
      title: '1. Informasi Pengiriman & Tujuan',
      description:
        'Pilih alamat tujuan dari pilihan cepat terminal pelabuhan (Koja UTC3, NPCT1, JICT, dll) atau ketik manual, serta tentukan tanggal kirim, nomor BL, dan PO.',
      icon: <FileText className="w-4 h-4 text-blue-300" />,
    },
    {
      targetId: 'tour-form-shipper',
      title: '2. Shipper (Perusahaan Pengirim)',
      description:
        'Pilih nama perusahaan pengirim dari daftar preset tersimpan (PT Cotti Coffee, PT Triputra, PT Danora, dll) atau isi nama dan alamat perusahaan baru.',
      icon: <Package className="w-4 h-4 text-purple-300" />,
    },
    {
      targetId: 'tour-form-cargo',
      title: '3. Detail Barang & Kargo',
      description:
        'Kelola nama barang, ukuran kontainer (1 X 40 HC, 1 X 20 FT, dll), berat gross (KG), dan nomor seal kontainer dengan pilihan cepat 1-klik.',
      icon: <Package className="w-4 h-4 text-amber-300" />,
    },
    {
      targetId: 'tour-form-driver',
      title: '4. Pengemudi & Armada Truk',
      description:
        'Tentukan identitas supir yang bertugas, nomor kontak WhatsApp untuk pengiriman rincian, jenis armada truk, dan nomor plat kendaraan.',
      icon: <Truck className="w-4 h-4 text-emerald-300" />,
    },
    {
      targetId: 'tour-preview-toolbar',
      title: 'Live Preview, Zoom, Cetak & WhatsApp',
      description:
        'Periksa lembar cetak A4 resmi di sebelah kanan. Atur perbesaran (Zoom), geser dokumen bebas (Drag), aktifkan Kaca Pembesar di ponsel, unduh PDF resmi, cetak langsung, atau kirim rincian via WA!',
      icon: <Eye className="w-4 h-4 text-emerald-300" />,
    },
  ];

  const steps = currentScreen === 'studio' ? studioSteps : promptSteps;

  // Reset step counter on open or screen change
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0);
    }
  }, [isOpen, currentScreen]);

  // Measure and position the spotlight box
  const updateSpotlight = useCallback(() => {
    if (!isOpen) return;
    const currentItem = steps[currentStep];
    if (!currentItem) return;

    const el = document.getElementById(currentItem.targetId);
    if (el) {
      // Smoothly scroll target element into viewport center
      el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
      const rect = el.getBoundingClientRect();
      setSpotlightRect({
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
      });
    } else {
      setSpotlightRect(null);
    }
  }, [isOpen, currentStep, steps]);

  // Update spotlight on step change, resize, and scroll
  useEffect(() => {
    if (!isOpen) return;

    // Small timeout to allow any DOM transitions/scrolling to settle
    const timer = setTimeout(updateSpotlight, 120);

    const handleWindowChange = () => {
      const currentItem = steps[currentStep];
      if (!currentItem) return;
      const el = document.getElementById(currentItem.targetId);
      if (el) {
        const rect = el.getBoundingClientRect();
        setSpotlightRect({
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height,
        });
      }
    };

    window.addEventListener('resize', handleWindowChange);
    window.addEventListener('scroll', handleWindowChange, true);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', handleWindowChange);
      window.removeEventListener('scroll', handleWindowChange, true);
    };
  }, [isOpen, currentStep, updateSpotlight, steps]);

  // Handle ESC and Arrow keys
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        onClose(dontShowAgain);
      } else if (e.key === 'ArrowRight') {
        if (currentStep < steps.length - 1) {
          setCurrentStep((prev) => prev + 1);
        } else {
          onClose(dontShowAgain);
        }
      } else if (e.key === 'ArrowLeft') {
        if (currentStep > 0) {
          setCurrentStep((prev) => prev - 1);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentStep, steps.length, dontShowAgain, onClose]);

  if (!isOpen) return null;

  const currentItem = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;

  // Calculate popover positioning relative to target element
  const getPopoverStyle = (): React.CSSProperties => {
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;

    // On mobile, stick to bottom of screen with safe margin
    if (isMobile) {
      return {
        position: 'fixed',
        bottom: '16px',
        left: '12px',
        right: '12px',
        maxWidth: 'calc(100vw - 24px)',
        zIndex: 60,
      };
    }

    if (!spotlightRect) {
      return {
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 60,
      };
    }

    const popoverWidth = 380;
    const windowHeight = window.innerHeight;
    const windowWidth = window.innerWidth;

    // Check space below vs above
    const spaceBelow = windowHeight - (spotlightRect.top + spotlightRect.height + 16);
    const spaceAbove = spotlightRect.top - 16;
    const placeBelow = spaceBelow >= 220 || spaceBelow >= spaceAbove;

    let top = placeBelow
      ? spotlightRect.top + spotlightRect.height + 14
      : Math.max(16, spotlightRect.top - 240);

    // Horizontal centering relative to target, clamped to screen edges
    let left = spotlightRect.left + spotlightRect.width / 2 - popoverWidth / 2;
    if (left < 16) left = 16;
    if (left + popoverWidth > windowWidth - 16) left = windowWidth - popoverWidth - 16;

    return {
      position: 'fixed',
      top: `${top}px`,
      left: `${left}px`,
      width: `${popoverWidth}px`,
      maxWidth: 'calc(100vw - 32px)',
      zIndex: 60,
    };
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 overflow-hidden pointer-events-auto"
      onClick={() => onClose(dontShowAgain)}
    >
      {/* 1. SPOTLIGHT HOLE CUTOUT OVER ACTIVE ELEMENT */}
      {spotlightRect ? (
        <div
          className="fixed rounded-2xl pointer-events-none transition-all duration-300 ease-out z-50 border-2 border-[#faedd9]/90 shadow-[0_0_0_9999px_rgba(10,5,16,0.82),0_0_30px_rgba(250,237,217,0.35)]"
          style={{
            top: `${Math.max(0, spotlightRect.top - 8)}px`,
            left: `${Math.max(0, spotlightRect.left - 8)}px`,
            width: `${spotlightRect.width + 16}px`,
            height: `${spotlightRect.height + 16}px`,
          }}
        >
          {/* Subtle animated halo ring */}
          <span className="absolute -top-1.5 -right-1.5 flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#faedd9] opacity-75" />
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-[#faedd9]" />
          </span>
        </div>
      ) : (
        /* Fallback Backdrop if target element is not found */
        <div className="fixed inset-0 bg-[#0a0510]/80 backdrop-blur-xs" />
      )}

      {/* 2. FLOATING COACHMARK / EXPLANATION POPOVER CARD */}
      <div
        style={getPopoverStyle()}
        onClick={(e) => e.stopPropagation()}
        className="liquid-card rounded-2xl p-4 sm:p-5 shadow-2xl border border-[#faedd9]/25 bg-[#251736] animate-fade-in transition-all duration-200"
      >
        {/* Step Header (Clean, without badges) */}
        <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-[#faedd9]/12">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-[11px] font-bold text-[#faedd9] tracking-wider uppercase">
              Langkah {currentStep + 1} dari {steps.length}
            </span>
            <span className="text-[11px] text-[#faedd9]/40">•</span>
            <span className="text-[10.5px] theme-label truncate">
              {currentScreen === 'studio' ? 'Input Manual' : 'Prompt Penuh'}
            </span>
          </div>

          <button
            type="button"
            onClick={() => onClose(dontShowAgain)}
            className="w-6 h-6 rounded-lg flex items-center justify-center text-[#faedd9]/60 hover:text-white hover:bg-white/10 transition-colors cursor-pointer shrink-0"
            title="Tutup panduan (Esc)"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Feature Title & Icon */}
        <div className="flex items-start gap-2.5 mb-2">
          <div className="w-7 h-7 rounded-lg bg-[#faedd9]/15 flex items-center justify-center shrink-0 mt-0.5">
            {currentItem?.icon || <HelpCircle className="w-3.5 h-3.5 text-[#faedd9]" />}
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-[#fffdfa] leading-snug">
              {currentItem?.title}
            </h3>
          </div>
        </div>

        {/* Feature Explanation Description */}
        <p className="text-[11.5px] sm:text-xs text-[#faedd9]/85 leading-relaxed mb-4">
          {currentItem?.description}
        </p>

        {/* Optional Contextual Direct Action Button (e.g. switch screen) */}
        {currentItem?.actionLabel && currentItem?.onAction && (
          <div className="mb-3.5 pt-1">
            <button
              type="button"
              onClick={() => {
                currentItem.onAction?.();
                onClose(dontShowAgain);
              }}
              className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer theme-btn-ghost active:scale-95"
            >
              <span>{currentItem.actionLabel}</span>
            </button>
          </div>
        )}

        {/* Popover Footer: Checkbox + Navigation Controls */}
        <div className="flex items-center justify-between gap-2 pt-2.5 border-t border-[#faedd9]/10">
          <label className="flex items-center gap-1.5 cursor-pointer select-none text-[10px] theme-label">
            <input
              type="checkbox"
              checked={dontShowAgain}
              onChange={(e) => setDontShowAgain(e.target.checked)}
              className="w-3.5 h-3.5 rounded text-amber-500 border-white/30 focus:ring-0 cursor-pointer"
            />
            <span className="hidden sm:inline">Jangan tampilkan otomatis</span>
            <span className="inline sm:hidden">Jangan ulangi</span>
          </label>

          <div className="flex items-center gap-1.5">
            {currentStep > 0 && (
              <button
                type="button"
                onClick={() => setCurrentStep((prev) => Math.max(0, prev - 1))}
                className="px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer theme-btn-back active:scale-95"
              >
                <ArrowLeft className="w-3 h-3" />
              </button>
            )}

            {!isLastStep ? (
              <button
                type="button"
                onClick={() => setCurrentStep((prev) => Math.min(steps.length - 1, prev + 1))}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer theme-btn-primary active:scale-95 shadow-sm"
              >
                <span>Lanjut</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onClose(dontShowAgain)}
                className="flex items-center gap-1 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer theme-btn-primary active:scale-95 shadow-sm"
              >
                <Check className="w-3 h-3" />
                <span>Selesai</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
