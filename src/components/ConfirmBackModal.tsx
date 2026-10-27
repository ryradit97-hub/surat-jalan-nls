import React, { useEffect } from 'react';
import { AlertTriangle, X, ArrowLeft, Trash2 } from 'lucide-react';

interface ConfirmBackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const ConfirmBackModal: React.FC<ConfirmBackModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-md animate-in fade-in duration-200 select-none"
      onClick={onClose}
    >
      {/* Modal Card */}
      <div
        className="relative w-full max-w-md p-6 sm:p-7 rounded-3xl theme-card border shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 text-center"
        onClick={(e) => e.stopPropagation()}
        style={{
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.5), 0 0 35px rgba(244, 63, 94, 0.15)',
        }}
      >
        {/* Ambient warning radial glow */}
        <div className="absolute -top-16 -left-16 w-36 h-36 rounded-full bg-amber-500/15 blur-2xl pointer-events-none" />
        <div className="absolute -bottom-16 -right-16 w-36 h-36 rounded-full bg-rose-500/15 blur-2xl pointer-events-none" />

        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full theme-btn-ghost transition-all cursor-pointer hover:scale-110 active:scale-95"
          title="Tutup dialog"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Warning Icon Avatar */}
        <div className="mx-auto w-14 h-14 rounded-2xl flex items-center justify-center bg-gradient-to-b from-amber-500/20 to-rose-500/20 border border-amber-500/30 shadow-inner mb-4">
          <AlertTriangle className="w-7 h-7 text-amber-400 drop-shadow-sm animate-pulse" />
        </div>

        {/* Title & Description */}
        <h3 className="text-lg sm:text-xl font-bold theme-text-main tracking-tight mb-2">
          Kembali ke Prompt Penuh?
        </h3>
        <p className="text-xs sm:text-sm theme-text-muted leading-relaxed max-w-xs mx-auto mb-6">
          Apakah Anda yakin ingin kembali? Seluruh progres dokumen surat jalan yang sedang diedit saat ini akan dihapus.
        </p>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold theme-btn-ghost border border-white/10 hover:border-white/20 transition-all cursor-pointer active:scale-95"
          >
            Batal
          </button>

          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 shadow-md shadow-rose-500/25 transition-all cursor-pointer active:scale-95 flex items-center justify-center gap-1.5"
          >
            <Trash2 className="w-4 h-4" />
            <span>Ya, Hapus & Kembali</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmBackModal;
