import React, { useRef, useEffect } from 'react';

interface HighlightedPromptTextareaProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  minHeight?: string;
  fontSizeClass?: string;
  leadingClass?: string;
  paddingClass?: string;
  onKeyDown?: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  autoFocus?: boolean;
  className?: string;
}

// Comprehensive logistics aspect keywords (case-insensitive)
const LOGISTICS_ASPECT_KEYWORDS = [
  // Multi-word phrases first
  'delivery address',
  'delivery date',
  'arrived date',
  'discharge date',
  'bl number',
  'bl no',
  'b/l number',
  'b/l no',
  'po number',
  'po no',
  'p/o number',
  'p/o no',
  'unit type',
  'driver name',
  'phone no',
  'license plate',
  'container/seal',
  'container & seal',
  'container seal',
  'description of goods',
  'package qty',
  'gross weight',
  'net weight',
  // Indonesian multi-word
  'alamat pengiriman',
  'alamat tujuan',
  'tujuan pengiriman',
  'nomor bl',
  'nomor po',
  'nama supir',
  'nama driver',
  'nama pengemudi',
  'plat nomor',
  'no polisi',
  'no telepon',
  'no telp',
  'no hp',
  'no seal',
  'no bl',
  'no po',
  'tanggal kirim',
  'tanggal delivery',
  'deskripsi barang',
  'berat kotor',
  'berat bersih',
  // Single-word keywords
  'goods',
  'barang',
  'komoditas',
  'weight',
  'berat',
  'remarks',
  'keterangan',
  'catatan',
  'shipper',
  'pengirim',
  'customer',
  'klien',
  'driver',
  'supir',
  'pengemudi',
  'truck',
  'truk',
  'mobil',
  'tronton',
  'trailer',
  'fuso',
  'engkel',
  'container',
  'kontainer',
  'seal',
  'tanggal',
  'date',
  'tujuan',
  'alamat',
  'delivery',
  'kgs',
  'kg',
  'qty',
  'koli',
  'package',
  'kemasan',
  'jumlah',
  'b/l',
  'p/o',
  'bl',
  'po',
];

// Sort descending by length so longer phrases match before sub-words
// Regex to capture:
// Group 1 (prefix): Label + separator (e.g. 'delivery address ke ' or 'BL number: ' or 'barang ')
// Group 2 (value): The value itself up to comma, semicolon, newline, period, or next label conjunction
const sortedLabels = [...LOGISTICS_ASPECT_KEYWORDS].sort((a, b) => b.length - a.length);
const labelPattern = sortedLabels.map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');

const VALUE_EXTRACT_REGEX = new RegExp(
  `(\\b(?:${labelPattern})\\b(?:\\s*(?::|=|ke|adalah|yaitu)\\s*|\\s+))(.+?)(?=(?:,|;|\\.|\\n|\\s+(?:dengan|dan|serta)\\s+\\b(?:${labelPattern})\\b|\\s+\\b(?:${labelPattern})\\b|$))`,
  'gi'
);

export const HighlightedPromptTextarea: React.FC<HighlightedPromptTextareaProps> = ({
  value,
  onChange,
  placeholder = '',
  rows = 8,
  minHeight = '260px',
  fontSizeClass = 'text-lg sm:text-xl md:text-2xl',
  leadingClass = 'leading-relaxed md:leading-loose',
  paddingClass = 'p-2',
  onKeyDown,
  autoFocus,
  className = '',
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);

  // Synchronize scroll between interactive textarea and visual highlight backdrop
  const handleScroll = () => {
    if (textareaRef.current && backdropRef.current) {
      backdropRef.current.scrollTop = textareaRef.current.scrollTop;
      backdropRef.current.scrollLeft = textareaRef.current.scrollLeft;
    }
  };

  // Sync scroll on value change as well
  useEffect(() => {
    handleScroll();
  }, [value]);

  // Render text with bolded aspect values (valuenya yang dibold, bukan keterangannya)
  const renderHighlightedContent = () => {
    if (!value) return null;

    const segments: Array<{ text: string; isValue: boolean }> = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    VALUE_EXTRACT_REGEX.lastIndex = 0;

    while ((match = VALUE_EXTRACT_REGEX.exec(value)) !== null) {
      const matchStart = match.index;
      const prefix = match[1]; // Label/keterangan + separator
      const val = match[2];    // Nilai / value dari aspek

      if (matchStart > lastIndex) {
        segments.push({ text: value.slice(lastIndex, matchStart), isValue: false });
      }

      // Keterangan / label tetap teks normal
      segments.push({ text: prefix, isValue: false });

      // Value / nilai aspek dibuat TEBAL (BOLD) dengan highlight cream halus
      if (val && val.trim().length > 0) {
        segments.push({ text: val, isValue: true });
      }

      lastIndex = matchStart + match[0].length;
    }

    if (lastIndex < value.length) {
      segments.push({ text: value.slice(lastIndex), isValue: false });
    }

    return segments.map((seg, index) => {
      if (seg.isValue) {
        return (
          <span
            key={index}
            className="inline text-[#fffdfa] rounded-sm"
            style={{
              padding: 0,
              margin: 0,
              border: 'none',
              letterSpacing: 'inherit',
              fontWeight: 'inherit',
              WebkitTextStroke: '0.65px #faedd9',
              textShadow: '0 0 1px #faedd9, 0 0 8px rgba(250, 237, 217, 0.35)',
              backgroundColor: 'rgba(250, 237, 217, 0.22)',
              boxShadow: '0 0 0 2px rgba(250, 237, 217, 0.25)',
            }}
          >
            {seg.text}
          </span>
        );
      }

      return (
        <span key={index} className="text-[#fffdfa]/90" style={{ letterSpacing: 'inherit', fontWeight: 'inherit' }}>
          {seg.text}
        </span>
      );
    });
  };

  return (
    <div className={`relative w-full ${className}`}>
      {/* 1. VISUAL BACKDROP MIRROR LAYER (Displays highlighted bold values with 0px displacement) */}
      <div
        ref={backdropRef}
        aria-hidden="true"
        className={`absolute inset-0 w-full h-full pointer-events-none select-none overflow-y-auto overflow-x-hidden whitespace-pre-wrap break-words font-sans font-normal ${fontSizeClass} ${leadingClass} ${paddingClass} scrollbar-none`}
        style={{
          minHeight,
          boxSizing: 'border-box',
          wordBreak: 'break-word',
          border: '1px solid transparent',
        }}
      >
        {renderHighlightedContent()}
        {/* Trailing newline support to preserve extra blank line at bottom */}
        {value.endsWith('\n') && <br />}
      </div>

      {/* 2. REAL INTERACTIVE TEXTAREA (100% pixel-aligned caret & input processing) */}
      <textarea
        ref={textareaRef}
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onScroll={handleScroll}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className={`relative z-10 w-full bg-transparent border border-transparent outline-none resize-none font-sans font-normal ${fontSizeClass} ${leadingClass} ${paddingClass} text-transparent caret-[#faedd9] placeholder-[#c4b5fd]/45 focus:ring-0 select-text scrollbar-thin scrollbar-thumb-white/10 selection:bg-[#d8b4fe]/35 selection:text-transparent`}
        style={{
          minHeight,
          boxSizing: 'border-box',
          wordBreak: 'break-word',
        }}
      />
    </div>
  );
};
