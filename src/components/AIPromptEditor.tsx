import React, { useState } from 'react';
import { SuratJalanData } from '../types/suratJalan';
import {
  extractSuratJalanWithAI,
  applyAIExtractionToDocument,
  paraphraseLogisticsPrompt,
  AIExtractionResult,
} from '../services/geminiService';
import {
  Sparkles,
  Mic,
  MicOff,
  CheckCircle2,
  ArrowRight,
  MessageSquare,
  RotateCcw
} from 'lucide-react';
import { HighlightedPromptTextarea } from './HighlightedPromptTextarea';

interface AIPromptEditorProps {
  currentDoc: SuratJalanData;
  onUpdateDocument: (doc: SuratJalanData) => void;
  onSwitchToManual: () => void;
  onDocumentGenerated?: () => void;
}

export const AIPromptEditor: React.FC<AIPromptEditorProps> = ({
  currentDoc,
  onUpdateDocument,
  onSwitchToManual,
  onDocumentGenerated,
}) => {
  const [prompt, setPrompt] = useState<string>(
    'Buatkan saya surat jalan untuk tanggal 18 Maret 2026 dengan delivery address ke Terminal Peti Kemas Koja (UTC3), dengan BL number SITR160334, PO number PO-2026/089, barang COCONUT WATER, Weight 22000 KGS, Remarks 1 X 40 HR'
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [isParaphrasing, setIsParaphrasing] = useState<boolean>(false);
  const [lastResult, setLastResult] = useState<AIExtractionResult | null>(null);
  const [isListening, setIsListening] = useState<boolean>(false);

  // Suggested Prompts
  const suggestedPrompts = [
    {
      title: '☕ Cotti Coffee ke TPK Bitung',
      text: 'Buatkan surat jalan untuk tanggal 15 Maret 2026 tujuan Terminal Petikemas Bitung (TPK Bitung), BL number SITRBISH160334, barang COCONUT WATER, berat 22000 KGS, remarks 1 X 40 HR, unit Trailer 40ft',
    },
    {
      title: '📦 Plastic Ware ke Mustika Alam',
      text: 'Buat surat jalan tanggal 14 Sep 2026, delivery address PT Terminal Mustika Alam Lestari, BL JKTG58923800, PO MDL-2643957, barang PLASTIC KITCHEN WARE, berat 8732,5 KGS, remarks 1 X 40 HC',
    },
    {
      title: '💬 Pesan WhatsApp Klien',
      text: 'Pagi tim NLS, tolong buat surat jalan tanggal 20 Maret 2026. Alamat kirim: New Priok Container Terminal One (NPCT1). BL: NPCT-90123. PO: PO-JKT-88. Muatan: FROZEN TUNA, berat: 24500 KGS, remarks: 1 X 40 REEFER.',
    },
    {
      title: '🚛 Kargo Koja (UTC3)',
      text: 'Surat jalan kirim tanggal 22 Maret 2026, delivery address ke Terminal Peti Kemas Koja (UTC3), BL number SITR-998822, PO PO-KOJA-01, barang PALM WAX, weight 19500 KGS, remarks 1 X 20 FT',
    },
  ];

  // Speech Recognition (Bahasa Indonesia)
  const handleToggleVoice = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Browser Anda belum mendukung input suara Web Speech API. Silakan gunakan Google Chrome.');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'id-ID';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      setIsListening(true);

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setPrompt((prev) => (prev ? `${prev} ${transcript}` : transcript));
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (e) {
      console.error(e);
      setIsListening(false);
    }
  };

  const handleParaphrase = async () => {
    if (!prompt.trim() || isParaphrasing) return;
    setIsParaphrasing(true);
    try {
      const improved = await paraphraseLogisticsPrompt(prompt);
      setPrompt(improved);
    } catch (e) {
      console.error(e);
    } finally {
      setIsParaphrasing(false);
    }
  };

  const handleProcessPrompt = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    try {
      const result = await extractSuratJalanWithAI(prompt);
      setLastResult(result);

      // Apply result directly into Surat Jalan active document
      const updatedDoc = applyAIExtractionToDocument(currentDoc, result);
      onUpdateDocument(updatedDoc);
      onDocumentGenerated?.();
    } catch (err: any) {
      console.error(err);
      alert('Gagal memproses: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* AI Header Card */}
      <div className="liquid-card rounded-2xl p-4 md:p-5 border border-[#faedd9]/15 bg-[#251736]/70 shadow-lg">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#faedd9]/10">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-[#faedd9]/15 flex items-center justify-center text-[#faedd9]">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-[#fffdfa]">Otomasi AI</h3>
              <p className="text-[10.5px] text-[#faedd9]/70">
                Ketik instruksi atau tempel pesan klien
              </p>
            </div>
          </div>

          {/* Status Badge */}
          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-medium text-[#faedd9] bg-[#faedd9]/10 border border-[#faedd9]/20">
            <span className="w-1.5 h-1.5 rounded-full bg-[#d8b4fe]" />
            <span>AI Siap</span>
          </div>
        </div>

        {/* Prompt Input Area with Dynamic Aspect Bolding */}
        <div className="relative mb-3">
          <HighlightedPromptTextarea
            rows={4}
            minHeight="115px"
            fontSizeClass="text-xs sm:text-sm font-normal"
            leadingClass="leading-relaxed"
            paddingClass="px-3.5 py-3 pr-20"
            className="liquid-input rounded-2xl focus-within:ring-2 focus-within:ring-[#d8b4fe]/40 shadow-inner overflow-hidden"
            value={prompt}
            onChange={setPrompt}
            placeholder="Ketik instruksi di sini..."
          />

          {/* Inline input actions */}
          <div className="absolute right-2.5 bottom-2.5 flex items-center gap-1">
            <button
              type="button"
              onClick={handleToggleVoice}
              className={`p-1.5 rounded-xl text-xs transition-all cursor-pointer ${
                isListening
                  ? 'bg-[#f472b6] text-white animate-bounce'
                  : 'bg-[#faedd9]/10 hover:bg-[#faedd9]/20 text-[#faedd9]'
              }`}
              title={isListening ? 'Mendengarkan...' : 'Dikte Suara'}
            >
              {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
            </button>
            {prompt && (
              <button
                type="button"
                onClick={() => setPrompt('')}
                className="p-1.5 rounded-xl bg-[#faedd9]/10 hover:bg-[#faedd9]/20 text-[#c4b5fd]/70 hover:text-white transition-all cursor-pointer"
                title="Hapus Teks"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Action Buttons: Paraphrase on Left, Submit on Right */}
        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={handleParaphrase}
            disabled={isParaphrasing || !prompt.trim()}
            className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold text-[#faedd9] bg-[#faedd9]/10 hover:bg-[#faedd9]/20 border border-[#faedd9]/20 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
            title="Rapikan kalimat instruksi"
          >
            {isParaphrasing ? (
              <>
                <div className="w-3 h-3 border-2 border-[#faedd9]/30 border-t-[#faedd9] rounded-full animate-spin" />
                <span>Merapikan...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3 h-3 text-[#d8b4fe]" />
                <span>✨ Parafrase</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleProcessPrompt}
            disabled={loading || !prompt.trim()}
            className="flex-1 max-w-[200px] py-2 px-3 rounded-xl text-xs font-bold text-[#181022] bg-[#faedd9] hover:bg-[#fffdfa] transition-all active:scale-[0.98] flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-sm"
          >
            {loading ? (
              <>
                <div className="w-3 h-3 border-2 border-[#181022]/30 border-t-[#181022] rounded-full animate-spin" />
                <span>Memproses...</span>
              </>
            ) : (
              <>
                <span>Buat Dokumen</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>

        {/* Studio Mini Progress Bar When Processing */}
        {loading && (
          <div className="mt-3 p-2.5 rounded-xl bg-white/[0.04] border border-white/10 animate-fade-in">
            <div className="flex items-center justify-between text-[11px] mb-1.5 font-medium text-[#faedd9]">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-[#d8b4fe] animate-spin-slow" />
                <span>AI sedang menyusun data...</span>
              </span>
              <span className="text-[10px] font-mono font-bold text-[#faedd9] animate-pulse">Memproses</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-black/40 overflow-hidden relative">
              <div className="h-full rounded-full bg-gradient-to-r from-[#a855f7] via-[#f472b6] to-[#faedd9] w-full animate-shimmer-slide" />
            </div>
          </div>
        )}

        {/* Suggested Prompts */}
        <div className="mt-3.5 pt-3 border-t border-[#faedd9]/10">
          <span className="text-[10px] font-semibold tracking-wider text-[#faedd9]/70 uppercase flex items-center gap-1 mb-1.5">
            <MessageSquare className="w-3 h-3 text-[#d8b4fe]" />
            <span>Contoh Prompt Cepat:</span>
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {suggestedPrompts.map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setPrompt(item.text)}
                className="text-left p-2 rounded-xl bg-[#faedd9]/5 hover:bg-[#faedd9]/12 border border-[#faedd9]/8 transition-all text-[11px] group cursor-pointer"
              >
                <span className="font-semibold text-[#fffdfa] group-hover:text-[#faedd9] block">
                  {item.title}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* AI Extraction Summary Feedback */}
      {lastResult && (
        <div className="liquid-card rounded-2xl p-3.5 border border-[#faedd9]/20 bg-[#251736]/60 shadow-sm">
          <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-[#faedd9]/10">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#d8b4fe]" />
              <span className="text-xs font-bold text-[#fffdfa]">Data Berhasil Diekstrak</span>
            </div>
            <button
              type="button"
              onClick={onSwitchToManual}
              className="flex items-center gap-1 text-[11px] font-semibold text-[#faedd9] hover:underline cursor-pointer"
            >
              <span>Edit Manual</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {/* Badge Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 text-[10.5px]">
            <div className="p-1.5 rounded-lg bg-[#faedd9]/5 border border-[#faedd9]/10">
              <span className="text-[#faedd9]/60 text-[9.5px] block">DELIVERY ADDRESS:</span>
              <span className="font-semibold text-white truncate block">
                {lastResult.deliveryAddress || currentDoc.deliveryAddress}
              </span>
            </div>

            <div className="p-1.5 rounded-lg bg-[#faedd9]/5 border border-[#faedd9]/10">
              <span className="text-[#faedd9]/60 text-[9.5px] block">BL NUMBER:</span>
              <span className="font-mono font-bold text-[#faedd9] truncate block">
                {lastResult.blNumber || currentDoc.blNumber}
              </span>
            </div>

            <div className="p-1.5 rounded-lg bg-[#faedd9]/5 border border-[#faedd9]/10">
              <span className="text-[#faedd9]/60 text-[9.5px] block">BARANG:</span>
              <span className="font-semibold text-[#d8b4fe] truncate block">
                {lastResult.description || currentDoc.items[0]?.description}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
