import React, { useState, useRef, useEffect } from 'react';
import { SuratJalanData, ShipperPreset, DriverPreset } from './types/suratJalan';
import { createEmptySuratJalan } from './utils/defaultData';
import { Navbar } from './components/Navbar';
import { FormEditor } from './components/FormEditor';
import { AIPromptEditor } from './components/AIPromptEditor';
import { HeroPromptView } from './components/HeroPromptView';
import { AILoadingOverlay } from './components/AILoadingOverlay';
import { SuratJalanPreview } from './components/SuratJalanPreview';
import { BatchImportModal } from './components/BatchImportModal';
import { PresetsModal } from './components/PresetsModal';
import { SuccessCelebrationModal } from './components/SuccessCelebrationModal';
import { extractMultipleSuratJalanWithAI, applyAIExtractionToDocument } from './services/geminiService';
import html2canvas from 'html2canvas-pro';
import { jsPDF } from 'jspdf';
import * as XLSX from 'xlsx';
import { Printer, Download, Eye, Sparkles, Sliders, ZoomIn, ZoomOut, RotateCcw, ArrowLeft, Layers } from 'lucide-react';

export const App: React.FC = () => {
  // First window is fully prompt form ('hero-prompt' | 'studio')
  const [viewState, setViewState] = useState<'hero-prompt' | 'studio'>('hero-prompt');
  
  // Studio Sidebar Mode ('ai' | 'manual')
  const [workflowMode, setWorkflowMode] = useState<'ai' | 'manual'>('manual');
  
  // Loading Animation State
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  // Success Celebration Modal State with Fireworks
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);

  // Batch Export & Print All States
  const [isBatchExporting, setIsBatchExporting] = useState<boolean>(false);
  const [batchExportProgress, setBatchExportProgress] = useState<{ current: number; total: number } | null>(null);
  const [isPrintingAll, setIsPrintingAll] = useState<boolean>(false);

  // Saved documents list state
  const [documents, setDocuments] = useState<SuratJalanData[]>(() => {
    const saved = localStorage.getItem('nls_surat_jalan_docs');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return [createEmptySuratJalan()];
  });

  const [currentId, setCurrentId] = useState<string>(documents[0]?.id || '');
  const [isPresetsOpen, setIsPresetsOpen] = useState<boolean>(false);
  const [isBatchOpen, setIsBatchOpen] = useState<boolean>(false);
  const [zoomLevel, setZoomLevel] = useState<number>(100);

  const documentRef = useRef<HTMLDivElement>(null);

  // Sync active document with list
  const currentDoc = documents.find((d) => d.id === currentId) || documents[0] || createEmptySuratJalan();

  // Save to local storage on edit
  useEffect(() => {
    localStorage.setItem('nls_surat_jalan_docs', JSON.stringify(documents));
  }, [documents]);

  const handleUpdateCurrentDoc = (updated: SuratJalanData) => {
    setDocuments((prev) => prev.map((doc) => (doc.id === updated.id ? updated : doc)));
  };

  const handleCreateNewDoc = () => {
    const newDoc = createEmptySuratJalan();
    setDocuments((prev) => [...prev, newDoc]);
    setCurrentId(newDoc.id);
    setViewState('hero-prompt');
  };

  const handleDeleteDocument = (id: string) => {
    if (documents.length <= 1) return;
    const filtered = documents.filter((d) => d.id !== id);
    setDocuments(filtered);
    if (currentId === id) {
      setCurrentId(filtered[0].id);
    }
  };

  const handleResetCurrentDoc = () => {
    if (window.confirm('Reset data Surat Jalan ini ke data awal?')) {
      const resetData = createEmptySuratJalan();
      resetData.id = currentDoc.id;
      handleUpdateCurrentDoc(resetData);
    }
  };

  const handleBatchImport = (newList: SuratJalanData[]) => {
    setDocuments((prev) => [...prev, ...newList]);
    if (newList.length > 0) {
      setCurrentId(newList[0].id);
    }
    setViewState('studio');
  };

  const handleSelectShipperPreset = (shipper: ShipperPreset) => {
    handleUpdateCurrentDoc({
      ...currentDoc,
      shipperName: shipper.name,
      shipperAddress: shipper.address,
    });
  };

  const handleSelectDriverPreset = (driver: DriverPreset) => {
    handleUpdateCurrentDoc({
      ...currentDoc,
      driverName: driver.name,
      phoneNo: driver.phone,
      licensePlate: driver.licensePlate,
      unitType: driver.unitType,
    });
  };

  // FULL PROMPT FORM SUBMIT FLOW WITH ANIMATED LOADING
  const handleHeroPromptSubmit = async (promptText: string) => {
    setIsGenerating(true);
    const startTime = Date.now();
    try {
      const extractedList = await extractMultipleSuratJalanWithAI(promptText);

      if (extractedList.length <= 1) {
        const singleResult = extractedList[0] || {};
        const updatedDoc = applyAIExtractionToDocument(currentDoc, singleResult);
        handleUpdateCurrentDoc(updatedDoc);
      } else {
        // Multi-document generation (e.g. 4 Surat Jalan)
        const updatedDocs: SuratJalanData[] = extractedList.map((ext, idx) => {
          const base = createEmptySuratJalan();
          base.id = `SJ-${Date.now()}-${idx + 1}`;
          base.title = `Surat Jalan #${idx + 1} (${ext.blNumber || 'Draft'})`;
          return applyAIExtractionToDocument(base, ext);
        });
        setDocuments(updatedDocs);
        setCurrentId(updatedDocs[0].id);
      }

      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 1600 - elapsed);
      setTimeout(() => {
        setIsGenerating(false);
        setViewState('studio');
        setShowSuccessModal(true);
      }, remaining);
    } catch (e) {
      console.error(e);
      setIsGenerating(false);
      setViewState('studio');
    }
  };

  // PRINT / EXPORT PDF METHOD (Active Document)
  const handlePrintPdf = () => {
    setIsPrintingAll(false);
    if (viewState !== 'studio') {
      setViewState('studio');
      setTimeout(() => {
        window.print();
      }, 250);
    } else {
      window.print();
    }
  };

  // PRINT ALL BATCH METHOD (All Tabs Consecutively)
  const handlePrintAllBatch = () => {
    if (viewState !== 'studio') {
      setViewState('studio');
    }
    setIsPrintingAll(true);
    setTimeout(() => {
      window.print();
      setTimeout(() => {
        setIsPrintingAll(false);
      }, 1200);
    }, 300);
  };

  // DOWNLOAD DIRECT PDF METHOD (Active Document)
  const handleDownloadPdf = async () => {
    if (!documentRef.current) return;
    try {
      const element = documentRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });
      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Surat_Jalan_${currentDoc.blNumber || 'NLS'}.pdf`);
    } catch (err) {
      console.error(err);
      window.print();
    }
  };

  // DOWNLOAD BATCH SEPARATE PDFs (1 PDF file per Surat Jalan, all exported in batch)
  const handleDownloadBatchPdf = async () => {
    if (documents.length === 0) return;
    setIsBatchExporting(true);
    try {
      for (let i = 0; i < documents.length; i++) {
        setBatchExportProgress({ current: i + 1, total: documents.length });
        const doc = documents[i];
        const el = document.getElementById(`batch-export-doc-${doc.id}`);
        if (!el) continue;

        const targetEl = (el.querySelector('.surat-jalan-document') as HTMLElement) || el;
        const canvas = await html2canvas(targetEl, {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff',
          onclone: (clonedDoc) => {
            const container = clonedDoc.getElementById('batch-export-container');
            if (container) {
              container.style.position = 'static';
              container.style.left = '0';
              container.style.top = '0';
            }
          },
        });

        const imgData = canvas.toDataURL('image/jpeg', 1.0);
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

        pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);

        // Sanitize filename based on BL number
        const blClean = (doc.blNumber || `SJ_${i + 1}`).replace(/[\\/:*?"<>|]/g, '_');
        const fileName = `Surat_Jalan_${blClean}.pdf`;
        pdf.save(fileName);

        // Small delay between file downloads to ensure browser allows multiple sequential downloads
        if (i < documents.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 400));
        }
      }
    } catch (err) {
      console.error('Batch export failed:', err);
      alert('Gagal mengekspor batch PDF: ' + err);
    } finally {
      setIsBatchExporting(false);
      setBatchExportProgress(null);
    }
  };

  // EXPORT TO EXCEL (Multi-Sheet Workbook for All Tabs)
  const handleExportExcel = () => {
    const wb = XLSX.utils.book_new();

    documents.forEach((doc, idx) => {
      const exportRows = doc.items.map((item) => ({
        'UNIT TYPE': doc.unitType,
        'DRIVER NAME': doc.driverName,
        'PHONE NO': doc.phoneNo,
        'LICENSE': doc.licensePlate,
        'SHIPPER': doc.shipperName,
        'DELIVERY ADDRESS': doc.deliveryAddress,
        'BL NUMBER': doc.blNumber,
        'PO NUMBER': doc.poNumber,
        'CONTAINER/SEAL': item.containerSeal,
        'DESCRIPTION OF GOODS': item.description,
        'PACKAGE (QTY)': item.packageQty,
        'WEIGHT (KG)': item.weightKg,
        'REMARKS': item.remarks,
        'Delivery Date': doc.deliveryDate,
        'Arrived Date': doc.arrivedDate,
        'Discharge Date': doc.dischargeDate,
      }));

      const ws = XLSX.utils.json_to_sheet(exportRows);
      const sheetName = (doc.blNumber || `SJ_${idx + 1}`).replace(/[\\/?*[\]]/g, '').slice(0, 31);
      XLSX.utils.book_append_sheet(wb, ws, sheetName);
    });

    const fileName = documents.length > 1 
      ? `Surat_Jalan_Batch_${documents.length}_Dokumen.xlsx`
      : `Surat_Jalan_${currentDoc.blNumber || 'NLS'}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  return (
    <div className="min-h-screen bg-[#181022] text-[#faf5ee] flex flex-col selection:bg-[#d8b4fe]/30">
      {/* Top Navbar with Chrome Tab Bar & Liquid Toolbar */}
      <Navbar
        currentDocument={currentDoc}
        documents={documents}
        onSelectDocument={(id) => {
          setCurrentId(id);
          setViewState('studio');
        }}
        onNewDocument={handleCreateNewDoc}
        onDeleteDocument={handleDeleteDocument}
        onResetDocument={handleResetCurrentDoc}
        onPrintPdf={handlePrintPdf}
        onExportExcel={handleExportExcel}
        onOpenPresets={() => setIsPresetsOpen(true)}
        onOpenBatchModal={() => setIsBatchOpen(true)}
        onOpenPromptView={() => setViewState('hero-prompt')}
        isStudioView={viewState === 'studio'}
        onDownloadBatchPdf={handleDownloadBatchPdf}
        onPrintAllBatch={handlePrintAllBatch}
      />

      {/* VIEW STATE 1: FULL PROMPT FORM WINDOW (FIRST WINDOW) */}
      {viewState === 'hero-prompt' ? (
        <HeroPromptView
          onSubmitPrompt={handleHeroPromptSubmit}
          onGoToManual={() => {
            setViewState('studio');
            setWorkflowMode('manual');
          }}
        />
      ) : (
        /* VIEW STATE 2: STUDIO & PREVIEW WORKSPACE GRID */
        <main className="studio-main-grid flex-1 grid grid-cols-1 xl:grid-cols-[480px_1fr] gap-5 p-4 md:p-6 max-w-[1900px] w-full mx-auto animate-fade-in">
          {/* Left Column: Form & Automation Panel */}
          <div className="no-print space-y-3.5">
            {/* WORKFLOW MODE SELECTOR & BACK TO PROMPT */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setViewState('hero-prompt')}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#faedd9] bg-[#faedd9]/10 hover:bg-[#faedd9]/15 border border-[#faedd9]/15 transition-all cursor-pointer"
                title="Kembali ke Jendela Prompt Penuh"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Prompt Penuh</span>
              </button>

              <div className="liquid-card rounded-2xl p-1 flex-1 flex items-center gap-1 border border-[#faedd9]/12 shadow-sm bg-[#231730]">
                <button
                  type="button"
                  onClick={() => setWorkflowMode('ai')}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    workflowMode === 'ai'
                      ? 'bg-[#faedd9] text-[#181022] shadow-sm'
                      : 'text-[#c4b5fd]/70 hover:text-white hover:bg-white/[0.03]'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Prompt Cepat</span>
                </button>

                <button
                  type="button"
                  onClick={() => setWorkflowMode('manual')}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    workflowMode === 'manual'
                      ? 'bg-[#faedd9] text-[#181022] shadow-sm'
                      : 'text-[#c4b5fd]/70 hover:text-white hover:bg-white/[0.03]'
                  }`}
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Input Manual</span>
                </button>
              </div>
            </div>

            {/* Conditional Workflow Rendering */}
            {workflowMode === 'ai' ? (
              <AIPromptEditor
                currentDoc={currentDoc}
                onUpdateDocument={handleUpdateCurrentDoc}
                onSwitchToManual={() => setWorkflowMode('manual')}
                onDocumentGenerated={() => setShowSuccessModal(true)}
              />
            ) : (
              <FormEditor
                data={currentDoc}
                onChange={handleUpdateCurrentDoc}
                onOpenPresets={() => setIsPresetsOpen(true)}
                onOpenBatchModal={() => setIsBatchOpen(true)}
              />
            )}
          </div>

          {/* Right Column: Live Document Preview Canvas */}
          <div className="preview-card-container liquid-glass rounded-3xl p-4 md:p-6 flex flex-col items-center overflow-hidden relative shadow-xl border border-[#faedd9]/12 bg-[#21142e]/90">
            {/* Canvas Floating Top Toolbar */}
            <div className="w-full flex items-center justify-between pb-3.5 mb-3.5 border-b border-[#faedd9]/10 no-print">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-[#faedd9]/15 flex items-center justify-center text-[#faedd9]">
                  <Eye className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="text-xs font-bold text-[#fffdfa]">Preview Dokumen Cetak</span>
                  <span className="text-[10px] text-[#faedd9]/70 ml-2 hidden sm:inline">Standar A4 Portrait</span>
                </div>
              </div>

              {/* Zoom & Action Controls */}
              <div className="flex items-center gap-2">
                <div className="hidden sm:flex items-center gap-1 bg-[#faedd9]/6 p-1 rounded-xl border border-[#faedd9]/10">
                  <button
                    type="button"
                    onClick={() => setZoomLevel((prev) => Math.max(60, prev - 10))}
                    className="p-1 rounded-lg text-[#c4b5fd]/70 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
                    title="Zoom Out"
                  >
                    <ZoomOut className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-[11px] font-mono px-2 text-[#faedd9] select-none">
                    {zoomLevel}%
                  </span>
                  <button
                    type="button"
                    onClick={() => setZoomLevel((prev) => Math.min(130, prev + 10))}
                    className="p-1 rounded-lg text-[#c4b5fd]/70 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
                    title="Zoom In"
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setZoomLevel(100)}
                    className="p-1 rounded-lg text-[#c4b5fd]/70 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer ml-0.5"
                    title="Reset Zoom"
                  >
                    <RotateCcw className="w-3 h-3" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleDownloadPdf}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-[#faedd9] bg-[#faedd9]/8 hover:bg-[#faedd9]/15 border border-[#faedd9]/15 transition-all cursor-pointer"
                  title="Download surat jalan yang sedang aktif"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Direct PDF</span>
                </button>

                <button
                  type="button"
                  onClick={handlePrintPdf}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-[#181022] bg-[#faedd9] hover:bg-[#fffdfa] hover:shadow-md transition-all cursor-pointer"
                  title="Cetak tab surat jalan aktif"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Cetak / PDF</span>
                </button>

                {documents.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={handleDownloadBatchPdf}
                      disabled={isBatchExporting}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-[#181022] bg-gradient-to-r from-[#faedd9] via-[#fff5e8] to-[#faedd9] hover:shadow-md transition-all cursor-pointer active:scale-95 shadow-sm disabled:opacity-50"
                      title="Download seluruh surat jalan (1 file PDF terpisah per surat jalan)"
                    >
                      <Layers className="w-3.5 h-3.5 text-[#7e22ce]" />
                      <span>Batch PDF ({documents.length} File)</span>
                    </button>

                    <button
                      type="button"
                      onClick={handlePrintAllBatch}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-[#faedd9] bg-white/[0.08] hover:bg-white/[0.14] border border-[#faedd9]/20 transition-all cursor-pointer active:scale-95"
                      title="Cetak semua surat jalan sekaligus"
                    >
                      <Printer className="w-3.5 h-3.5 text-[#d8b4fe]" />
                      <span className="hidden sm:inline">Cetak Semua</span>
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Document Paper Container with Zoom Transform */}
            <div className="preview-scroll-container overflow-x-auto w-full flex justify-center py-3 flex-1 scrollbar-thin scrollbar-thumb-[#4a2e63]">
              <div
                className={`preview-zoom-wrapper ${isPrintingAll ? 'no-print' : ''}`}
                style={{
                  transform: `scale(${zoomLevel / 100})`,
                  transformOrigin: 'top center',
                  transition: 'transform 0.15s ease-out',
                }}
              >
                <SuratJalanPreview data={currentDoc} documentRef={documentRef} />
              </div>
            </div>
          </div>
        </main>
      )}

      {/* HIDDEN BATCH CONTAINER FOR MULTI-PAGE EXPORT AND BATCH PRINTING */}
      <div
        id="batch-export-container"
        className={`${
          isPrintingAll
            ? 'block w-full'
            : 'fixed left-[-9999px] top-0 pointer-events-none no-print'
        }`}
      >
        {documents.map((doc) => (
          <div
            key={doc.id}
            id={`batch-export-doc-${doc.id}`}
            className={isPrintingAll ? 'batch-print-page' : ''}
          >
            <SuratJalanPreview data={doc} />
          </div>
        ))}
      </div>

      {/* FLOATING BATCH EXPORT PROGRESS TOAST */}
      {isBatchExporting && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3.5 px-6 py-4 rounded-3xl liquid-hero-glass border-[0.5px] border-[#faedd9]/30 shadow-2xl backdrop-blur-2xl animate-fade-in text-[#fffdfa]">
          <div className="w-5 h-5 border-2 border-[#faedd9]/30 border-t-[#faedd9] rounded-full animate-spin shrink-0" />
          <div className="text-xs sm:text-sm font-semibold">
            <span>Mengekspor Batch PDF: </span>
            <span className="text-[#faedd9] font-bold font-mono">
              File {batchExportProgress?.current || 1} dari {batchExportProgress?.total || documents.length} (File Terpisah)
            </span>
            <span className="text-[#c4b5fd]/70 ml-1.5 text-xs">(Resolusi Tinggi A4)...</span>
          </div>
        </div>
      )}

      {/* CUTE SIMPLE FOOTER */}
      <footer className="no-print py-4 text-center text-xs text-[#faedd9]/70 flex items-center justify-center gap-1.5 select-none tracking-wide">
        <span>Made for Jean</span>
        <span className="text-[#f472b6] text-sm">♥</span>
      </footer>

      {/* FULL-SCREEN AI LOADING OVERLAY ANIMATION */}
      <AILoadingOverlay isOpen={isGenerating} />

      {/* Modals with Apple Liquid Frosted Styling */}
      <BatchImportModal
        isOpen={isBatchOpen}
        onClose={() => setIsBatchOpen(false)}
        onImport={handleBatchImport}
      />

      <PresetsModal
        isOpen={isPresetsOpen}
        onClose={() => setIsPresetsOpen(false)}
        onSelectShipper={handleSelectShipperPreset}
        onSelectDriver={handleSelectDriverPreset}
      />

      {/* CELEBRATION MODAL WITH FIREWORKS OVER PREVIEW SCREEN */}
      <SuccessCelebrationModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        documents={documents}
        currentDocId={currentId}
        onSelectDoc={setCurrentId}
        onPrint={handlePrintPdf}
        onDownloadPdf={handleDownloadPdf}
        onDownloadBatchPdf={handleDownloadBatchPdf}
        onPrintAllBatch={handlePrintAllBatch}
      />
    </div>
  );
};

export default App;
