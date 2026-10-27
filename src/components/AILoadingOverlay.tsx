import React, { useEffect, useState } from 'react';
import { GeneratingLoader } from './GeneratingLoader';

interface AILoadingOverlayProps {
  isOpen: boolean;
}

export const AILoadingOverlay: React.FC<AILoadingOverlayProps> = ({ isOpen }) => {
  const [progress, setProgress] = useState<number>(0);

  const loadingMessages = [
    'Menganalisis instruksi pengiriman...',
    'Memvalidasi BL number, PO & tujuan...',
    'Menyusun dokumen surat jalan...',
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

  const currentMessage =
    progress < 40
      ? loadingMessages[0]
      : progress < 75
      ? loadingMessages[1]
      : loadingMessages[2];

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center p-6 backdrop-blur-2xl animate-fade-in select-none transition-colors duration-300"
      style={{ backgroundColor: 'var(--loader-overlay-bg, rgba(18, 10, 27, 0.92))' }}
    >
      {/* Dynamic ambient radial blur matched to active theme */}
      <div
        className="absolute w-[420px] h-[420px] rounded-full blur-[130px] pointer-events-none animate-pulse transition-all duration-300"
        style={{
          background: `radial-gradient(circle, var(--loader-ambient-from) 0%, var(--loader-ambient-via) 50%, var(--loader-ambient-to) 100%)`,
        }}
      />

      {/* Center content: theme-adaptive circular loader and loading text */}
      <div className="relative z-10 flex flex-col items-center text-center">
        <GeneratingLoader />

        <div className="mt-6 flex flex-col items-center">
          <p
            key={currentMessage}
            className="text-sm sm:text-base font-semibold tracking-wide animate-fade-in transition-colors duration-300"
            style={{ color: 'var(--loader-subtext, var(--app-text-main))' }}
          >
            {currentMessage}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AILoadingOverlay;
