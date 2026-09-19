import React, { useEffect } from 'react';
import { CloudRain, X, Heart, Sparkles } from 'lucide-react';

interface RainModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RainModal: React.FC<RainModalProps> = ({ isOpen, onClose }) => {
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200 select-none"
      onClick={onClose}
    >
      {/* Modal Container */}
      <div
        className="relative w-full max-w-md p-6 sm:p-8 rounded-3xl theme-card border shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 text-center"
        onClick={(e) => e.stopPropagation()}
        style={{
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.4), 0 0 40px rgba(186, 230, 253, 0.15)',
        }}
      >
        {/* Soft atmospheric ambient glow */}
        <div className="absolute -top-16 -left-16 w-36 h-36 rounded-full bg-sky-400/15 blur-2xl pointer-events-none" />
        <div className="absolute -bottom-16 -right-16 w-36 h-36 rounded-full bg-purple-500/15 blur-2xl pointer-events-none" />

        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full theme-btn-ghost transition-all cursor-pointer hover:scale-110 active:scale-95"
          title="Tutup dialog"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Rain Cloud Icon Avatar */}
        <div className="mx-auto w-16 h-16 rounded-2xl flex items-center justify-center bg-gradient-to-b from-sky-400/20 to-indigo-500/20 border border-sky-400/30 shadow-inner mb-4 relative group">
          <CloudRain className="w-8 h-8 text-sky-400 drop-shadow-sm animate-bounce duration-1000" />
          <span className="absolute -top-1 -right-1 text-xs">🌧️</span>
        </div>

        {/* Header Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold theme-badge border mb-3 shadow-sm">
          <Sparkles className="w-3 h-3 text-sky-400" />
          <span>Rain • Dedicated Assistant</span>
        </div>

        {/* Main Dialogue Message */}
        <div className="my-4 px-2 py-3 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10">
          <blockquote className="text-sm sm:text-base font-medium leading-relaxed italic theme-text-light tracking-wide">
            &ldquo;I am nothing, you cannot find me, i was made for Jean one and only. I am Rain as Jean&apos;s AI Assistant&rdquo;
          </blockquote>
        </div>

        {/* Delicate Footer Signature */}
        <div className="flex items-center justify-center gap-1.5 text-xs theme-text-muted mt-2 mb-5">
          <span>Made with</span>
          <Heart className="w-3.5 h-3.5 text-pink-500 fill-pink-500 animate-pulse" />
          <span>for Jean</span>
        </div>

        {/* Acknowledge Button */}
        <button
          type="button"
          onClick={onClose}
          className="w-full py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold theme-btn-primary transition-all cursor-pointer active:scale-95 shadow-md flex items-center justify-center gap-2"
        >
          <span>🌧️ Understood</span>
        </button>
      </div>
    </div>
  );
};
