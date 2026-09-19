import React, { useState } from 'react';
import {
  Sparkles,
  Mic,
  MicOff,
  RotateCcw,
  ArrowRight,
  MessageSquare,
  Sliders,
  Check,
} from 'lucide-react';
import { paraphraseLogisticsPrompt } from '../services/geminiService';
import { HighlightedPromptTextarea } from './HighlightedPromptTextarea';
import nlsLogo from '../assets/nlslogo.png';

interface HeroPromptViewProps {
  onSubmitPrompt: (promptText: string) => void;
  onGoToManual: () => void;
}

export const HeroPromptView: React.FC<HeroPromptViewProps> = ({
  onSubmitPrompt,
  onGoToManual,
}) => {
  const [prompt, setPrompt] = useState<string>(
    'Buatkan saya surat jalan untuk tanggal 18 Maret 2026 dengan delivery address ke Terminal Peti Kemas Koja (UTC3), dengan BL number SITR160334, PO number PO-2026/089, barang COCONUT WATER, Weight 22000 KGS, Remarks 1 X 40 HR'
  );
  const [isParaphrasing, setIsParaphrasing] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);

  // Suggested Prompts
  const suggestedPrompts = [
    {
      title: '⚡ Batch 4 Surat Jalan (Koja UTC3)',
      text: 'Buatkan saya 4 surat jalan untuk tanggal 18 Maret 2026 dengan delivery address ke Terminal Peti Kemas Koja (UTC3):\n1. BL SITR160334, PO PO-2026/089, barang COCONUT WATER, Weight 22000 KGS, Remarks 1 X 40 HR\n2. BL SITR160335, PO PO-2026/090, barang COCONUT WATER, Weight 21800 KGS, Remarks 1 X 40 HR\n3. BL SITR160336, PO PO-2026/091, barang PALM WAX, Weight 19500 KGS, Remarks 1 X 20 FT\n4. BL SITR160337, PO PO-2026/092, barang PLASTIC WARE, Weight 8500 KGS, Remarks 1 X 40 HC',
    },
    {
      title: '☕ Cotti Coffee ke TPK Bitung',
      text: 'Buatkan surat jalan untuk tanggal 15 Maret 2026 tujuan Terminal Petikemas Bitung (TPK Bitung), BL number SITRBISH160334, barang COCONUT WATER, berat 22000 KGS, remarks 1 X 40 HR, supir Ahmad Supardi, unit Trailer 40ft',
    },
    {
      title: '📦 Plastic Ware ke Mustika Alam',
      text: 'Buat surat jalan tanggal 14 Sep 2026, delivery address PT Terminal Mustika Alam Lestari, BL JKTG58923800, PO MDL-2643957, barang PLASTIC KITCHEN WARE, berat 8732,5 KGS, remarks 1 X 40 HC',
    },
    {
      title: '💬 Format Chat WhatsApp Klien',
      text: 'Pagi tim NLS, tolong buat surat jalan tanggal 20 Maret 2026. Alamat kirim: New Priok Container Terminal One (NPCT1). BL: NPCT-90123. PO: PO-JKT-88. Muatan: FROZEN TUNA, berat: 24500 KGS, remarks: 1 X 40 REEFER. Supir: Budi Santoso (B 9123 NLS).',
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

  // Paraphrase Prompt
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

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!prompt.trim()) return;
    onSubmitPrompt(prompt);
  };

  return (
    <div className="min-h-[calc(100vh-130px)] flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-8 md:py-14 animate-fade-in relative">
      <div className="w-full max-w-6xl relative">
        {/* AMBIENT LIQUID ORBS (Behind the glass card) */}
        <div className="absolute -top-24 -left-20 w-[420px] h-[420px] bg-[#a855f7]/25 rounded-full blur-[110px] pointer-events-none animate-liquid-float" />
        <div className="absolute -bottom-24 -right-16 w-[450px] h-[450px] bg-[#faedd9]/15 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-1/3 -right-20 w-80 h-80 bg-[#f472b6]/20 rounded-full blur-[90px] pointer-events-none animate-pulse" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[350px] bg-[#7e22ce]/20 rounded-full blur-[120px] pointer-events-none" />

        {/* Title Header */}
        <div className="text-center mb-8 sm:mb-10 relative z-10">
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/[0.06] border border-[#faedd9]/20 text-[#faedd9] text-xs sm:text-sm font-semibold mb-4 backdrop-blur-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)]">
            <img src={nlsLogo} alt="NLS" className="w-4 h-4 object-contain rounded-full shadow-sm" />
            <span>Asisten Cerdas Surat Jalan</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-[#fffdfa] tracking-tight leading-tight">
            Buat Surat Jalan Otomatis
          </h1>
          <p className="text-sm sm:text-base md:text-lg text-[#faedd9]/80 mt-3 max-w-2xl mx-auto leading-relaxed">
            Ketik atau diktekan kalimat detail pengiriman dalam Bahasa Indonesia. AI menyusun dokumen resmi A4 standar PT Niaga Logistics Sejahtera.
          </p>
        </div>

        {/* ULTRA-LIQUID EXPANSIVE PROMPT FORM CARD (Delicate Thin Hairline Border) */}
        <div className="relative z-10 rounded-[36px] sm:rounded-[44px] md:rounded-[48px] p-6 sm:p-9 md:p-12 lg:p-14 liquid-hero-glass overflow-hidden transition-all duration-300">
          {/* Specular Prism Reflection Overlays (Thin 0.5px Top Highlight) */}
          <div className="absolute inset-x-16 top-0 h-[0.5px] bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none" />
          <div className="absolute -top-36 -left-36 w-80 h-80 bg-gradient-to-br from-white/15 via-[#d8b4fe]/10 to-transparent rounded-full blur-3xl pointer-events-none" />

          <form onSubmit={handleSubmit} className="flex flex-col relative z-10">
            {/* Seamless Liquid Textarea Canvas with Dynamic Aspect Bolding */}
            <div className="relative mb-4 sm:mb-6 p-1 sm:p-2 transition-all duration-300">
              <HighlightedPromptTextarea
                rows={8}
                value={prompt}
                onChange={setPrompt}
                placeholder="Contoh: Buatkan saya surat jalan untuk tanggal 18 Maret 2026 dengan delivery address ke Terminal Peti Kemas Koja (UTC3), dengan BL number SITR160334, PO number PO-2026/089, barang COCONUT WATER, Weight 22000 KGS, Remarks 1 X 40 HR..."
                minHeight="260px"
              />
            </div>

            {/* Bottom Controls Bar Inside Prompt Form */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-4 sm:pt-6 border-t border-white/[0.06]">
              {/* LEFT BOTTOM CORNER: LIQUID PARAPHRASE BUTTON */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleParaphrase}
                  disabled={isParaphrasing || !prompt.trim()}
                  className="flex items-center gap-2.5 px-5 sm:px-6 py-3 sm:py-3.5 rounded-2xl text-sm sm:text-base font-bold text-[#faedd9] liquid-glass-pill hover:scale-105 active:scale-95 transition-all disabled:opacity-40 cursor-pointer shadow-md"
                  title="Rapikan kalimat instruksi secara otomatis dengan AI"
                >
                  {isParaphrasing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-[#faedd9]/30 border-t-[#faedd9] rounded-full animate-spin" />
                      <span>Merapikan kata...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-[#d8b4fe]" />
                      <span>✨ Parafrase Kata</span>
                    </>
                  )}
                </button>
              </div>

              {/* RIGHT BOTTOM CORNER: VOICE, CLEAR & EXPANSIVE SUBMIT BUTTON */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleToggleVoice}
                  className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center transition-all cursor-pointer liquid-glass-pill ${
                    isListening
                      ? '!bg-[#f472b6] text-white animate-bounce shadow-lg shadow-pink-500/40 border-pink-400'
                      : 'text-[#faedd9] hover:scale-105 active:scale-95'
                  }`}
                  title={isListening ? 'Mendengarkan...' : 'Dikte Suara'}
                >
                  {isListening ? <MicOff className="w-5 h-5 sm:w-6 sm:h-6" /> : <Mic className="w-5 h-5 sm:w-6 sm:h-6 text-[#d8b4fe]" />}
                </button>

                {prompt && (
                  <button
                    type="button"
                    onClick={() => setPrompt('')}
                    className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center liquid-glass-pill text-[#c4b5fd]/70 hover:text-white hover:scale-105 active:scale-95 transition-all cursor-pointer"
                    title="Hapus Teks"
                  >
                    <RotateCcw className="w-5 h-5" />
                  </button>
                )}

                <button
                  type="submit"
                  disabled={!prompt.trim()}
                  className="flex items-center gap-3 px-8 sm:px-10 md:px-12 py-3.5 sm:py-4 md:py-4.5 rounded-2xl text-base sm:text-lg font-black text-[#181022] bg-gradient-to-r from-[#faedd9] via-[#fff7ed] to-[#faedd9] hover:shadow-[0_15px_45px_rgba(250,237,217,0.45)] hover:scale-105 active:scale-95 disabled:opacity-40 transition-all cursor-pointer shadow-[0_10px_30px_rgba(250,237,217,0.3),inset_0_2px_2px_rgba(255,255,255,0.9)] group"
                >
                  <span>Buat Surat Jalan</span>
                  <ArrowRight className="w-5 h-5 text-[#7e22ce] group-hover:translate-x-1.5 transition-transform" />
                </button>
              </div>
            </div>
          </form>

          {/* Liquid Prompt Suggestion Chips */}
          <div className="mt-8 sm:mt-10 pt-6 sm:pt-8 border-t border-white/[0.06]">
            <div className="flex items-center gap-2 text-[#faedd9]/80 text-xs sm:text-sm font-bold mb-4">
              <MessageSquare className="w-4 h-4 text-[#d8b4fe]" />
              <span>Contoh Prompt Cepat:</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {suggestedPrompts.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setPrompt(item.text)}
                  className="text-left p-4 sm:p-5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.06] hover:border-[#faedd9]/25 backdrop-blur-xl transition-all group cursor-pointer hover:scale-[1.015] shadow-[inset_0_1px_1px_rgba(255,255,255,0.06)]"
                >
                  <span className="font-extrabold text-[#fffdfa] group-hover:text-[#faedd9] block mb-1 text-sm sm:text-base">
                    {item.title}
                  </span>
                  <span className="text-[#c4b5fd]/70 line-clamp-2 text-xs sm:text-sm leading-relaxed">
                    {item.text}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* BELOW THE PROMPT FORM: LINK TO MANUAL INSTEAD */}
        <div className="mt-8 text-center relative z-10">
          <button
            type="button"
            onClick={onGoToManual}
            className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-2xl text-sm sm:text-base font-medium text-[#faedd9]/85 hover:text-[#fffdfa] bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.06] hover:border-[#faedd9]/25 backdrop-blur-xl transition-all cursor-pointer group shadow-sm hover:scale-105 active:scale-95"
          >
            <Sliders className="w-4 h-4 sm:w-5 sm:h-5 text-[#d8b4fe]" />
            <span>Atau ingin menginput langsung secara manual?</span>
            <span className="font-bold underline text-[#faedd9] ml-1">
              Buka Form Manual ➔
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
