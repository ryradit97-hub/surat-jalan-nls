import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  CheckCircle2,
  Printer,
  FileDown,
  ArrowRight,
  X,
  MapPin,
  Calendar,
  Truck,
  Flame,
  Layers,
  FileText,
  MessageSquare
} from 'lucide-react';
import { SuratJalanData } from '../types/suratJalan';

interface SuccessCelebrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  documents: SuratJalanData[];
  currentDocId: string;
  onSelectDoc: (id: string) => void;
  onPrint: () => void;
  onDownloadPdf: () => void;
  onDownloadBatchPdf?: () => void;
  onPrintAllBatch?: () => void;
  onOpenWhatsApp?: () => void;
}

export const triggerFireworks = () => {
  // Firework burst 1: Left cannon
  confetti({
    particleCount: 90,
    angle: 60,
    spread: 80,
    origin: { x: 0.08, y: 0.9 },
    colors: ['#d8b4fe', '#faedd9', '#f472b6', '#a855f7', '#ffffff', '#fbbf24'],
    zIndex: 99999,
  });

  // Firework burst 2: Right cannon
  confetti({
    particleCount: 90,
    angle: 120,
    spread: 80,
    origin: { x: 0.92, y: 0.9 },
    colors: ['#d8b4fe', '#faedd9', '#f472b6', '#a855f7', '#ffffff', '#fbbf24'],
    zIndex: 99999,
  });

  // Sky rockets simulation across preview screen
  const duration = 2.8 * 1000;
  const animationEnd = Date.now() + duration;
  const defaults = { startVelocity: 35, spread: 360, ticks: 60, zIndex: 99999 };

  function randomInRange(min: number, max: number) {
    return Math.random() * (max - min) + min;
  }

  const interval: any = setInterval(() => {
    const timeLeft = animationEnd - Date.now();
    if (timeLeft <= 0) {
      return clearInterval(interval);
    }
    const particleCount = 45 * (timeLeft / duration);
    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.15, 0.45), y: Math.random() - 0.2 },
      colors: ['#d8b4fe', '#faedd9', '#f472b6', '#a855f7', '#fffdfa', '#fbbf24'],
    });
    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.55, 0.85), y: Math.random() - 0.2 },
      colors: ['#d8b4fe', '#faedd9', '#f472b6', '#a855f7', '#fffdfa', '#fbbf24'],
    });
  }, 220);
};

export const SuccessCelebrationModal: React.FC<SuccessCelebrationModalProps> = ({
  isOpen,
  onClose,
  documents,
  currentDocId,
  onSelectDoc,
  onPrint,
  onDownloadPdf,
  onDownloadBatchPdf,
  onPrintAllBatch,
  onOpenWhatsApp,
}) => {
  useEffect(() => {
    if (isOpen) {
      // Trigger fireworks across preview screen
      triggerFireworks();
    }
  }, [isOpen]);

  if (!isOpen || documents.length === 0) return null;

  const isMulti = documents.length > 1;
  const activeDoc = documents.find((d) => d.id === currentDocId) || documents[0];
  const firstItem = activeDoc.items[0];

  const formatWeight = (w?: string, fallback = '20000') => {
    const raw = (w || fallback).trim().replace(/\s*kgs?\b/gi, '').trim();
    return `${raw} KGS`;
  };

  const handleClose = () => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    onClose();
  };

  return (
    /* Soft dimmed backdrop container so the white A4 preview behind never bleeds through */
    <div
      onClick={handleClose}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4 bg-[#120b1d]/75 backdrop-blur-md animate-fade-in"
    >
      {/* Soft, opaque, low-contrast modal card */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="theme-celebration-modal relative z-10 pointer-events-auto max-w-xl w-full rounded-[28px] sm:rounded-[34px] p-5 sm:p-6 bg-[#231733] text-[#f3ecf8] shadow-[0_24px_60px_rgba(10,5,18,0.6)] border border-[#d8b4fe]/20 overflow-hidden"
      >
        {/* Close Button Top Right */}
        <button
          type="button"
          onClick={handleClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-xl flex items-center justify-center bg-[#2f2042] hover:bg-[#3b2954] border border-[#d8b4fe]/15 text-[#c4b5fd]/80 hover:text-[#f3ecf8] transition-all cursor-pointer"
          title="Tutup Modal"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Celebration Header */}
        <div className="flex items-center gap-3.5 mb-4 pr-8">
          <div className="w-11 h-11 rounded-2xl bg-[#312147] border border-[#d8b4fe]/25 flex items-center justify-center shrink-0">
            {isMulti ? (
              <Layers className="w-5 h-5 text-[#d8b4fe]" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-[#d8b4fe]" />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#312147] border border-[#d8b4fe]/20 text-[#e9d5ff] text-[11px] font-medium mb-1">
              <Sparkles className="w-3 h-3 text-[#d8b4fe]" />
              <span>
                {isMulti ? `Batch ${documents.length} Surat Jalan` : 'Dokumen Resmi Terbit'}
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-[#f5efe6] tracking-tight leading-tight truncate">
              {isMulti
                ? `🎉 ${documents.length} Surat Jalan Berhasil Dibuat!`
                : 'Surat Jalan Berhasil Dibuat! 🎉'}
            </h3>
            <p className="text-[11px] sm:text-xs text-[#c4b5fd]/75 truncate mt-0.5">
              {isMulti
                ? 'Semua surat jalan telah tersusun dalam tab Chrome terpisah di atas.'
                : 'Dokumen A4 standar NLS telah diformat dan siap digunakan.'}
            </p>
          </div>
        </div>

        {/* MULTI-DOCUMENT TAB LIST CAROUSEL (If user created > 1 Surat Jalan) */}
        {isMulti && (
          <div className="mb-4">
            <span className="text-[10.5px] font-semibold text-[#c4b5fd]/75 uppercase tracking-wider block mb-2">
              Daftar Tab Surat Jalan:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-white/15">
              {documents.map((doc, idx) => {
                const isSelected = doc.id === activeDoc.id;
                const it = doc.items[0];
                return (
                  <button
                    key={doc.id}
                    type="button"
                    onClick={() => onSelectDoc(doc.id)}
                    className={`text-left p-2.5 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#36244f] border-[#d8b4fe]/45 shadow-sm'
                        : 'bg-[#1b1128]/80 border-[#d8b4fe]/12 hover:bg-[#2a1c3d] hover:border-[#d8b4fe]/25'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-[#463066] text-[#e9d5ff] font-mono">
                        Tab #{idx + 1}
                      </span>
                      <span className="text-[10px] font-mono text-[#c4b5fd]/75 truncate max-w-[85px]">
                        {doc.blNumber || 'Draft'}
                      </span>
                    </div>
                    <span className="text-xs font-semibold text-[#f5efe6] block truncate">
                      {it?.description || 'Kargo'}
                    </span>
                    <span className="text-[10.5px] text-[#c4b5fd]/75 block truncate mt-0.5">
                      {formatWeight(it?.weightKg, '20000')}{it?.remarks ? ` • ${it.remarks}` : ''}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* SUMMARY CARD OF ACTIVE DOCUMENT */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-[#1b1128]/85 border border-[#d8b4fe]/15 mb-4 space-y-2.5">
          <div className="flex items-start gap-2">
            <MapPin className="w-3.5 h-3.5 text-[#d8b4fe] shrink-0 mt-0.5" />
            <div className="min-w-0 flex-1">
              <span className="text-[10px] font-semibold text-[#c4b5fd]/65 uppercase tracking-wider block">
                Tujuan Pengiriman
              </span>
              <span className="text-xs font-semibold text-[#f5efe6] block truncate mt-0.5">
                {activeDoc.deliveryAddress || 'Terminal Peti Kemas Koja (UTC3)'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#d8b4fe]/10">
            <div>
              <span className="text-[9.5px] font-semibold text-[#c4b5fd]/65 uppercase tracking-wider block">
                No. B/L
              </span>
              <span className="text-xs font-semibold text-[#e9d5ff] font-mono block truncate mt-0.5">
                {activeDoc.blNumber || '-'}
              </span>
            </div>
            <div>
              <span className="text-[9.5px] font-semibold text-[#c4b5fd]/65 uppercase tracking-wider block">
                No. P/O
              </span>
              <span className="text-xs font-semibold text-[#e9d5ff] font-mono block truncate mt-0.5">
                {activeDoc.poNumber || '-'}
              </span>
            </div>
            <div>
              <span className="text-[9.5px] font-semibold text-[#c4b5fd]/65 uppercase tracking-wider block">
                Berat & Keterangan
              </span>
              <span className="text-xs font-semibold text-[#f5efe6] block truncate mt-0.5">
                {formatWeight(firstItem?.weightKg, '22000')}
              </span>
            </div>
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div className="space-y-2.5">
          {/* Multi-Batch Export Highlights */}
          {isMulti && onDownloadBatchPdf && (
            <div className="p-3 rounded-2xl bg-[#2c1d42] border border-[#d8b4fe]/20 flex flex-col sm:flex-row items-center justify-between gap-2.5">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#d8b4fe]" />
                <span className="text-xs font-semibold text-[#f5efe6]">
                  Ekspor Batch {documents.length} Surat Jalan:
                </span>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => {
                    handleClose();
                    onDownloadBatchPdf();
                  }}
                  className="flex-1 sm:flex-initial px-3.5 py-1.5 rounded-xl text-xs font-semibold text-[#f5efe6] bg-[#48326b] hover:bg-[#563d7f] border border-[#d8b4fe]/30 transition-all cursor-pointer active:scale-95"
                  title="Download semua surat jalan (1 file PDF terpisah per surat jalan)"
                >
                  Download Semua PDF ({documents.length} File)
                </button>
                {onPrintAllBatch && (
                  <button
                    type="button"
                    onClick={() => {
                      handleClose();
                      onPrintAllBatch();
                    }}
                    className="flex-1 sm:flex-initial px-3 py-1.5 rounded-xl text-xs font-medium text-[#e9d5ff] bg-[#36244f] hover:bg-[#422c60] border border-[#d8b4fe]/20 transition-all cursor-pointer active:scale-95"
                    title="Cetak seluruh surat jalan sekaligus"
                  >
                    Cetak Semua
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Primary Button: Open & Preview */}
          <button
            type="button"
            onClick={handleClose}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-5 rounded-2xl text-xs sm:text-sm font-semibold text-[#f5efe6] bg-[#3d295a] hover:bg-[#4a326d] border border-[#d8b4fe]/30 transition-all cursor-pointer group"
          >
            <span>{isMulti ? 'Tampilkan Dokumen di Preview' : 'Tutup & Lihat Preview A4'}</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#d8b4fe] group-hover:translate-x-1 transition-transform" />
          </button>

          {/* Secondary Buttons: Direct Print & Download PDF for active doc */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                handleClose();
                setTimeout(() => onPrint(), 250);
              }}
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-semibold text-[#e9d5ff] bg-[#2c1d42] hover:bg-[#36244f] border border-[#d8b4fe]/15 hover:border-[#d8b4fe]/30 transition-all cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-[#d8b4fe]" />
              <span>Cetak Tab Aktif</span>
            </button>

            <button
              type="button"
              onClick={() => {
                handleClose();
                setTimeout(() => onDownloadPdf(), 250);
              }}
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-semibold text-[#e9d5ff] bg-[#2c1d42] hover:bg-[#36244f] border border-[#d8b4fe]/15 hover:border-[#d8b4fe]/30 transition-all cursor-pointer"
            >
              <FileDown className="w-3.5 h-3.5 text-[#d8b4fe]" />
              <span>Download Tab Ini</span>
            </button>
          </div>

          {/* WhatsApp Direct Share Button */}
          {onOpenWhatsApp && (
            <button
              type="button"
              onClick={() => {
                handleClose();
                setTimeout(() => onOpenWhatsApp(), 200);
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold text-[#d1fae5] bg-[#1d3b35] hover:bg-[#244840] border border-[#34d399]/25 transition-all cursor-pointer active:scale-98"
            >
              <MessageSquare className="w-3.5 h-3.5 text-[#6ee7b7]" />
              <span>
                {isMulti
                  ? `Kirim Semua (${documents.length}) PDF ke WhatsApp`
                  : 'Kirim PDF ke WhatsApp'}
              </span>
            </button>
          )}

          {/* Re-trigger Fireworks Button */}
          <div className="pt-1 text-center">
            <button
              type="button"
              onClick={() => triggerFireworks()}
              className="inline-flex items-center gap-1 text-[11px] text-[#c4b5fd]/70 hover:text-[#e9d5ff] hover:underline cursor-pointer transition-colors"
            >
              <Flame className="w-3 h-3 text-[#f472b6]/80" />
              <span>🎆 Letupkan kembang api lagi di atas preview</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
