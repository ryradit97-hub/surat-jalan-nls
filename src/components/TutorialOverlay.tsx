import React, { useState, useEffect } from 'react';
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
  ArrowLeft,
  BookOpen,
  Eye,
  HelpCircle,
  Truck,
  Package,
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
  currentScreen = 'hero-prompt',
}) => {
  // Tabs: 0 = Ikhtisar, 1 = Mode Prompt Penuh, 2 = Mode Input Manual, 3 = Preview & Ekspor
  const [activeTab, setActiveTab] = useState<number>(() => {
    return currentScreen === 'studio' ? 2 : 1;
  });

  const [dontShowAgain, setDontShowAgain] = useState<boolean>(true);

  // Sync initial tab when screen changes
  useEffect(() => {
    if (isOpen) {
      setActiveTab(currentScreen === 'studio' ? 2 : 1);
    }
  }, [isOpen, currentScreen]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        onClose(dontShowAgain);
      } else if (e.key === 'ArrowRight') {
        setActiveTab((prev) => Math.min(3, prev + 1));
      } else if (e.key === 'ArrowLeft') {
        setActiveTab((prev) => Math.max(0, prev - 1));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, dontShowAgain, onClose]);

  if (!isOpen) return null;

  const tabs = [
    { id: 0, label: 'Ringkasan Alur' },
    { id: 1, label: 'Mode Prompt Penuh' },
    { id: 2, label: 'Mode Input Manual' },
    { id: 3, label: 'Preview & Ekspor' },
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-md animate-fade-in"
      onClick={() => onClose(dontShowAgain)}
    >
      <div
        className="liquid-card rounded-3xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl border border-[#faedd9]/20 bg-[#251736] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-[#faedd9]/12 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#faedd9]/15 flex items-center justify-center text-[#faedd9] shrink-0">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-[#fffdfa] leading-tight">
                Panduan Penggunaan Surat Jalan
              </h2>
              <p className="text-[11px] theme-label mt-0.5">
                PT Niaga Logistics Sejahtera • Generator Surat Jalan Otomatis
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onClose(dontShowAgain)}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#faedd9]/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="Tutup panduan (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Clean Navigation Tabs (Without Badges) */}
        <div className="flex items-center border-b border-[#faedd9]/10 px-4 sm:px-6 bg-black/10 shrink-0 overflow-x-auto scrollbar-none">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`py-3 px-3.5 text-xs font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'border-[#faedd9] text-[#fffdfa]'
                    : 'border-transparent text-[#faedd9]/60 hover:text-[#faedd9]/90'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-4">
          {/* TAB 0: RINGKASAN ALUR */}
          {activeTab === 0 && (
            <div className="space-y-4 animate-fade-in">
              <div className="rounded-2xl p-4 bg-white/5 border border-white/10 space-y-2">
                <h3 className="text-sm font-bold text-[#fffdfa]">
                  Dua Cara Mudah Membuat Surat Jalan
                </h3>
                <p className="text-xs text-[#faedd9]/80 leading-relaxed">
                  Aplikasi ini dirancang untuk mempercepat pembuatan surat jalan kargo resmi PT Niaga Logistics Sejahtera dengan dua alur kerja fleksibel:
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Method 1: Prompt AI */}
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2.5">
                  <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <h4 className="text-xs font-bold text-[#fffdfa]">1. Mode Prompt Penuh (AI)</h4>
                  <p className="text-[11.5px] text-[#faedd9]/80 leading-relaxed">
                    Ketik teks bebas atau rekam suara rincian pengiriman (nomor BL, PO, tujuan, barang, kontainer). AI akan mengekstrak data dan menyusun dokumen secara otomatis.
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
                      <span>Buka Mode Prompt</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Method 2: Input Manual */}
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center">
                    <Sliders className="w-4 h-4" />
                  </div>
                  <h4 className="text-xs font-bold text-[#fffdfa]">2. Mode Input Manual</h4>
                  <p className="text-[11.5px] text-[#faedd9]/80 leading-relaxed">
                    Kontrol penuh setiap kolom formulir (Shipper, Detail Kargo, Pengemudi, Plat Nomor) dengan pilihan cepat dan pratinjau langsung di samping layar.
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
                      <span>Buka Input Manual</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Steps summary */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                <h4 className="text-xs font-bold text-[#fffdfa]">Langkah Cepat Operasional:</h4>
                <ol className="text-xs text-[#faedd9]/80 space-y-2 list-decimal list-inside leading-relaxed">
                  <li>Pilih mode pengisian: <strong>Prompt Penuh</strong> atau <strong>Input Manual</strong>.</li>
                  <li>Periksa hasil pada <strong>Live Preview Dokumen</strong> di sisi kanan.</li>
                  <li>Gunakan tombol <strong>Download PDF</strong>, <strong>Cetak</strong>, atau <strong>Kirim WA</strong> untuk menyelesaikan dokumen.</li>
                </ol>
              </div>
            </div>
          )}

          {/* TAB 1: MODE PROMPT PENUH (AI) */}
          {activeTab === 1 && (
            <div className="space-y-4 animate-fade-in">
              <div className="rounded-2xl p-4 bg-white/5 border border-white/10 space-y-1.5">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-300" />
                  <h3 className="text-sm font-bold text-[#fffdfa]">
                    Panduan Mode Prompt Penuh
                  </h3>
                </div>
                <p className="text-xs text-[#faedd9]/80 leading-relaxed">
                  Layar utama untuk pembuatan surat jalan super cepat menggunakan bahasa sehari-hari.
                </p>
              </div>

              <div className="space-y-3">
                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-start gap-3">
                  <div className="w-7 h-7 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center shrink-0 mt-0.5">
                    <FileText className="w-3.5 h-3.5" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-[#fffdfa]">Ketik Bebas atau Tempel Pesan</h4>
                    <p className="text-[11.5px] text-[#faedd9]/80 leading-relaxed">
                      Anda bisa menempelkan format pesan singkat dari WhatsApp atau email logistik (contoh: nomor DO, BL, PO, tujuan Terminal Koja / NPCT / JICT, nama barang, dan berat).
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-start gap-3">
                  <div className="w-7 h-7 rounded-xl bg-rose-500/20 text-rose-300 flex items-center justify-center shrink-0 mt-0.5">
                    <Mic className="w-3.5 h-3.5" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-[#fffdfa]">Input Suara (Mikrofon)</h4>
                    <p className="text-[11.5px] text-[#faedd9]/80 leading-relaxed">
                      Klik ikon mikrofon dan ucapkan data pengiriman Anda. Suara akan ditranskrip menjadi teks secara akurat.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-start gap-3">
                  <div className="w-7 h-7 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center shrink-0 mt-0.5">
                    <BookOpen className="w-3.5 h-3.5" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-[#fffdfa]">Template Siap Pakai & Batch</h4>
                    <p className="text-[11.5px] text-[#faedd9]/80 leading-relaxed">
                      Tersedia contoh siap pakai seperti template shorthand (DO/NPCT/Koja/JICT) dan template multi-surat jalan sekaligus (batch).
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-start gap-3">
                  <div className="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center shrink-0 mt-0.5">
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-[#fffdfa]">Tombol Eksekusi "Buat Surat Jalan"</h4>
                    <p className="text-[11.5px] text-[#faedd9]/80 leading-relaxed">
                      Klik tombol untuk memproses prompt. Sistem otomatis membuka jendela studio dengan formulir terisi dan preview dokumen siap cetak.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MODE INPUT MANUAL */}
          {activeTab === 2 && (
            <div className="space-y-4 animate-fade-in">
              <div className="rounded-2xl p-4 bg-white/5 border border-white/10 space-y-1.5">
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-amber-300" />
                  <h3 className="text-sm font-bold text-[#fffdfa]">
                    Panduan Mode Input Manual
                  </h3>
                </div>
                <p className="text-xs text-[#faedd9]/80 leading-relaxed">
                  Formulir terstruktur di sisi kiri studio untuk mengontrol setiap data dokumen surat jalan.
                </p>
              </div>

              <div className="space-y-3">
                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-start gap-3">
                  <div className="w-7 h-7 rounded-xl bg-blue-500/20 text-blue-300 flex items-center justify-center shrink-0 mt-0.5">
                    <FileText className="w-3.5 h-3.5" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-[#fffdfa]">1. Informasi Dokumen & Pengiriman</h4>
                    <p className="text-[11.5px] text-[#faedd9]/80 leading-relaxed">
                      Atur tanggal pengiriman, nomor BL, nomor PO, dan pilih Alamat Penerima dari preset pelabuhan/gudang (Koja, NPCT, JICT, dll) atau ketik alamat sendiri.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-start gap-3">
                  <div className="w-7 h-7 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center shrink-0 mt-0.5">
                    <Package className="w-3.5 h-3.5" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-[#fffdfa]">2. Shipper (Pengirim)</h4>
                    <p className="text-[11.5px] text-[#faedd9]/80 leading-relaxed">
                      Pilih dari daftar shipper tersimpan (PT Cotti Coffee, PT Triputra, PT Danora, dll) atau ketik nama dan alamat perusahaan pengirim baru.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-start gap-3">
                  <div className="w-7 h-7 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center shrink-0 mt-0.5">
                    <Package className="w-3.5 h-3.5" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-[#fffdfa]">3. Detail Barang & Kargo</h4>
                    <p className="text-[11.5px] text-[#faedd9]/80 leading-relaxed">
                      Isi nama barang, kontainer (1 X 40 HC, 1 X 20 FT, dll), berat kargo (KG), kemasan, dan nomor seal. Tersedia tombol pilihan cepat 1-klik untuk efisiensi pengisian.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-start gap-3">
                  <div className="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center shrink-0 mt-0.5">
                    <Truck className="w-3.5 h-3.5" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-[#fffdfa]">4. Pengemudi & Armada</h4>
                    <p className="text-[11.5px] text-[#faedd9]/80 leading-relaxed">
                      Pilih pengemudi dari preset armada yang sering bertugas atau masukkan nama pengemudi, nomor kontak WhatsApp, dan nomor plat kendaraan.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PREVIEW & EKSPOR */}
          {activeTab === 3 && (
            <div className="space-y-4 animate-fade-in">
              <div className="rounded-2xl p-4 bg-white/5 border border-white/10 space-y-1.5">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-emerald-300" />
                  <h3 className="text-sm font-bold text-[#fffdfa]">
                    Panduan Pratinjau & Ekspor Dokumen
                  </h3>
                </div>
                <p className="text-xs text-[#faedd9]/80 leading-relaxed">
                  Fitur live preview dokumen standar A4 resmi dan aksi penyelesaian pengiriman.
                </p>
              </div>

              <div className="space-y-3">
                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-start gap-3">
                  <div className="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center shrink-0 mt-0.5">
                    <ZoomIn className="w-3.5 h-3.5" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-[#fffdfa]">Navigasi Preview: Zoom, Drag & Kaca Pembesar</h4>
                    <p className="text-[11.5px] text-[#faedd9]/80 leading-relaxed">
                      Gunakan tombol Zoom untuk menyesuaikan ukuran lembar kerja. Di ponsel dan tablet, aktifkan fitur <strong>Kaca Pembesar (Magnifier)</strong> untuk memeriksa detail kecil tanpa menggeser dokumen. Lembar dokumen juga dapat digeser bebas (drag-to-pan).
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-start gap-3">
                  <div className="w-7 h-7 rounded-xl bg-blue-500/20 text-blue-300 flex items-center justify-center shrink-0 mt-0.5">
                    <Download className="w-3.5 h-3.5" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-[#fffdfa]">Download PDF Resmi</h4>
                    <p className="text-[11.5px] text-[#faedd9]/80 leading-relaxed">
                      Unduh dokumen surat jalan format PDF kualitas cetak standar A4, lengkap dengan logo PT Niaga Logistics Sejahtera dan barcode nomor BL.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-start gap-3">
                  <div className="w-7 h-7 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center shrink-0 mt-0.5">
                    <Printer className="w-3.5 h-3.5" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-[#fffdfa]">Cetak Langsung (Print)</h4>
                    <p className="text-[11.5px] text-[#faedd9]/80 leading-relaxed">
                      Cetak lembar surat jalan langsung ke printer lokal tanpa perlu menyimpan file terlebih dahulu.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-start gap-3">
                  <div className="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center shrink-0 mt-0.5">
                    <MessageSquare className="w-3.5 h-3.5" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-[#fffdfa]">Kirim Rincian ke WhatsApp Driver</h4>
                    <p className="text-[11.5px] text-[#faedd9]/80 leading-relaxed">
                      Satu klik untuk membuka obrolan WhatsApp dengan sopir armada dengan format pesan rapi berisi nomor BL, tujuan, kargo, dan tanggal kirim.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Footer */}
        <div className="px-5 sm:px-6 py-3.5 border-t border-[#faedd9]/12 bg-black/15 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
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
            {activeTab > 0 && (
              <button
                type="button"
                onClick={() => setActiveTab((prev) => Math.max(0, prev - 1))}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer theme-btn-back active:scale-95"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Sebelumnya</span>
              </button>
            )}

            {activeTab < tabs.length - 1 ? (
              <button
                type="button"
                onClick={() => setActiveTab((prev) => Math.min(tabs.length - 1, prev + 1))}
                className="flex items-center gap-1 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer theme-btn-primary active:scale-95 shadow-sm"
              >
                <span>Lanjut</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onClose(dontShowAgain)}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer theme-btn-primary active:scale-95 shadow-sm"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Mulai Sekarang</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
