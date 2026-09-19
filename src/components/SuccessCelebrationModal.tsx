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

  return (
    /* Floating non-blocking container over the preview screen */
    <div className="fixed inset-0 z-50 pointer-events-none flex flex-col items-center justify-start pt-10 sm:pt-14 px-4 animate-fade-in">
      {/* Subtle translucent ambient light */}
      <div className="absolute w-[500px] h-[350px] bg-[#a855f7]/20 rounded-full blur-[120px] pointer-events-none" />

      {/* Floating Liquid Modal Dialogue (Allows preview screen to remain visible in background) */}
      <div className="relative z-10 pointer-events-auto max-w-xl w-full rounded-[32px] sm:rounded-[40px] p-5 sm:p-7 liquid-hero-glass shadow-[0_25px_80px_rgba(0,0,0,0.65)] border-[0.5px] border-white/25 overflow-hidden">
        {/* Specular hairline top reflection line */}
        <div className="absolute inset-x-12 top-0 h-[0.5px] bg-gradient-to-r from-transparent via-white/50 to-transparent pointer-events-none" />
        <div className="absolute -top-28 -left-28 w-64 h-64 bg-gradient-to-br from-white/15 via-[#d8b4fe]/10 to-transparent rounded-full blur-3xl pointer-events-none" />

        {/* Close Button Top Right */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-xl flex items-center justify-center bg-white/[0.06] hover:bg-white/[0.14] border border-white/10 text-[#c4b5fd]/80 hover:text-white transition-all cursor-pointer backdrop-blur-md"
          title="Tutup Modal"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Celebration Header */}
        <div className="flex items-center gap-3.5 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#f472b6] via-[#d8b4fe] to-[#faedd9] p-0.5 shadow-lg shadow-purple-500/25 shrink-0">
            <div className="w-full h-full bg-[#1c102c] rounded-[14px] flex items-center justify-center">
              {isMulti ? (
                <Layers className="w-6 h-6 text-[#faedd9] animate-bounce" />
              ) : (
                <CheckCircle2 className="w-6 h-6 text-[#faedd9] animate-bounce" />
              )}
            </div>
          </div>

          <div className="min-w-0 flex-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/[0.08] border border-[#faedd9]/25 text-[#faedd9] text-[11px] font-semibold mb-1">
              <Sparkles className="w-3 h-3 text-[#d8b4fe]" />
              <span>
                {isMulti ? `Batch ${documents.length} Surat Jalan` : 'Dokumen Resmi Terbit'}
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-black text-[#fffdfa] tracking-tight leading-tight truncate">
              {isMulti
                ? `🎉 ${documents.length} Surat Jalan Berhasil Dibuat!`
                : 'Surat Jalan Berhasil Dibuat! 🎉'}
            </h3>
            <p className="text-[11px] sm:text-xs text-[#faedd9]/75 truncate">
              {isMulti
                ? 'Semua surat jalan telah tersusun dalam tab Chrome terpisah di atas.'
                : 'Dokumen A4 standar NLS telah diformat dan siap digunakan.'}
            </p>
          </div>
        </div>

        {/* MULTI-DOCUMENT TAB LIST CAROUSEL (If user created > 1 Surat Jalan) */}
        {isMulti && (
          <div className="mb-4">
            <span className="text-[10.5px] font-bold text-[#faedd9]/70 uppercase tracking-wider block mb-2">
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
                        ? 'bg-white/[0.12] border-[#faedd9]/50 shadow-md ring-1 ring-[#faedd9]/30'
                        : 'bg-white/[0.03] border-white/[0.06] hover:bg-white/[0.07] hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-[#faedd9]/20 text-[#faedd9] font-mono">
                        Tab #{idx + 1}
                      </span>
                      <span className="text-[10px] font-mono text-[#c4b5fd]/80 truncate max-w-[80px]">
                        {doc.blNumber || 'Draft'}
                      </span>
                    </div>
                    <span className="text-xs font-bold text-[#fffdfa] block truncate">
                      {it?.description || 'Kargo'}
                    </span>
                    <span className="text-[10.5px] text-[#faedd9]/70 block truncate">
                      {it?.weightKg || '20000'} KGS • {it?.remarks || '1x40'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* SUMMARY CARD OF ACTIVE DOCUMENT */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-white/[0.03] border-[0.5px] border-white/[0.08] shadow-[inset_0_1px_2px_rgba(255,255,255,0.06)] mb-4 space-y-2.5">
          <div className="flex items-start gap-2">
            <MapPin className="w-3.5 h-3.5 text-[#d8b4fe] shrink-0 mt-0.5" />
            <div className="min-w-0 flex-1">
              <span className="text-[10px] font-semibold text-[#faedd9]/60 uppercase tracking-wider block">
                Tujuan Pengiriman
              </span>
              <span className="text-xs font-bold text-[#fffdfa] block truncate">
                {activeDoc.deliveryAddress || 'Terminal Peti Kemas Koja (UTC3)'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/[0.06]">
            <div>
              <span className="text-[9.5px] font-semibold text-[#faedd9]/60 uppercase tracking-wider block">
                No. B/L
              </span>
              <span className="text-xs font-bold text-[#faedd9] font-mono block truncate">
                {activeDoc.blNumber || '-'}
              </span>
            </div>
            <div>
              <span className="text-[9.5px] font-semibold text-[#faedd9]/60 uppercase tracking-wider block">
                No. P/O
              </span>
              <span className="text-xs font-bold text-[#faedd9] font-mono block truncate">
                {activeDoc.poNumber || '-'}
              </span>
            </div>
            <div>
              <span className="text-[9.5px] font-semibold text-[#faedd9]/60 uppercase tracking-wider block">
                Berat & Keterangan
              </span>
              <span className="text-xs font-bold text-[#fffdfa] block truncate">
                {firstItem?.weightKg || '22000'} KGS
              </span>
            </div>
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div className="space-y-2.5">
          {/* Multi-Batch Export Highlights */}
          {isMulti && onDownloadBatchPdf && (
            <div className="p-3 rounded-2xl bg-gradient-to-r from-purple-500/15 via-[#faedd9]/10 to-purple-500/15 border border-[#faedd9]/30 flex flex-col sm:flex-row items-center justify-between gap-2.5 shadow-sm">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#faedd9]" />
                <span className="text-xs font-bold text-[#fffdfa]">
                  Ekspor Batch {documents.length} Surat Jalan:
                </span>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onDownloadBatchPdf();
                  }}
                  className="flex-1 sm:flex-initial px-3.5 py-1.5 rounded-xl text-xs font-black text-[#181022] bg-gradient-to-r from-[#faedd9] to-[#fff7ed] hover:shadow-md transition-all cursor-pointer shadow-sm active:scale-95"
                  title="Download semua surat jalan (1 file PDF terpisah per surat jalan)"
                >
                  Download Semua PDF ({documents.length} File)
                </button>
                {onPrintAllBatch && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onPrintAllBatch();
                    }}
                    className="flex-1 sm:flex-initial px-3 py-1.5 rounded-xl text-xs font-semibold text-[#faedd9] bg-white/[0.08] hover:bg-white/[0.16] border border-white/10 transition-all cursor-pointer active:scale-95"
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
            onClick={onClose}
            className="w-full flex items-center justify-center gap-2 py-3 px-5 rounded-2xl text-xs sm:text-sm font-black text-[#181022] bg-gradient-to-r from-[#faedd9] via-[#fff7ed] to-[#faedd9] hover:shadow-[0_10px_30px_rgba(250,237,217,0.4)] hover:scale-[1.01] active:scale-[0.98] transition-all cursor-pointer shadow-md group"
          >
            <span>{isMulti ? 'Tampilkan Dokumen di Preview ➔' : 'Tutup & Lihat Preview A4 ➔'}</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#7e22ce] group-hover:translate-x-1.5 transition-transform" />
          </button>

          {/* Secondary Buttons: Direct Print & Download PDF for active doc */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                onClose();
                setTimeout(() => onPrint(), 250);
              }}
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-bold text-[#faedd9] bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 hover:border-[#faedd9]/30 backdrop-blur-md transition-all cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-[#d8b4fe]" />
              <span>Cetak Tab Aktif</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onClose();
                setTimeout(() => onDownloadPdf(), 250);
              }}
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-bold text-[#faedd9] bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 hover:border-[#faedd9]/30 backdrop-blur-md transition-all cursor-pointer"
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
                onClose();
                setTimeout(() => onOpenWhatsApp(), 200);
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-emerald-600 via-emerald-500 to-emerald-600 hover:from-emerald-500 hover:to-emerald-400 border border-emerald-400/40 shadow-[0_4px_16px_rgba(16,185,129,0.25)] hover:shadow-emerald-500/40 transition-all cursor-pointer active:scale-98"
            >
              <MessageSquare className="w-3.5 h-3.5 text-emerald-100" />
              <span>
                {isMulti
                  ? `Kirim Semua (${documents.length}) PDF ke WhatsApp Supir 💬`
                  : 'Kirim PDF ke WhatsApp Supir 💬'}
              </span>
            </button>
          )}

          {/* Re-trigger Fireworks Button */}
          <div className="pt-1 text-center">
            <button
              type="button"
              onClick={() => triggerFireworks()}
              className="inline-flex items-center gap-1 text-[11px] text-[#d8b4fe]/80 hover:text-[#faedd9] hover:underline cursor-pointer transition-colors"
            >
              <Flame className="w-3 h-3 text-[#f472b6]" />
              <span>🎆 Letupkan kembang api lagi di atas preview</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
