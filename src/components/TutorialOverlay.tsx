import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Sliders,
  FileText,
  Printer,
  Download,
  MessageSquare,
  Mic,
  ZoomIn,
  Check,
  X,
  ArrowRight,
  BookOpen,
  Eye,
  Truck,
  Package,
  Layers,
  Search,
} from 'lucide-react';

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
}) => {
  const [dontShowAgain, setDontShowAgain] = useState<boolean>(true);
  const [activeNav, setActiveNav] = useState<string>('section-overview');

  const containerRef = useRef<HTMLDivElement>(null);
  const overviewRef = useRef<HTMLDivElement>(null);
  const promptRef = useRef<HTMLDivElement>(null);
  const manualRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        onClose(dontShowAgain);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, dontShowAgain, onClose]);

  // Track scroll position to update active navigation item
  const handleScroll = () => {
    if (!containerRef.current) return;
    const containerTop = containerRef.current.scrollTop + 100;

    const sections = [
      { id: 'section-overview', ref: overviewRef },
      { id: 'section-prompt', ref: promptRef },
      { id: 'section-manual', ref: manualRef },
      { id: 'section-preview', ref: previewRef },
    ];

    for (let i = sections.length - 1; i >= 0; i--) {
      const sectionEl = sections[i].ref.current;
      if (sectionEl && sectionEl.offsetTop <= containerTop) {
        setActiveNav(sections[i].id);
        break;
      }
    }
  };

  const scrollToSection = (ref: React.RefObject<HTMLDivElement | null>, id: string) => {
    if (ref.current) {
      ref.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveNav(id);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 md:p-6 bg-black/80 backdrop-blur-md animate-fade-in"
      onClick={() => onClose(dontShowAgain)}
    >
      <div
        className="liquid-card rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl border border-[#faedd9]/20 bg-[#251736] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between px-5 sm:px-7 py-4 border-b border-[#faedd9]/12 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#faedd9]/15 flex items-center justify-center text-[#faedd9] shrink-0">
              <BookOpen className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base md:text-lg font-bold text-[#fffdfa] leading-tight">
                Panduan Lengkap Surat Jalan
              </h2>
              <p className="text-[11px] sm:text-xs theme-label mt-0.5">
                PT Niaga Logistics Sejahtera • Generator Surat Jalan Otomatis
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onClose(dontShowAgain)}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-[#faedd9]/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="Tutup panduan (Esc)"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Quick Jump Section Bar (Sticky Navigation, Clean Without Badges) */}
        <div className="flex items-center border-b border-[#faedd9]/10 px-4 sm:px-7 bg-black/20 shrink-0 overflow-x-auto scrollbar-none gap-2 sm:gap-4 py-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#faedd9]/50 shrink-0 hidden sm:inline">
            Lompat ke:
          </span>
          <button
            type="button"
            onClick={() => scrollToSection(overviewRef, 'section-overview')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              activeNav === 'section-overview'
                ? 'bg-[#faedd9]/20 text-[#fffdfa] font-bold'
                : 'text-[#faedd9]/70 hover:text-[#fffdfa]'
            }`}
          >
            1. Ringkasan Alur
          </button>
          <button
            type="button"
            onClick={() => scrollToSection(promptRef, 'section-prompt')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              activeNav === 'section-prompt'
                ? 'bg-[#faedd9]/20 text-[#fffdfa] font-bold'
                : 'text-[#faedd9]/70 hover:text-[#fffdfa]'
            }`}
          >
            2. Mode Prompt Penuh
          </button>
          <button
            type="button"
            onClick={() => scrollToSection(manualRef, 'section-manual')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              activeNav === 'section-manual'
                ? 'bg-[#faedd9]/20 text-[#fffdfa] font-bold'
                : 'text-[#faedd9]/70 hover:text-[#fffdfa]'
            }`}
          >
            3. Mode Input Manual
          </button>
          <button
            type="button"
            onClick={() => scrollToSection(previewRef, 'section-preview')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              activeNav === 'section-preview'
                ? 'bg-[#faedd9]/20 text-[#fffdfa] font-bold'
                : 'text-[#faedd9]/70 hover:text-[#fffdfa]'
            }`}
          >
            4. Preview & Ekspor
          </button>
        </div>

        {/* FULL SCROLLABLE BODY SHOWING ALL SECTIONS */}
        <div
          ref={containerRef}
          onScroll={handleScroll}
          className="p-5 sm:p-7 md:p-8 overflow-y-auto flex-1 space-y-8 scroll-smooth"
        >
          {/* ======================================================== */}
          {/* SECTION 1: RINGKASAN ALUR KERJA */}
          {/* ======================================================== */}
          <section ref={overviewRef} id="section-overview" className="space-y-4">
            <div className="flex items-center gap-2.5 pb-2 border-b border-[#faedd9]/10">
              <div className="w-7 h-7 rounded-lg bg-[#faedd9]/15 flex items-center justify-center text-[#faedd9]">
                <Layers className="w-4 h-4" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-[#fffdfa]">
                1. Dua Cara Mudah Membuat Surat Jalan
              </h3>
            </div>

            <p className="text-xs sm:text-sm text-[#faedd9]/85 leading-relaxed">
              Aplikasi ini dirancang untuk memudahkan operasional logistik PT Niaga Logistics Sejahtera dengan dua alur kerja yang dapat Anda gunakan sesuai kebutuhan:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Method 1: Prompt AI */}
              <div className="p-4 sm:p-5 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-[#fffdfa]">Mode Prompt Penuh (AI)</h4>
                    <span className="text-[11px] theme-label">Otomatis & Cepat</span>
                  </div>
                </div>
                <p className="text-xs text-[#faedd9]/80 leading-relaxed">
                  Cukup ketik atau rekam suara rincian kargo (nomor BL, PO, tujuan gudang/pelabuhan, nama barang, dan berat). AI akan mengekstrak data dan menyusun lembar surat jalan dalam hitungan detik.
                </p>
                {onGoToPrompt && (
                  <button
                    type="button"
                    onClick={() => {
                      onGoToPrompt();
                      onClose(dontShowAgain);
                    }}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#faedd9] hover:underline pt-1 cursor-pointer"
                  >
                    <span>Buka Layar Prompt Penuh</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Method 2: Input Manual */}
              <div className="p-4 sm:p-5 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center">
                    <Sliders className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-[#fffdfa]">Mode Input Manual</h4>
                    <span className="text-[11px] theme-label">Kendali Lengkap Kolom per Kolom</span>
                  </div>
                </div>
                <p className="text-xs text-[#faedd9]/80 leading-relaxed">
                  Bagi Anda yang ingin mengedit atau mengisi spesifikasi secara langsung (Shipper, Kargo, Kontainer, Pengemudi, Nomor Seal, Plat Truk) dengan tombol preset pilihan cepat yang efisien.
                </p>
                {onGoToManual && (
                  <button
                    type="button"
                    onClick={() => {
                      onGoToManual();
                      onClose(dontShowAgain);
                    }}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#faedd9] hover:underline pt-1 cursor-pointer"
                  >
                    <span>Buka Layar Input Manual</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Quick 3-Step Process */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white/5 border border-white/10">
              <h4 className="text-xs font-bold text-[#fffdfa] mb-2.5">Langkah Kerja Cepat:</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-[#faedd9]/85">
                <div className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-1">
                  <span className="font-bold text-[#fffdfa] block">Langkah 1: Masukkan Data</span>
                  <p className="text-[11px] text-[#faedd9]/75">Gunakan kalimat prompt AI atau isi formulir manual di kolom editor.</p>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-1">
                  <span className="font-bold text-[#fffdfa] block">Langkah 2: Periksa Preview</span>
                  <p className="text-[11px] text-[#faedd9]/75">Lihat hasil langsung pada format resmi A4 di sisi kanan layar.</p>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-1">
                  <span className="font-bold text-[#fffdfa] block">Langkah 3: Cetak / Kirim</span>
                  <p className="text-[11px] text-[#faedd9]/75">Unduh file PDF, cetak ke printer, atau kirim rincian via WhatsApp.</p>
                </div>
              </div>
            </div>
          </section>

          {/* ======================================================== */}
          {/* SECTION 2: MODE PROMPT PENUH (AI & VOICE) */}
          {/* ======================================================== */}
          <section ref={promptRef} id="section-prompt" className="space-y-4 pt-4 border-t border-[#faedd9]/10">
            <div className="flex items-center gap-2.5 pb-2 border-b border-[#faedd9]/10">
              <div className="w-7 h-7 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-300">
                <Sparkles className="w-4 h-4" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-[#fffdfa]">
                2. Panduan Layar Prompt Penuh (AI & Dikte Suara)
              </h3>
            </div>

            <p className="text-xs sm:text-sm text-[#faedd9]/85 leading-relaxed">
              Layar utama dengan area input teks yang luas untuk menyusun surat jalan tanpa perlu mengisi formulir satu per satu:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-purple-300" />
                  <h4 className="text-xs font-bold text-[#fffdfa]">Ketik Bebas atau Tempel Pesan</h4>
                </div>
                <p className="text-[11.5px] text-[#faedd9]/80 leading-relaxed">
                  Anda bisa menempelkan format pesan singkat dari WhatsApp atau email logistik (contoh: nomor DO, BL, PO, tujuan Terminal Koja / NPCT / JICT, nama barang, dan berat).
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                <div className="flex items-center gap-2">
                  <Mic className="w-4 h-4 text-rose-300" />
                  <h4 className="text-xs font-bold text-[#fffdfa]">Dikte Suara (Mikrofon)</h4>
                </div>
                <p className="text-[11.5px] text-[#faedd9]/80 leading-relaxed">
                  Tekan ikon mikrofon dan ucapkan data pengiriman dalam Bahasa Indonesia. Sistem akan mentranskrip ucapan Anda secara langsung menjadi teks prompt.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-amber-300" />
                  <h4 className="text-xs font-bold text-[#fffdfa]">Template Shorthand & Batch</h4>
                </div>
                <p className="text-[11.5px] text-[#faedd9]/80 leading-relaxed">
                  Tersedia contoh template logistik siap pakai di bawah formulir: template shorthand DO/BL/PO, template batch multi-surat jalan, dan rute tujuan umum.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                <div className="flex items-center gap-2">
                  <ArrowRight className="w-4 h-4 text-emerald-300" />
                  <h4 className="text-xs font-bold text-[#fffdfa]">Tombol "Buat Surat Jalan"</h4>
                </div>
                <p className="text-[11.5px] text-[#faedd9]/80 leading-relaxed">
                  Klik tombol eksekusi untuk memproses teks. AI otomatis mengekstrak seluruh entitas dan langsung membuka dokumen di layar studio dengan data lengkap.
                </p>
              </div>
            </div>

            {onGoToPrompt && (
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => {
                    onGoToPrompt();
                    onClose(dontShowAgain);
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer theme-btn-ghost active:scale-95"
                >
                  <Sparkles className="w-3.5 h-3.5 text-purple-300" />
                  <span>Coba Layar Prompt Penuh Sekarang ➔</span>
                </button>
              </div>
            )}
          </section>

          {/* ======================================================== */}
          {/* SECTION 3: MODE INPUT MANUAL (STUDIO EDITOR) */}
          {/* ======================================================== */}
          <section ref={manualRef} id="section-manual" className="space-y-4 pt-4 border-t border-[#faedd9]/10">
            <div className="flex items-center gap-2.5 pb-2 border-b border-[#faedd9]/10">
              <div className="w-7 h-7 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-300">
                <Sliders className="w-4 h-4" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-[#fffdfa]">
                3. Panduan Layar Input Manual (Studio Editor)
              </h3>
            </div>

            <p className="text-xs sm:text-sm text-[#faedd9]/85 leading-relaxed">
              Formulir terstruktur di kolom kiri studio untuk mengatur dan menyesuaikan setiap kolom dokumen:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-300" />
                  <h4 className="text-xs font-bold text-[#fffdfa]">1. Informasi Dokumen & Pengiriman</h4>
                </div>
                <p className="text-[11.5px] text-[#faedd9]/80 leading-relaxed">
                  Atur tanggal pengiriman, nomor BL, nomor PO, dan pilih Alamat Tujuan dari pilihan cepat (Koja UTC3, NPCT1, JICT, dll) atau ketik alamat kustom.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-purple-300" />
                  <h4 className="text-xs font-bold text-[#fffdfa]">2. Shipper (Pengirim)</h4>
                </div>
                <p className="text-[11.5px] text-[#faedd9]/80 leading-relaxed">
                  Pilih dari daftar shipper perusahaan tersimpan (PT Cotti Coffee, PT Triputra, PT Danora, dll) atau masukkan nama dan alamat perusahaan pengirim baru.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-amber-300" />
                  <h4 className="text-xs font-bold text-[#fffdfa]">3. Detail Barang & Kargo</h4>
                </div>
                <p className="text-[11.5px] text-[#faedd9]/80 leading-relaxed">
                  Kelola nama barang, keterangan kontainer (1 X 40 HC, 1 X 20 FT, dll), berat kargo (KG), dan nomor seal. Tersedia tombol pilihan cepat 1-klik untuk efisiensi pengisian.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-emerald-300" />
                  <h4 className="text-xs font-bold text-[#fffdfa]">4. Pengemudi & Armada</h4>
                </div>
                <p className="text-[11.5px] text-[#faedd9]/80 leading-relaxed">
                  Pilih pengemudi dari preset armada yang sering bertugas atau isi nama pengemudi, nomor kontak WhatsApp, dan plat truk secara langsung.
                </p>
              </div>
            </div>

            {onGoToManual && (
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => {
                    onGoToManual();
                    onClose(dontShowAgain);
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer theme-btn-ghost active:scale-95"
                >
                  <Sliders className="w-3.5 h-3.5 text-amber-300" />
                  <span>Coba Layar Input Manual Sekarang ➔</span>
                </button>
              </div>
            )}
          </section>

          {/* ======================================================== */}
          {/* SECTION 4: PREVIEW & EKSPOR DOKUMEN */}
          {/* ======================================================== */}
          <section ref={previewRef} id="section-preview" className="space-y-4 pt-4 border-t border-[#faedd9]/10">
            <div className="flex items-center gap-2.5 pb-2 border-b border-[#faedd9]/10">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-300">
                <Eye className="w-4 h-4" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-[#fffdfa]">
                4. Panduan Pratinjau Dokumen, Magnifier, & Ekspor
              </h3>
            </div>

            <p className="text-xs sm:text-sm text-[#faedd9]/85 leading-relaxed">
              Area pratinjau langsung di sisi kanan layar untuk memverifikasi dokumen sebelum dicetak atau dikirim:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                <div className="flex items-center gap-2">
                  <ZoomIn className="w-4 h-4 text-emerald-300" />
                  <h4 className="text-xs font-bold text-[#fffdfa]">Zoom & Drag-to-Pan Dokumen</h4>
                </div>
                <p className="text-[11.5px] text-[#faedd9]/80 leading-relaxed">
                  Gunakan tombol perbesar/perkecil (30% - 130%) atau klik dan tahan mouse / sentuh layar untuk menggeser dokumen A4 secara bebas ke segala arah.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                <div className="flex items-center gap-2">
                  <Search className="w-4 h-4 text-purple-300" />
                  <h4 className="text-xs font-bold text-[#fffdfa]">Kaca Pembesar (Magnifier)</h4>
                </div>
                <p className="text-[11.5px] text-[#faedd9]/80 leading-relaxed">
                  Di layar ponsel dan tablet, aktifkan fitur kaca pembesar untuk membaca teks kecil atau barcode secara mendetail tanpa perlu mengubah tata letak dokumen.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                <div className="flex items-center gap-2">
                  <Download className="w-4 h-4 text-blue-300" />
                  <h4 className="text-xs font-bold text-[#fffdfa]">Download PDF Resmi</h4>
                </div>
                <p className="text-[11.5px] text-[#faedd9]/80 leading-relaxed">
                  Simpan dokumen surat jalan ke format PDF tajam standar cetak A4 dengan logo PT Niaga Logistics Sejahtera dan barcode nomor BL.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                <div className="flex items-center gap-2">
                  <Printer className="w-4 h-4 text-amber-300" />
                  <h4 className="text-xs font-bold text-[#fffdfa]">Cetak Langsung (Print)</h4>
                </div>
                <p className="text-[11.5px] text-[#faedd9]/80 leading-relaxed">
                  Kirim dokumen langsung ke printer Anda tanpa harus menyimpan file secara manual terlebih dahulu.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2 sm:col-span-2">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-emerald-300" />
                  <h4 className="text-xs font-bold text-[#fffdfa]">Kirim Rincian ke WhatsApp Pengemudi</h4>
                </div>
                <p className="text-[11.5px] text-[#faedd9]/80 leading-relaxed">
                  Cukup 1 klik untuk membuka WhatsApp driver armada dengan teks pesan otomatis yang rapi berisi nomor BL, tujuan bongkar, muatan kargo, dan tanggal kirim.
                </p>
              </div>
            </div>
          </section>
        </div>

        {/* Modal Bottom Footer */}
        <div className="px-5 sm:px-7 py-3.5 border-t border-[#faedd9]/12 bg-black/20 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          {/* Checkbox: Don't show again on first open */}
          <label className="flex items-center gap-2 cursor-pointer select-none text-xs theme-label order-2 sm:order-1">
            <input
              type="checkbox"
              checked={dontShowAgain}
              onChange={(e) => setDontShowAgain(e.target.checked)}
              className="w-4 h-4 rounded text-amber-500 border-white/30 focus:ring-0 cursor-pointer"
            />
            <span>Jangan tampilkan otomatis saat membuka aplikasi</span>
          </label>

          {/* Action buttons */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end order-1 sm:order-2">
            <button
              type="button"
              onClick={() => onClose(dontShowAgain)}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer theme-btn-primary active:scale-95 shadow-sm"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Mulai Sekarang</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
