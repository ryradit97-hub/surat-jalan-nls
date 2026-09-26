import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { SuratJalanData } from '../types/suratJalan';
import { createEmptySuratJalan } from '../utils/defaultData';
import { FileSpreadsheet, Upload, X, CheckCircle2, AlertCircle, Download } from 'lucide-react';

interface BatchImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (newList: SuratJalanData[]) => void;
}

export const BatchImportModal: React.FC<BatchImportModalProps> = ({
  isOpen,
  onClose,
  onImport,
}) => {
  const [importedRecords, setImportedRecords] = useState<Partial<SuratJalanData>[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMsg(null);
    const reader = new FileReader();

    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json<any>(ws);

        parseRows(data);
      } catch (err: any) {
        setErrorMsg('Gagal membaca file: ' + err.message);
      }
    };

    reader.readAsBinaryString(file);
  };

  const parseRows = (rows: any[]) => {
    if (!rows || rows.length === 0) {
      setErrorMsg('Tidak ada data ditemukan.');
      return;
    }

    const parsed: Partial<SuratJalanData>[] = rows.map((row, idx) => {
      const blNumber = row['BL NUMBER'] || row['BL Number'] || row['BL_NUMBER'] || row['bl_number'] || `BL-BATCH-${idx + 1}`;
      const deliveryAddress = row['DELIVERY ADDRESS'] || row['Delivery Address'] || row['DELIVERY_ADDRESS'] || row['Tujuan'] || 'PT Terminal Mustika Alam Lestari';
      const description = row['DESCRIPTION OF GOODS'] || row['Description'] || row['Nama Barang'] || 'PLASTIC KITCHEN WARE';
      const weightKg = row['WEIGHT (KG)'] || row['Weight'] || row['Berat'] || '8732,5';
      const rawRemarks = (row['REMARKS'] || row['Remarks'] || row['Keterangan'] || '1 X 40 HC').toString().trim().toUpperCase();
      const remarks = (rawRemarks.includes('40 HR') || rawRemarks.includes('40HR') || rawRemarks.includes('40-HR'))
        ? rawRemarks.replace(/40\s*[-]?\s*HR/gi, '40 HC')
        : (rawRemarks || '1 X 40 HC');
      const deliveryDate = row['Delivery Date'] || row['Tanggal Kirim'] || '14 Sep 2026';
      const containerSeal = row['CONTAINER/SEAL'] || row['Container'] || '';
      const driverName = row['DRIVER NAME'] || row['Driver'] || '';
      const licensePlate = row['LICENSE'] || row['No Polisi'] || '';

      return {
        blNumber,
        deliveryAddress,
        deliveryDate,
        unitType: row['UNIT TYPE'] || 'Trailer 40ft',
        driverName,
        licensePlate,
        items: [
          {
            id: `b-item-${idx}`,
            no: 1,
            containerSeal,
            description,
            packageQty: row['PACKAGE'] || '',
            weightKg,
            remarks,
          }
        ]
      };
    });

    setImportedRecords(parsed);
  };

  const handleApplyImport = () => {
    if (importedRecords.length === 0) return;

    const newSuratJalanList: SuratJalanData[] = importedRecords.map((rec, idx) => {
      const base = createEmptySuratJalan();
      return {
        ...base,
        id: `SJ-BATCH-${Date.now()}-${idx + 1}`,
        blNumber: rec.blNumber || base.blNumber,
        deliveryAddress: rec.deliveryAddress || base.deliveryAddress,
        deliveryDate: rec.deliveryDate || base.deliveryDate,
        driverName: rec.driverName || base.driverName,
        licensePlate: rec.licensePlate || base.licensePlate,
        unitType: rec.unitType || base.unitType,
        items: rec.items || base.items,
        updatedAt: new Date().toISOString()
      };
    });

    onImport(newSuratJalanList);
    onClose();
  };

  const downloadSampleExcel = () => {
    const sampleData = [
      {
        'BL NUMBER': 'JKTG58923800',
        'DELIVERY ADDRESS': 'PT Terminal Mustika Alam Lestari',
        'DESCRIPTION OF GOODS': 'PLASTIC KITCHEN WARE',
        'WEIGHT (KG)': '8732,5',
        'REMARKS': '1 X 40 HC',
        'Delivery Date': '14 Sep 2026',
        'CONTAINER/SEAL': 'OTPU6617747 / SITF124419',
        'DRIVER NAME': 'Ahmad Supardi',
        'No Polisi': 'B 9876 UIX'
      },
      {
        'BL NUMBER': 'SITRBISH160334',
        'DELIVERY ADDRESS': 'Terminal Petikemas Bitung (TPK Bitung)',
        'DESCRIPTION OF GOODS': 'COCONUT WATER',
        'WEIGHT (KG)': '22000 KGS',
        'REMARKS': '1 X 40 HR',
        'Delivery Date': '13 Februari 2026',
        'CONTAINER/SEAL': 'TGHU1234567 / SITF998877',
        'DRIVER NAME': 'Budi Santoso',
        'No Polisi': 'B 9123 NLS'
      }
    ];

    const ws = XLSX.utils.json_to_sheet(sampleData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "SuratJalanData");
    XLSX.writeFile(wb, "Contoh_Format_Surat_Jalan_NLS.xlsx");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#140d1c]/80 backdrop-blur-md">
      <div className="liquid-glass rounded-3xl w-full max-w-lg p-6 shadow-2xl border border-[#faedd9]/20 bg-[#251736] max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#faedd9]/10">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-[#faedd9]/15 flex items-center justify-center text-[#faedd9]">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-[#fffdfa]">Batch Import Excel / CSV</h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-6 h-6 rounded-full flex items-center justify-center text-[#c4b5fd]/70 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-3 py-3 overflow-y-auto flex-1 scrollbar-none">
          <div className="p-3 rounded-2xl bg-[#faedd9]/5 border border-[#faedd9]/10 text-xs text-[#faedd9]">
            <p className="font-semibold mb-1 text-[#fffdfa]">💡 Petunjuk Kolom Spreadsheet:</p>
            <p className="text-[11px] leading-relaxed text-[#faedd9]/80">
              Header kolom: BL NUMBER, DELIVERY ADDRESS, DESCRIPTION OF GOODS, WEIGHT, REMARKS, dan Delivery Date.
            </p>
            <button
              type="button"
              onClick={downloadSampleExcel}
              className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-[#faedd9] hover:underline cursor-pointer"
            >
              <Download className="w-3 h-3" />
              <span>Unduh Contoh Excel (.xlsx)</span>
            </button>
          </div>

          <div className="border border-dashed border-[#faedd9]/20 hover:border-[#faedd9]/50 transition-colors rounded-2xl p-5 text-center bg-[#faedd9]/3">
            <Upload className="w-7 h-7 mx-auto text-[#d8b4fe] mb-1.5" />
            <p className="text-xs font-semibold text-[#fffdfa]">Pilih file Excel / CSV</p>
            <input
              type="file"
              accept=".xlsx, .xls, .csv"
              onChange={handleFileUpload}
              className="hidden"
              id="batch-excel-file-input"
            />
            <label
              htmlFor="batch-excel-file-input"
              className="mt-3 inline-flex items-center gap-1 px-4 py-1.5 rounded-xl text-xs font-semibold text-[#181022] bg-[#faedd9] hover:bg-[#fffdfa] cursor-pointer shadow-sm transition-all active:scale-95"
            >
              Pilih File
            </label>
          </div>

          {errorMsg && (
            <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-3.5 h-3.5 shrink-0 text-red-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {importedRecords.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 mb-1.5 text-xs font-semibold text-[#faedd9]">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Berhasil membaca {importedRecords.length} data:</span>
              </div>
              <div className="max-h-36 overflow-y-auto space-y-1.5 p-2 rounded-xl bg-[#181022]/60 border border-[#faedd9]/10">
                {importedRecords.map((rec, i) => (
                  <div key={i} className="text-xs p-2 rounded-lg bg-[#faedd9]/5 flex justify-between items-center">
                    <div>
                      <span className="font-mono font-bold text-[#faedd9]">BL: {rec.blNumber}</span>
                      <p className="text-[10.5px] text-[#fffdfa]/80 truncate max-w-[180px]">{rec.deliveryAddress}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10.5px] text-[#d8b4fe]">{rec.items?.[0]?.description}</span>
                      <p className="font-mono text-[10.5px] text-[#faedd9]">{rec.items?.[0]?.weightKg}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#faedd9]/10">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 rounded-xl text-xs font-medium text-[#c4b5fd]/70 hover:text-white transition-colors cursor-pointer"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleApplyImport}
            disabled={importedRecords.length === 0}
            className="px-4 py-1.5 rounded-xl text-xs font-semibold text-[#181022] bg-[#faedd9] hover:bg-[#fffdfa] shadow-sm transition-all active:scale-95 disabled:opacity-40 cursor-pointer"
          >
            Impor {importedRecords.length > 0 ? `(${importedRecords.length})` : ''}
          </button>
        </div>
      </div>
    </div>
  );
};
