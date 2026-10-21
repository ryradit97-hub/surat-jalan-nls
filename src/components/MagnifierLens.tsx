import React, { useState, useEffect, useRef } from 'react';
import { SuratJalanData } from '../types/suratJalan';
import { SuratJalanPreview } from './SuratJalanPreview';
import { X, Search } from 'lucide-react';

interface MagnifierLensProps {
  isActive: boolean;
  targetRef: React.RefObject<HTMLDivElement | null>;
  containerRef: React.RefObject<HTMLDivElement | null>;
  zoomLevel: number;
  data: SuratJalanData;
  onClose: () => void;
}

export const MagnifierLens: React.FC<MagnifierLensProps> = ({
  isActive,
  targetRef,
  containerRef,
  zoomLevel,
  data,
  onClose,
}) => {
  const [lensState, setLensState] = useState<{
    visible: boolean;
    screenX: number;
    screenY: number;
    relX: number;
    relY: number;
  }>({
    visible: false,
    screenX: 0,
    screenY: 0,
    relX: 0,
    relY: 0,
  });

  const lensSize = 150; // diameter of the magnifying glass
  const magnification = 2.2; // 220% zoom inside the lens

  useEffect(() => {
    if (!isActive) {
      setLensState((prev) => ({ ...prev, visible: false }));
      return;
    }

    const container = containerRef.current;
    if (!container) return;

    const handlePointer = (e: PointerEvent) => {
      const target = targetRef.current;
      if (!target) return;

      const rect = target.getBoundingClientRect();
      const currentScale = zoomLevel / 100;

      // Check if pointer is near the target document
      const clientX = e.clientX;
      const clientY = e.clientY;

      if (
        clientX >= rect.left - 20 &&
        clientX <= rect.right + 20 &&
        clientY >= rect.top - 20 &&
        clientY <= rect.bottom + 20
      ) {
        // Calculate relative position inside unscaled document
        const relX = Math.max(0, Math.min(rect.width / currentScale, (clientX - rect.left) / currentScale));
        const relY = Math.max(0, Math.min(rect.height / currentScale, (clientY - rect.top) / currentScale));

        setLensState({
          visible: true,
          screenX: clientX,
          screenY: clientY,
          relX,
          relY,
        });
      } else {
        setLensState((prev) => ({ ...prev, visible: false }));
      }
    };

    const handlePointerEnd = () => {
      // Keep visible on desktop mouse move, fade out on touch release
      if ('ontouchstart' in window) {
        setLensState((prev) => ({ ...prev, visible: false }));
      }
    };

    window.addEventListener('pointermove', handlePointer, { passive: true });
    window.addEventListener('pointerdown', handlePointer, { passive: true });
    window.addEventListener('pointerup', handlePointerEnd, { passive: true });
    window.addEventListener('pointercancel', handlePointerEnd, { passive: true });

    return () => {
      window.removeEventListener('pointermove', handlePointer);
      window.removeEventListener('pointerdown', handlePointer);
      window.removeEventListener('pointerup', handlePointerEnd);
      window.removeEventListener('pointercancel', handlePointerEnd);
    };
  }, [isActive, targetRef, containerRef, zoomLevel]);

  if (!isActive) return null;

  // Offset lens vertically above touch/cursor so finger doesn't obscure the view
  const offsetDistance = 80;
  let lensLeft = lensState.screenX - lensSize / 2;
  let lensTop = lensState.screenY - lensSize - offsetDistance;

  // Clamp lens within screen boundaries
  if (typeof window !== 'undefined') {
    lensLeft = Math.max(10, Math.min(window.innerWidth - lensSize - 10, lensLeft));
    // If too close to top edge, place lens below finger
    if (lensTop < 60) {
      lensTop = lensState.screenY + offsetDistance;
    }
  }

  return (
    <>
      {/* Floating active helper banner at bottom of preview container */}
      <div className="absolute bottom-3 inset-x-3 z-40 flex items-center justify-between px-3.5 py-2 rounded-2xl bg-stone-900/90 text-stone-100 border border-amber-400/30 shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-bottom-2 duration-200">
        <div className="flex items-center gap-2 text-xs">
          <div className="w-6 h-6 rounded-lg bg-amber-400/20 text-amber-300 flex items-center justify-center shrink-0">
            <Search className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="font-bold text-amber-300 block text-[11px] sm:text-xs">
              Kaca Pembesar Aktif (2.2x)
            </span>
            <span className="text-[10px] text-stone-300 leading-none">
              Sentuh atau arahkan kursor ke dokumen untuk memperbesar
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 active:scale-95 text-white transition-all cursor-pointer border border-white/10"
        >
          <X className="w-3 h-3" />
          <span>Tutup</span>
        </button>
      </div>

      {/* Floating Magnifier Glass Loupe */}
      {lensState.visible && (
        <div
          className="fixed pointer-events-none z-50 rounded-full shadow-[0_20px_60px_rgba(0,0,0,0.6)] overflow-hidden transition-opacity duration-100"
          style={{
            width: `${lensSize}px`,
            height: `${lensSize}px`,
            left: `${lensLeft}px`,
            top: `${lensTop}px`,
            border: '3px solid rgba(255, 255, 255, 0.95)',
            boxShadow: '0 15px 40px rgba(0, 0, 0, 0.45), inset 0 0 12px rgba(0, 0, 0, 0.25)',
            backgroundColor: '#ffffff',
          }}
        >
          {/* Inner Magnified Document Render */}
          <div
            style={{
              position: 'absolute',
              left: `${lensSize / 2 - lensState.relX * magnification}px`,
              top: `${lensSize / 2 - lensState.relY * magnification}px`,
              width: '210mm',
              transform: `scale(${magnification})`,
              transformOrigin: 'top left',
              pointerEvents: 'none',
              backgroundColor: '#ffffff',
            }}
          >
            <SuratJalanPreview data={data} />
          </div>

          {/* Central Alignment Reticle Dot */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-2.5 h-2.5 rounded-full border border-amber-500/60 bg-amber-400/20 shadow-sm" />
          </div>

          {/* Glass Highlight Reflection Ring */}
          <div className="absolute inset-0 rounded-full border border-white/40 pointer-events-none shadow-[inset_0_2px_4px_rgba(255,255,255,0.6)]" />
        </div>
      )}
    </>
  );
};
