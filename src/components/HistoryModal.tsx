import React, { useState, useEffect } from 'react';
import {
  History,
  Search,
  Calendar,
  X,
  ExternalLink,
  Download,
  Trash2,
  Copy,
  Check,
  RefreshCw,
  Clock,
  ShieldCheck,
  AlertCircle,
  FileText,
  MapPin,
  Truck,
  Box,
} from 'lucide-react';
import {
  fetchSuratJalanHistory,
  deleteSuratJalanHistory,
  SuratJalanHistoryRecord,
} from '../services/supabaseService';
import { isSupabaseConfigured } from '../services/supabaseClient';
import { SuratJalanData } from '../types/suratJalan';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectDocument: (doc: SuratJalanData) => void;
  onDownloadPdf: (doc: SuratJalanData) => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({
  isOpen,
  onClose,
  onSelectDocument,
  onDownloadPdf,
}) => {
  const [historyItems, setHistoryItems] = useState<SuratJalanHistoryRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [filterDays, setFilterDays] = useState<number>(30);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const loadHistory = async () => {
    setIsLoading(true);
    try {
      const records = await fetchSuratJalanHistory(filterDays);
      setHistoryItems(records);
    } catch (err) {
      console.error('Failed to load history:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadHistory();
    }
  }, [isOpen, filterDays]);

  if (!isOpen) return null;

  // Filter items by search query
  const filteredItems = historyItems.filter((item) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (item.bl_number && item.bl_number.toLowerCase().includes(q)) ||
      (item.po_number && item.po_number.toLowerCase().includes(q)) ||
      (item.shipper_name && item.shipper_name.toLowerCase().includes(q)) ||
      (item.delivery_address && item.delivery_address.toLowerCase().includes(q)) ||
      (item.driver_name && item.driver_name.toLowerCase().includes(q)) ||
      (item.license_plate && item.license_plate.toLowerCase().includes(q))
    );
  });

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Hapus surat jalan ini dari riwayat cloud?')) return;
    const success = await deleteSuratJalanHistory(id);
    if (success) {
      setHistoryItems((prev) => prev.filter((item) => item.id !== id));
    }
  };

  const handleCopyShareLink = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://suratjalannls.online';
    const link = `${origin}/?view=${id}`;
    navigator.clipboard.writeText(link);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return new Intl.DateTimeFormat('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(date);
    } catch {
      return isoString;
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-md animate-fade-in select-none"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative z-10 w-full max-w-2xl max-h-[92vh] flex flex-col rounded-[28px] sm:rounded-[32px] bg-[#1d132b] text-[#faf5ee] border border-[#d8b4fe]/25 shadow-[0_24px_70px_rgba(10,5,20,0.7)] overflow-hidden"
      >
        {/* Header */}
        <div className="p-4 sm:p-6 pb-3 border-b border-[#d8b4fe]/15 shrink-0 flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#32204a] border border-[#d8b4fe]/30 flex items-center justify-center shrink-0 shadow-inner">
              <History className="w-5 h-5 text-[#d8b4fe]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-[#faf5ee] tracking-tight">
                  Riwayat Surat Jalan
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#faedd9]/10 border border-[#faedd9]/25 text-[#faedd9] font-mono font-semibold">
                  30 Hari
                </span>
              </div>
              <p className="text-xs text-[#c4b5fd]/75 mt-0.5 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Private Vault: Khusus perangkat ini, tanpa perlu autentikasi/login.</span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center bg-[#2c1d42] hover:bg-[#382554] border border-[#d8b4fe]/15 text-[#c4b5fd]/80 hover:text-white transition-all cursor-pointer shrink-0"
            title="Tutup"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Supabase Not Configured Warning Banner */}
        {!isSupabaseConfigured && (
          <div className="mx-4 sm:mx-6 mt-3 p-3 rounded-2xl bg-amber-500/10 border border-amber-400/30 flex items-start gap-2.5 text-xs text-amber-200 shrink-0">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="min-w-0">
              <span className="font-bold block">Supabase Belum Dikonfigurasi di Environment</span>
              <span className="text-[11px] opacity-90 block mt-0.5">
                Tambahkan <code>VITE_SUPABASE_URL</code> dan <code>VITE_SUPABASE_ANON_KEY</code> di file <code>.env.local</code> Anda untuk mengaktifkan sinkronisasi cloud riwayat 30 hari.
              </span>
            </div>
          </div>
        )}

        {/* Search & Filter Toolbar */}
        <div className="px-4 sm:px-6 pt-3 pb-2 space-y-2.5 shrink-0 border-b border-white/[0.06]">
          {/* Search Input */}
          <div className="relative w-full">
            <Search className="w-4 h-4 text-[#c4b5fd]/60 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nomor B/L, P/O, Shipper, atau Supir..."
              className="w-full pl-9 pr-8 py-2 rounded-xl text-xs bg-[#27193b] border border-[#d8b4fe]/20 text-[#faf5ee] placeholder-[#c4b5fd]/50 focus:outline-none focus:border-[#d8b4fe]/50 focus:ring-1 focus:ring-[#d8b4fe]/30 transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-[#c4b5fd]/60 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Timeframe Chips + Refresh Button */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5">
              {[
                { label: 'Semua (30 Hari)', days: 30 },
                { label: '7 Hari Terakhir', days: 7 },
                { label: 'Hari Ini', days: 1 },
              ].map((f) => (
                <button
                  key={f.days}
                  type="button"
                  onClick={() => setFilterDays(f.days)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    filterDays === f.days
                      ? 'bg-[#faedd9] text-stone-900 shadow-sm font-black'
                      : 'bg-white/[0.05] text-[#c4b5fd]/75 hover:bg-white/[0.1] hover:text-white'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={loadHistory}
              disabled={isLoading}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-white/[0.05] hover:bg-white/[0.1] text-[#c4b5fd]/80 hover:text-white transition-all cursor-pointer shrink-0 disabled:opacity-40"
              title="Perbarui Riwayat"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>

        {/* History List Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 scrollbar-thin scrollbar-thumb-white/10">
          {isLoading ? (
            <div className="py-14 flex flex-col items-center justify-center text-center">
              <div className="w-8 h-8 border-2 border-[#d8b4fe]/30 border-t-[#d8b4fe] rounded-full animate-spin mb-3" />
              <span className="text-xs text-[#c4b5fd]/70">Memuat riwayat surat jalan dari cloud...</span>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="py-14 flex flex-col items-center justify-center text-center text-[#c4b5fd]/60">
              <Clock className="w-10 h-10 opacity-40 mb-3" />
              <p className="text-sm font-semibold text-[#faf5ee]">Belum ada riwayat surat jalan</p>
              <p className="text-xs max-w-sm mt-1 text-[#c4b5fd]/70">
                {searchQuery
                  ? 'Tidak ada surat jalan yang cocok dengan kata kunci pencarian.'
                  : 'Surat jalan yang Anda buat akan otomatis tersimpan di sini selama 30 hari.'}
              </p>
            </div>
          ) : (
            filteredItems.map((item) => {
              const firstItem = item.document_data.items?.[0];
              return (
                <div
                  key={item.id}
                  className="p-4 rounded-2xl bg-[#26183a] border border-[#d8b4fe]/15 hover:border-[#d8b4fe]/35 transition-all shadow-sm group"
                >
                  {/* Card Header */}
                  <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-white/[0.06]">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-[#3e275d] text-[#faedd9] border border-[#d8b4fe]/25 shrink-0">
                        B/L: {item.bl_number || 'Draft'}
                      </span>
                      {item.po_number && (
                        <span className="text-[10px] font-mono text-[#c4b5fd]/75 truncate">
                          PO: {item.po_number}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-[10.5px] font-mono text-[#c4b5fd]/65">
                        {formatDate(item.created_at)}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => handleDelete(item.id, e)}
                        className="p-1 text-[#c4b5fd]/50 hover:text-rose-400 rounded-lg hover:bg-rose-500/10 transition-colors"
                        title="Hapus dari riwayat"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Card Body: Shipper, Tujuan, Driver */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs mb-3">
                    <div className="space-y-1">
                      <div className="flex items-start gap-1.5">
                        <Box className="w-3.5 h-3.5 text-[#d8b4fe] shrink-0 mt-0.5" />
                        <span className="text-[#faf5ee] font-medium truncate">
                          {firstItem?.description || item.shipper_name || 'Muatan Logistik'}
                        </span>
                      </div>
                      <div className="flex items-start gap-1.5 text-[11px] text-[#c4b5fd]/80">
                        <MapPin className="w-3.5 h-3.5 text-[#d8b4fe]/70 shrink-0 mt-0.5" />
                        <span className="truncate">
                          {item.delivery_address || 'Tujuan Belum Diatur'}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-start gap-1.5 text-[11px] text-[#c4b5fd]/80">
                        <Truck className="w-3.5 h-3.5 text-[#d8b4fe]/70 shrink-0 mt-0.5" />
                        <span className="truncate">
                          {item.driver_name || 'Supir -'} {item.license_plate ? `(${item.license_plate})` : ''}
                        </span>
                      </div>
                      {firstItem?.weightKg && (
                        <div className="text-[11px] text-[#faedd9]/90 font-mono pl-5">
                          {firstItem.weightKg} {firstItem.remarks ? `• ${firstItem.remarks}` : ''}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Card Action Buttons */}
                  <div className="flex items-center justify-end gap-2 pt-1 border-t border-white/[0.04]">
                    <button
                      type="button"
                      onClick={(e) => handleCopyShareLink(item.id, e)}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-medium bg-white/[0.04] hover:bg-white/[0.08] text-[#c4b5fd]/80 hover:text-white transition-all cursor-pointer"
                      title="Salin tautan langsung untuk dibagikan ke WhatsApp"
                    >
                      {copiedId === item.id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span className="text-emerald-400 font-semibold">Tersalin!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3 text-[#d8b4fe]" />
                          <span>Salin Link</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => onDownloadPdf(item.document_data)}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-medium bg-white/[0.06] hover:bg-white/[0.12] text-[#faedd9] border border-white/10 transition-all cursor-pointer"
                      title="Download PDF surat jalan ini"
                    >
                      <Download className="w-3 h-3 text-[#faedd9]" />
                      <span>PDF</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        onSelectDocument(item.document_data);
                        onClose();
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-stone-900 bg-[#faedd9] hover:bg-white transition-all cursor-pointer shadow-sm active:scale-95"
                    >
                      <span>Buka di Studio</span>
                      <ExternalLink className="w-3 h-3 text-stone-900" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 border-t border-[#d8b4fe]/15 bg-[#170e23] flex items-center justify-between text-xs text-[#c4b5fd]/70 shrink-0">
          <span>Total: <strong>{filteredItems.length}</strong> Dokumen (30 Hari)</span>
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-[#faf5ee] font-semibold transition-all cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};

