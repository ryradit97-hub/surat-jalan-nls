import React from 'react';
import { Plus, RefreshCw, X, Sparkles, FileText } from 'lucide-react';
import { SuratJalanData } from '../types/suratJalan';
import nlsLogo from '../assets/nlslogo.png';

interface NavbarProps {
  currentDocument: SuratJalanData;
  documents: SuratJalanData[];
  onSelectDocument: (id: string) => void;
  onNewDocument: () => void;
  onResetDocument: () => void;
  onDeleteDocument: (id: string) => void;
  onOpenPromptView: () => void;
  isStudioView: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentDocument,
  documents,
  onSelectDocument,
  onNewDocument,
  onResetDocument,
  onDeleteDocument,
  onOpenPromptView,
  isStudioView,
}) => {
  return (
    <header className="sticky top-0 z-40 no-print flex flex-col bg-[#140d1c] border-b border-[#faedd9]/10 shadow-lg">
      {/* 1. CHROME BROWSER TAB STRIP WITH SOFT PASTEL ACCENTS - ONLY IN STUDIO VIEW */}
      {isStudioView && (
        <div className="flex items-center justify-between px-3 pt-2 bg-[#100a17] border-b border-[#faedd9]/8 select-none">
          <div className="flex items-center gap-2 overflow-hidden flex-1">
            {/* Pastel window dots */}
            <div className="flex items-center gap-1.5 px-2 py-1 mr-2 shrink-0">
              <div className="w-2.5 h-2.5 rounded-full bg-[#f472b6] opacity-80" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#fde047] opacity-80" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#a7f3d0] opacity-80" />
            </div>

            {/* Chrome Tab Strip */}
            <div className="flex items-end gap-1 overflow-x-auto scrollbar-none py-0.5">
              {documents.map((doc, idx) => {
                const isActive = doc.id === currentDocument.id;
                return (
                  <div
                    key={doc.id}
                    onClick={() => onSelectDocument(doc.id)}
                    className={`group relative flex items-center gap-2 px-3.5 py-2 rounded-t-xl text-xs font-medium cursor-pointer transition-all duration-150 max-w-[210px] min-w-[130px] border-t border-x ${
                      isActive
                        ? 'bg-[#251736] text-[#faedd9] border-[#faedd9]/20 border-t-[#d8b4fe] shadow-sm z-10 -mb-[1px]'
                        : 'bg-white/[0.02] text-[#d8b4fe]/60 hover:text-[#fffdfa] hover:bg-white/[0.04] border-transparent'
                    }`}
                  >
                    <FileText className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-[#d8b4fe]' : 'text-[#c4b5fd]/50'}`} />
                    <span className="truncate font-mono text-[11.5px]">
                      #{idx + 1} {doc.blNumber || 'Draft SJ'}
                    </span>

                    {/* Tab close cross */}
                    {documents.length > 1 && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteDocument(doc.id);
                        }}
                        className={`w-4 h-4 rounded-full flex items-center justify-center transition-colors shrink-0 ml-auto ${
                          isActive
                            ? 'text-[#c4b5fd] hover:text-white hover:bg-white/10'
                            : 'opacity-0 group-hover:opacity-100 text-[#c4b5fd]/60 hover:text-[#f472b6] hover:bg-white/10'
                        }`}
                        title="Tutup Tab"
                      >
                        <X className="w-2.5 h-2.5" />
                      </button>
                    )}
                  </div>
                );
              })}

              {/* New Tab (+) Button */}
              <button
                type="button"
                onClick={onNewDocument}
                className="w-7 h-7 mb-0.5 ml-1 rounded-full flex items-center justify-center text-[#d8b4fe]/70 hover:text-[#faedd9] hover:bg-white/[0.06] transition-all shrink-0 active:scale-95"
                title="Tab Surat Jalan Baru"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Document Counter Badge */}
          <div className="hidden lg:flex items-center gap-1.5 text-[11px] font-medium text-[#faedd9]/80 bg-[#faedd9]/6 px-2.5 py-1 rounded-full border border-[#faedd9]/10">
            <span className="w-1.5 h-1.5 rounded-full bg-[#d8b4fe]" />
            <span>{documents.length} Dokumen</span>
          </div>
        </div>
      )}

      {/* 2. SIMPLE PURPLE & CREAM TOOLBAR */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 bg-[#1e132b]/95">
        {/* Brand identity - ALWAYS VISIBLE */}
        <div className="flex items-center gap-2.5">
          <img
            src={nlsLogo}
            alt="PT NIAGA LOGISTICS SEJAHTERA"
            className="w-9 h-9 object-contain drop-shadow-md shrink-0"
          />
          <div className="flex flex-col justify-center leading-none select-none">
            <span className="font-black text-xs sm:text-[13px] text-[#fffdfa] tracking-wider uppercase">
              PT NIAGA LOGISTICS
            </span>
            <span className="font-bold text-[10.5px] sm:text-[11px] text-[#faedd9] tracking-[0.18em] uppercase mt-0.5">
              SEJAHTERA
            </span>
          </div>
        </div>

        {/* Toolbar Actions - ONLY VISIBLE IN STUDIO VIEW */}
        {isStudioView && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onResetDocument}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-[#c4b5fd]/70 hover:text-[#fffdfa] hover:bg-white/[0.06] transition-all cursor-pointer"
              title="Reset formulir aktif ke data awal"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Reset</span>
            </button>

            <button
              type="button"
              onClick={onOpenPromptView}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-[#181022] bg-[#faedd9] hover:bg-[#fffdfa] transition-all active:scale-95 shadow-sm cursor-pointer"
              title="Buka Form Prompt AI Penuh"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#7e22ce]" />
              <span>Prompt AI Baru</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
