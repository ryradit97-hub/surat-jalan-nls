import React, { useState, useRef, useEffect } from 'react';
import { SuratJalanData, ShipperPreset, DriverPreset } from './types/suratJalan';
import { AppTheme } from './types/theme';
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
import { RainModal } from './components/RainModal';
import { openWhatsAppDirect } from './utils/whatsappHelper';
import { extractMultipleSuratJalanWithAI, applyAIExtractionToDocument } from './services/geminiService';
import html2canvas from 'html2canvas-pro';
import { jsPDF } from 'jspdf';
import * as XLSX from 'xlsx';
import { Printer, Download, Eye, Sparkles, Sliders, ZoomIn, ZoomOut, RotateCcw, ArrowLeft, Layers, MessageSquare, X, ChevronDown, Check } from 'lucide-react';

export const App: React.FC = () => {
  // First window is fully prompt form ('hero-prompt' | 'studio')
  const [viewState, setViewState] = useState<'hero-prompt' | 'studio'>('hero-prompt');
  
  // Studio Sidebar Mode ('ai' | 'manual')
  const [workflowMode, setWorkflowMode] = useState<'ai' | 'manual'>('manual');
  
  // Loading Animation State
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  // Success Celebration Modal State with Fireworks
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);

  // Rain Easter Egg Modal Dialogue State
  const [isRainModalOpen, setIsRainModalOpen] = useState<boolean>(false);

  // Batch Export & Print All States
  const [isBatchExporting, setIsBatchExporting] = useState<boolean>(false);
  const [batchExportProgress, setBatchExportProgress] = useState<{ current: number; total: number } | null>(null);
  const [isPrintingAll, setIsPrintingAll] = useState<boolean>(false);
  const [exportMode, setExportMode] = useState<'batch' | 'whatsapp'>('batch');
  const [whatsappToastInfo, setWhatsappToastInfo] = useState<{
    isOpen: boolean;
    count: number;
    phone: string;
  } | null>(null);

  // Saved documents list state
  const [documents, setDocuments] = useState<SuratJalanData[]>(() => {
    const saved = localStorage.getItem('nls_surat_jalan_docs');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((doc: SuratJalanData) => ({
            ...doc,
            items: doc.items.map((it) => ({
              ...it,
              // Strip lingering sample OTPU container seal
              containerSeal: it.containerSeal?.includes('OTPU6617747') ? '' : (it.containerSeal || ''),
            })),
          }));
        }
      } catch (e) {
        console.error(e);
      }
    }
    return [createEmptySuratJalan()];
  });

  // Auto-clean any legacy sample OTPU containerSeal on mount
  useEffect(() => {
    setDocuments((prev) => {
      let modified = false;
      const cleaned = prev.map((doc) => ({
        ...doc,
        items: doc.items.map((it) => {
          if (it.containerSeal && it.containerSeal.includes('OTPU6617747')) {
            modified = true;
            return { ...it, containerSeal: '' };
          }
          return it;
        }),
      }));
      return modified ? cleaned : prev;
    });
  }, []);

  const [currentId, setCurrentId] = useState<string>(documents[0]?.id || '');
  const [isPresetsOpen, setIsPresetsOpen] = useState<boolean>(false);
  const [isBatchOpen, setIsBatchOpen] = useState<boolean>(false);
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [activeDropdown, setActiveDropdown] = useState<'download' | 'print' | 'whatsapp' | null>(null);

  // Theme Switcher State ('venus' | 'earth-cream' | 'sea-nls' | 'white-moon')
  const [theme, setTheme] = useState<AppTheme>(() => {
    const saved = localStorage.getItem('nls_app_theme') as AppTheme;
    if (saved === 'yoga-purple') return 'venus';
    if (saved && (saved === 'venus' || saved === 'earth-cream' || saved === 'sea-nls' || saved === 'white-moon')) {
      return saved;
    }
    return 'venus';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('nls_app_theme', theme);
  }, [theme]);

  // Dismiss toolbar dropdown when clicked outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target?.closest('.toolbar-dropdown-container')) {
        setActiveDropdown(null);
      }
    };
    if (activeDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [activeDropdown]);

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

  // SEND ALL DOCS OF PDF VIA WHATSAPP (Separate PDF files for all Surat Jalan)
  const handleSendAllDocsPdfWhatsApp = async () => {
    if (documents.length === 0) return;

    let phone = currentDoc.phoneNo?.trim() || '';
    if (!phone) {
      const inputPhone = window.prompt(
        'Nomor kontak WhatsApp tujuan belum diisi.\nMasukkan nomor WhatsApp tujuan (contoh: 08123456789):',
        ''
      );
      if (inputPhone === null) return; // user cancelled
      phone = inputPhone.trim();
    }

    setExportMode('whatsapp');
    setIsBatchExporting(true);
    const pdfFiles: File[] = [];

    try {
      for (let i = 0; i < documents.length; i++) {
        setBatchExportProgress({ current: i + 1, total: documents.length });
        const doc = documents[i];

        let canvas: HTMLCanvasElement | null = null;
        const el = document.getElementById(`batch-export-doc-${doc.id}`);
        if (el) {
          const targetEl = (el.querySelector('.surat-jalan-document') as HTMLElement) || el;
          canvas = await html2canvas(targetEl, {
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
        } else if (documentRef.current && doc.id === currentDoc.id) {
          canvas = await html2canvas(documentRef.current, {
            scale: 2,
            useCORS: true,
            logging: false,
            backgroundColor: '#ffffff',
          });
        }

        if (!canvas) continue;

        const imgData = canvas.toDataURL('image/jpeg', 1.0);
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);

        const blClean = (doc.blNumber || `SJ_${i + 1}`).replace(/[\\/:*?"<>|]/g, '_');
        const fileName = `Surat_Jalan_${blClean}.pdf`;

        const blob = pdf.output('blob');
        const file = new File([blob], fileName, { type: 'application/pdf' });
        pdfFiles.push(file);

        // Download file locally to Downloads shelf
        pdf.save(fileName);

        if (i < documents.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 350));
        }
      }

      // 1. Try native Web Share API (Supported on Mobile browsers, iOS Safari, Mac Safari/Chrome)
      let sharedViaNative = false;
      if (
        typeof navigator !== 'undefined' &&
        typeof (navigator as any).canShare === 'function' &&
        pdfFiles.length > 0
      ) {
        try {
          if ((navigator as any).canShare({ files: pdfFiles })) {
            await navigator.share({
              files: pdfFiles,
              title: `Surat Jalan NLS (${pdfFiles.length} Dokumen PDF)`,
              text: `Berikut ${pdfFiles.length} berkas PDF Surat Jalan resmi PT Niaga Logistics Sejahtera.`
            });
            sharedViaNative = true;
          }
        } catch (shareErr: any) {
          if (shareErr.name !== 'AbortError') {
            console.warn('Native share failed, using WhatsApp Web fallback:', shareErr);
          }
        }
      }

      // 2. Fallback: Open WhatsApp directly to driver's phone number and show guide toast
      if (!sharedViaNative) {
        openWhatsAppDirect(phone);
        setWhatsappToastInfo({
          isOpen: true,
          count: pdfFiles.length,
          phone: phone,
        });
      }
    } catch (err) {
      console.error('Gagal menyiapkan PDF untuk WhatsApp:', err);
      alert('Gagal menyiapkan berkas PDF: ' + err);
    } finally {
      setIsBatchExporting(false);
      setBatchExportProgress(null);
    }
  };

  // SEND SINGLE DOC PDF VIA WHATSAPP (Current Tab Document Only)
  const handleSendSingleDocPdfWhatsApp = async () => {
    let phone = currentDoc.phoneNo?.trim() || '';
    if (!phone) {
      const inputPhone = window.prompt(
        'Nomor kontak WhatsApp tujuan belum diisi.\nMasukkan nomor WhatsApp tujuan (contoh: 08123456789):',
        ''
      );
      if (inputPhone === null) return;
      phone = inputPhone.trim();
    }

    if (!documentRef.current) return;
    try {
      const canvas = await html2canvas(documentRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      });
      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);

      const blClean = (currentDoc.blNumber || 'NLS').replace(/[\\/:*?"<>|]/g, '_');
      const fileName = `Surat_Jalan_${blClean}.pdf`;
      const blob = pdf.output('blob');
      const file = new File([blob], fileName, { type: 'application/pdf' });

      let sharedViaNative = false;
      if (
        navigator.share &&
        typeof (navigator as any).canShare === 'function' &&
        /Mobi|Android|iPhone|iPad|Macintosh/i.test(navigator.userAgent)
      ) {
        try {
          if ((navigator as any).canShare({ files: [file] })) {
            await navigator.share({
              files: [file],
              title: `Surat Jalan NLS (${fileName})`,
              text: `Berikut berkas PDF Surat Jalan resmi PT Niaga Logistics Sejahtera (B/L: ${currentDoc.blNumber || '-'}).`,
            });
            sharedViaNative = true;
          }
        } catch (shareErr: any) {
          if (shareErr.name !== 'AbortError') {
            console.warn('Native share failed, using WhatsApp fallback:', shareErr);
          }
        }
      }

      if (!sharedViaNative) {
        pdf.save(fileName);
        openWhatsAppDirect(phone);
        setWhatsappToastInfo({
          isOpen: true,
          count: 1,
          phone: phone,
        });
      }
    } catch (err) {
      console.error('Gagal mengirim PDF ke WhatsApp:', err);
      alert('Gagal menyiapkan PDF: ' + err);
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
    setExportMode('batch');
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
    <div className="min-h-screen theme-app-shell bg-[#181022] text-[#faf5ee] flex flex-col selection:bg-[#d8b4fe]/30">
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
        onOpenPromptView={() => setViewState('hero-prompt')}
        isStudioView={viewState === 'studio'}
        currentTheme={theme}
        onSelectTheme={setTheme}
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
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold theme-btn-back transition-all cursor-pointer border"
                title="Kembali ke Jendela Prompt Penuh"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Prompt Penuh</span>
              </button>

              <div className="theme-workflow-bar rounded-2xl p-1 flex-1 flex items-center gap-1 border shadow-sm">
                <button
                  type="button"
                  onClick={() => setWorkflowMode('ai')}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    workflowMode === 'ai'
                      ? 'theme-workflow-btn-active shadow-sm'
                      : 'theme-workflow-btn-inactive'
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
                      ? 'theme-workflow-btn-active shadow-sm'
                      : 'theme-workflow-btn-inactive'
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
          <div className="preview-card-container theme-preview-container rounded-3xl p-4 md:p-6 flex flex-col items-center overflow-hidden relative shadow-xl border">
            {/* Canvas Floating Top Toolbar */}
            <div className="w-full flex items-center justify-between pb-3.5 mb-3.5 border-b theme-toolbar-divider no-print">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg theme-toolbar-icon-box flex items-center justify-center">
                  <Eye className="w-3.5 h-3.5 theme-toolbar-icon" />
                </div>
                <div>
                  <span className="text-xs font-bold theme-toolbar-title">Preview Dokumen Cetak</span>
                  <span className="text-[10px] theme-toolbar-subtitle ml-2 hidden sm:inline">Standar A4 Portrait</span>
                </div>
              </div>

              {/* Zoom & Action Controls */}
              <div className="flex items-center gap-2">
                <div className="hidden sm:flex items-center gap-1 theme-zoom-box p-1 rounded-xl border">
                  <button
                    type="button"
                    onClick={() => setZoomLevel((prev) => Math.max(60, prev - 10))}
                    className="p-1 rounded-lg theme-zoom-btn hover:scale-105 transition-all cursor-pointer"
                    title="Zoom Out"
                  >
                    <ZoomOut className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-[11px] font-mono px-2 theme-zoom-val select-none">
                    {zoomLevel}%
                  </span>
                  <button
                    type="button"
                    onClick={() => setZoomLevel((prev) => Math.min(130, prev + 10))}
                    className="p-1 rounded-lg theme-zoom-btn hover:scale-105 transition-all cursor-pointer"
                    title="Zoom In"
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setZoomLevel(100)}
                    className="p-1 rounded-lg theme-zoom-btn hover:scale-105 transition-all cursor-pointer ml-0.5"
                    title="Reset Zoom"
                  >
                    <RotateCcw className="w-3 h-3" />
                  </button>
                </div>

                {/* Unified Action 1: Download PDF */}
                <div className="relative toolbar-dropdown-container">
                  <button
                    type="button"
                    onClick={() => {
                      if (documents.length > 1) {
                        setActiveDropdown(activeDropdown === 'download' ? null : 'download');
                      } else {
                        handleDownloadPdf();
                      }
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer active:scale-95 border theme-btn-download ${
                      activeDropdown === 'download' ? 'theme-btn-download-active ring-2 ring-amber-400/40' : ''
                    }`}
                    title={documents.length > 1 ? 'Pilihan unduh PDF (Tab ini atau Semua)' : 'Unduh berkas PDF'}
                  >
                    <Download className="w-3.5 h-3.5 theme-btn-download-icon" />
                    <span>Download PDF</span>
                    {documents.length > 1 && (
                      <ChevronDown
                        className={`w-3.5 h-3.5 opacity-70 transition-transform duration-200 ${
                          activeDropdown === 'download' ? 'rotate-180' : ''
                        }`}
                      />
                    )}
                  </button>

                  {/* Dropdown Menu */}
                  {activeDropdown === 'download' && documents.length > 1 && (
                    <div className="absolute right-0 top-full mt-2 w-72 theme-toolbar-dropdown backdrop-blur-xl border rounded-2xl p-2 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
                      <div className="px-3 py-1.5 text-[10px] uppercase font-bold tracking-wider theme-dropdown-header border-b mb-1">
                        Pilihan Unduh PDF
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveDropdown(null);
                          handleDownloadPdf();
                        }}
                        className="w-full text-left flex items-start gap-3 p-2.5 rounded-xl theme-dropdown-item transition-colors group cursor-pointer"
                      >
                        <div className="p-2 rounded-lg theme-dropdown-icon-box transition-colors">
                          <Download className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-semibold theme-dropdown-text flex items-center justify-between">
                            <span>Tab Ini Saja</span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded theme-dropdown-badge font-mono">1 PDF</span>
                          </div>
                          <p className="text-[11px] theme-dropdown-subtext truncate mt-0.5 font-mono">
                            B/L: {currentDoc.blNumber || 'Draft'}
                          </p>
                        </div>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveDropdown(null);
                          handleDownloadBatchPdf();
                        }}
                        disabled={isBatchExporting}
                        className="w-full text-left flex items-start gap-3 p-2.5 rounded-xl theme-dropdown-item transition-colors group cursor-pointer disabled:opacity-50"
                      >
                        <div className="p-2 rounded-lg theme-dropdown-icon-box transition-colors">
                          <Layers className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-semibold theme-dropdown-text flex items-center justify-between">
                            <span>Download Semua</span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded theme-dropdown-badge font-mono font-bold">
                              {documents.length} PDF
                            </span>
                          </div>
                          <p className="text-[11px] theme-dropdown-subtext mt-0.5">
                            {documents.length} file PDF terpisah sekaligus
                          </p>
                        </div>
                      </button>
                    </div>
                  )}
                </div>

                {/* Unified Action 2: Cetak */}
                <div className="relative toolbar-dropdown-container">
                  <button
                    type="button"
                    onClick={() => {
                      if (documents.length > 1) {
                        setActiveDropdown(activeDropdown === 'print' ? null : 'print');
                      } else {
                        handlePrintPdf();
                      }
                    }}
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer active:scale-95 shadow-sm border theme-btn-print ${
                      activeDropdown === 'print' ? 'ring-2 ring-amber-400/40 shadow-md' : ''
                    }`}
                    title={documents.length > 1 ? 'Pilihan cetak dokumen (Tab ini atau Semua)' : 'Cetak surat jalan'}
                  >
                    <Printer className="w-3.5 h-3.5 theme-btn-print-icon" />
                    <span>Cetak</span>
                    {documents.length > 1 && (
                      <ChevronDown
                        className={`w-3.5 h-3.5 opacity-70 transition-transform duration-200 ${
                          activeDropdown === 'print' ? 'rotate-180' : ''
                        }`}
                      />
                    )}
                  </button>

                  {/* Dropdown Menu */}
                  {activeDropdown === 'print' && documents.length > 1 && (
                    <div className="absolute right-0 top-full mt-2 w-72 theme-toolbar-dropdown backdrop-blur-xl border rounded-2xl p-2 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
                      <div className="px-3 py-1.5 text-[10px] uppercase font-bold tracking-wider theme-dropdown-header border-b mb-1">
                        Pilihan Cetak Dokumen
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveDropdown(null);
                          handlePrintPdf();
                        }}
                        className="w-full text-left flex items-start gap-3 p-2.5 rounded-xl theme-dropdown-item transition-colors group cursor-pointer"
                      >
                        <div className="p-2 rounded-lg theme-dropdown-icon-box transition-colors">
                          <Printer className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-semibold theme-dropdown-text flex items-center justify-between">
                            <span>Cetak Tab Ini Saja</span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded theme-dropdown-badge font-mono">1 Lembar</span>
                          </div>
                          <p className="text-[11px] theme-dropdown-subtext truncate mt-0.5 font-mono">
                            B/L: {currentDoc.blNumber || 'Draft'}
                          </p>
                        </div>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveDropdown(null);
                          handlePrintAllBatch();
                        }}
                        className="w-full text-left flex items-start gap-3 p-2.5 rounded-xl theme-dropdown-item transition-colors group cursor-pointer"
                      >
                        <div className="p-2 rounded-lg theme-dropdown-icon-box transition-colors">
                          <Printer className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-semibold theme-dropdown-text flex items-center justify-between">
                            <span>Cetak Semua Sekaligus</span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded theme-dropdown-badge font-mono font-bold">
                              {documents.length} Dok
                            </span>
                          </div>
                          <p className="text-[11px] theme-dropdown-subtext mt-0.5">
                            Cetak {documents.length} surat jalan secara berurutan
                          </p>
                        </div>
                      </button>
                    </div>
                  )}
                </div>

                {/* Unified Action 3: WhatsApp Action */}
                <div className="relative toolbar-dropdown-container">
                  <button
                    type="button"
                    onClick={() => {
                      if (documents.length > 1) {
                        setActiveDropdown(activeDropdown === 'whatsapp' ? null : 'whatsapp');
                      } else {
                        handleSendSingleDocPdfWhatsApp();
                      }
                    }}
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-white transition-all cursor-pointer active:scale-95 shadow-sm border theme-btn-wa ${
                      activeDropdown === 'whatsapp' ? 'ring-2 ring-emerald-400/40' : ''
                    }`}
                    title={documents.length > 1 ? 'Kirim PDF ke WhatsApp (Tab ini atau Semua)' : 'Kirim berkas PDF ke WhatsApp'}
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Kirim ke WA</span>
                    {documents.length > 1 && (
                      <ChevronDown
                        className={`w-3.5 h-3.5 opacity-70 transition-transform duration-200 ${
                          activeDropdown === 'whatsapp' ? 'rotate-180' : ''
                        }`}
                      />
                    )}
                  </button>

                  {/* Dropdown Menu */}
                  {activeDropdown === 'whatsapp' && documents.length > 1 && (
                    <div className="absolute right-0 top-full mt-2 w-80 theme-toolbar-dropdown backdrop-blur-xl border rounded-2xl p-2 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
                      <div className="px-3 py-1.5 text-[10px] uppercase font-bold tracking-wider border-b theme-dropdown-header theme-dropdown-wa-header mb-1 flex items-center justify-between">
                        <span>Kirim PDF ke WhatsApp</span>
                        <span className="text-[10px] font-mono opacity-60">{currentDoc.phoneNo || 'Kontak'}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveDropdown(null);
                          handleSendSingleDocPdfWhatsApp();
                        }}
                        className="w-full text-left flex items-start gap-3 p-2.5 rounded-xl theme-dropdown-item transition-colors group cursor-pointer"
                      >
                        <div className="p-2 rounded-lg theme-dropdown-wa-icon-box transition-colors">
                          <MessageSquare className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-semibold theme-dropdown-text flex items-center justify-between">
                            <span>Kirim Tab Ini Saja</span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded theme-dropdown-badge font-mono">1 PDF</span>
                          </div>
                          <p className="text-[11px] theme-dropdown-subtext truncate mt-0.5 font-mono">
                            B/L: {currentDoc.blNumber || 'Draft'}
                          </p>
                        </div>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveDropdown(null);
                          handleSendAllDocsPdfWhatsApp();
                        }}
                        disabled={isBatchExporting}
                        className="w-full text-left flex items-start gap-3 p-2.5 rounded-xl theme-dropdown-item transition-colors group cursor-pointer disabled:opacity-50"
                      >
                        <div className="p-2 rounded-lg theme-dropdown-wa-icon-box transition-colors">
                          <Layers className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-semibold theme-dropdown-wa-title flex items-center justify-between">
                            <span>Kirim Semua ({documents.length}) PDF</span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded theme-dropdown-wa-badge font-mono font-bold">
                              Semua
                            </span>
                          </div>
                          <p className="text-[11px] theme-dropdown-subtext mt-0.5">
                            Kirim seluruh {documents.length} berkas PDF via WhatsApp
                          </p>
                        </div>
                      </button>
                    </div>
                  )}
                </div>
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
            <span>{exportMode === 'whatsapp' ? 'Menyiapkan PDF untuk WhatsApp: ' : 'Mengekspor Batch PDF: '}</span>
            <span className="text-[#faedd9] font-bold font-mono">
              File {batchExportProgress?.current || 1} dari {batchExportProgress?.total || documents.length} (File Terpisah)
            </span>
            <span className="text-[#c4b5fd]/70 ml-1.5 text-xs">(Resolusi Tinggi A4)...</span>
          </div>
        </div>
      )}

      {/* FLOATING WHATSAPP PDF DOWNLOAD & CHAT GUIDE TOAST */}
      {whatsappToastInfo?.isOpen && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3.5 px-5 py-3.5 rounded-3xl liquid-hero-glass border border-emerald-400/40 shadow-2xl backdrop-blur-2xl animate-fade-in text-[#fffdfa] max-w-lg">
          <div className="w-9 h-9 rounded-2xl bg-emerald-500/25 border border-emerald-400/50 flex items-center justify-center shrink-0">
            <MessageSquare className="w-4 h-4 text-emerald-300" />
          </div>
          <div className="text-xs flex-1">
            <p className="font-bold text-emerald-300">
              Chat WA Terbuka & {whatsappToastInfo.count} File PDF Siap!
            </p>
            <p className="text-[#faedd9]/80 text-[11px] mt-0.5 leading-snug">
              Semua file PDF surat jalan telah terunduh ke perangkat Anda. Cukup seret (drag & drop) file atau klik lampiran (📎) di WhatsApp untuk mengirimnya.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setWhatsappToastInfo(null)}
            className="p-1 rounded-xl text-[#faedd9]/60 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="Tutup pemberitahuan"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* CUTE SIMPLE FOOTER */}
      <footer className="no-print py-4 text-center text-xs text-[#faedd9]/70 flex items-center justify-center gap-1.5 select-none tracking-wide">
        <span>Made for Jean</span>
        <span className="text-[#f472b6] text-sm">♥</span>
        <button
          type="button"
          onClick={() => setIsRainModalOpen(true)}
          className="inline-flex items-center gap-1 hover:text-white hover:scale-110 active:scale-95 transition-all cursor-pointer group"
          title="🌧️ Rain • Jean's AI Assistant"
        >
          <span>From</span>
          <span className="text-base group-hover:scale-125 transition-transform duration-200">🌧️</span>
        </button>
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
        onOpenWhatsApp={handleSendAllDocsPdfWhatsApp}
      />

      {/* RAIN EASTER EGG MODAL DIALOGUE */}
      <RainModal
        isOpen={isRainModalOpen}
        onClose={() => setIsRainModalOpen(false)}
      />
    </div>
  );
};

export default App;
