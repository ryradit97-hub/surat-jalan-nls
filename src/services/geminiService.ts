import { SuratJalanData } from '../types/suratJalan';
import { defaultDeliveryAddresses, defaultShippers } from '../utils/defaultData';

export interface AIExtractionResult {
  unitType?: string;
  driverName?: string;
  phoneNo?: string;
  licensePlate?: string;
  shipperName?: string;
  shipperAddress?: string;
  deliveryAddress?: string;
  blNumber?: string;
  poNumber?: string;
  containerSeal?: string;
  description?: string;
  packageQty?: string;
  weightKg?: string;
  remarks?: string;
  deliveryDate?: string;
  explanation?: string;
}

// Internal secure configuration from environment
const SECURE_AI_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';

const fallbackModels = [
  'gemini-3.6-flash',
  'gemini-flash-latest',
  'gemini-3.5-flash',
  'gemini-3.1-flash-lite',
  'gemini-flash-lite-latest'
];

/**
 * Intelligent Paraphrasing Engine for Logistics Prompts
 * Cleans up messy instructions, typos, and organizes details into formal Bahasa Indonesia.
 */
export const paraphraseLogisticsPrompt = async (rawPrompt: string): Promise<string> => {
  if (!rawPrompt.trim()) return rawPrompt;

  const systemInstruction = `Anda adalah editor logistik profesional untuk PT NIAGA LOGISTICS SEJAHTERA (NLS Logistik).
Tugas Anda adalah memparafrase dan merapikan kalimat instruksi atau pesan tidak beraturan dari pengguna menjadi satu paragraf instruksi pembuatan Surat Jalan yang formal, lengkap, dan rapi dalam Bahasa Indonesia.
Pastikan tanggal kirim, delivery address, nomor BL, nomor PO, nama barang, berat kargo, dan keterangan lainnya tersusun jelas.
HANYA berikan teks hasil parafrase akhir tanpa tanda kutip, tanpa kata pengantar, dan tanpa catatan tambahan.`;

  for (const model of fallbackModels) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${SECURE_AI_KEY}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': SECURE_AI_KEY
        },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [
                { text: systemInstruction },
                { text: `Parafrase teks berikut:\n"${rawPrompt}"` }
              ]
            }
          ]
        })
      });

      if (!response.ok) continue;

      const resData = await response.json();
      const text = resData?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) {
        return text.trim().replace(/^["']|["']$/g, '');
      }
    } catch (e) {
      console.warn(`Paraphrase failed on model ${model}, trying next...`, e);
    }
  }

  return rawPrompt;
};

/**
 * Offline Rule-based NLP Parser for Indonesian Prompts (Final Fallback)
 */
export const parseIndonesianPromptLocally = (prompt: string): AIExtractionResult => {
  const p = prompt.toLowerCase();
  const result: AIExtractionResult = {};

  // 1. Tanggal Kirim / Delivery Date
  const dateMatch = prompt.match(/(?:tanggal|tgl|date|untuk tanggal|kirim tanggal)[\s:]*([0-9]{1,2}\s+[A-Za-z]+\s+[0-9]{4}|[0-9]{1,2}[-\/][0-9]{1,2}[-\/][0-9]{2,4})/i);
  if (dateMatch) {
    result.deliveryDate = dateMatch[1].trim();
  }

  // 2. Delivery Address / Tujuan
  for (const addr of defaultDeliveryAddresses) {
    const shortNames: Record<string, string[]> = {
      'Terminal Peti Kemas Koja (UTC3)': ['koja', 'utc3', 'peti kemas koja'],
      'Terminal Petikemas Bitung (TPK Bitung)': ['bitung', 'tpk bitung'],
      'PT Terminal Mustika Alam Lestari': ['mustika alam lestari', 'mustika alam', 'tmal'],
      'New Priok Container Terminal One (NPCT1)': ['npct1', 'npct', 'priok 1', 'new priok'],
      'JAKARTA INTERNATIONAL CONTAINER TERMINAL': ['jict', 'jakarta international container terminal']
    };

    const aliases = shortNames[addr] || [];
    if (p.includes(addr.toLowerCase()) || aliases.some(a => p.includes(a))) {
      result.deliveryAddress = addr;
      break;
    }
  }

  if (!result.deliveryAddress) {
    const addrMatch = prompt.match(/(?:delivery address|alamat tujuan|tujuan|ke|kirim ke)[\s:]+([^,\n\.]+?(?:(?=,\s*(?:dengan|bl|po|weight|berat|barang|remarks))|$))/i);
    if (addrMatch) {
      result.deliveryAddress = addrMatch[1].replace(/^(kesini|ke)\s+/i, '').trim();
    }
  }

  // 3. BL Number
  const blMatch = prompt.match(/(?:bl number|bl no|no bl|b\/l|bl)[\s:]*([A-Za-z0-9\-_]+)/i);
  if (blMatch) {
    result.blNumber = blMatch[1].toUpperCase().trim();
  }

  // 4. PO Number
  const poMatch = prompt.match(/(?:po number|po no|no po|po)[\s:]*([A-Za-z0-9\-\/_]+)/i);
  if (poMatch && !poMatch[1].toLowerCase().startsWith('nomor') && !poMatch[1].toLowerCase().startsWith('number')) {
    result.poNumber = poMatch[1].toUpperCase().trim();
  }

  // 5. Weight (KG)
  const weightMatch = prompt.match(/(?:weight|berat|bobot)[\s:]*([0-9\.,]+\s*(?:kgs?|kg|ton)?)/i);
  if (weightMatch) {
    let w = weightMatch[1].trim();
    if (!w.toLowerCase().includes('kg')) w += ' KGS';
    result.weightKg = w.toUpperCase();
  }

  // 6. Remarks / Keterangan
  const remarksMatch = prompt.match(/(?:remarks|keterangan|ket)[\s:]*([0-9]+\s*[xX]\s*[0-9]+(?:\s*[A-Za-z]+)?|[^,\n\.]+)/i);
  if (remarksMatch) {
    result.remarks = remarksMatch[1].trim().toUpperCase();
  }

  // 7. Description of Goods / Barang
  const goodsMatch = prompt.match(/(?:description of goods|nama barang|barang|goods|muatan|kargo)[\s:]+([^,\n\.]+?(?:(?=,\s*(?:weight|berat|po|bl|remarks))|$))/i);
  if (goodsMatch) {
    result.description = goodsMatch[1].trim().toUpperCase();
  }

  // 8. Container / Seal (Default empty if not specified in prompt)
  const containerMatch = prompt.match(/(?:container|kontainer|seal)[\s:]*([A-Za-z0-9\/\s\-]+?)(?=(?:,\s*(?:barang|weight|remarks|po|bl))|$)/i);
  result.containerSeal = containerMatch ? containerMatch[1].trim().toUpperCase() : '';

  // 9. Shipper
  if (p.includes('cotti') || p.includes('kopi')) {
    const cotti = defaultShippers.find(s => s.name.includes('COTTI'));
    if (cotti) {
      result.shipperName = cotti.name;
      result.shipperAddress = cotti.address;
    }
  } else if (p.includes('food packaging') || p.includes('plastik') || p.includes('plastic')) {
    const fp = defaultShippers.find(s => s.name.includes('FOOD PACKAGING'));
    if (fp) {
      result.shipperName = fp.name;
      result.shipperAddress = fp.address;
    }
  }

  // 10. Unit Type
  if (p.includes('trailer') || p.includes('40ft') || p.includes('40 ft') || p.includes('40 hc')) {
    result.unitType = 'Trailer 40ft';
  } else if (p.includes('20ft') || p.includes('20 ft')) {
    result.unitType = 'Trailer 20ft';
  } else if (p.includes('tronton')) {
    result.unitType = 'Tronton Wingbox';
  }

  // 11. Driver Name & License
  const driverMatch = prompt.match(/(?:driver|supir|pengemudi)[\s:]*([A-Za-z\s]+?)(?=(?:,\s*(?:plat|no polisi|phone))|$)/i);
  if (driverMatch) {
    result.driverName = driverMatch[1].trim();
  }

  const plateMatch = prompt.match(/(?:license|no polisi|plat|nopol)[\s:]*([A-Za-z]{1,2}\s*[0-9]{1,4}\s*[A-Za-z]{1,3})/i);
  if (plateMatch) {
    result.licensePlate = plateMatch[1].toUpperCase().trim();
  }

  result.explanation = 'Data berhasil diproses secara otomatis dari instruksi Anda.';
  return result;
};

/**
 * Offline Rule-based NLP Parser for Multiple Prompts (Fallback)
 */
export const parseMultipleIndonesianPromptsLocally = (prompt: string): AIExtractionResult[] => {
  // Check if prompt mentions multiple items or numbered list (e.g., 1. BL ..., 2. BL ... or multiple BL occurrences)
  const blMatches = prompt.match(/BL[\s#:]*([A-Za-z0-9\-\/]+)/gi);
  const numberedSections = prompt.split(/(?:^|\n|\s+)(?:[0-9]{1,2}[\.\)]|\-)\s+/i).filter(s => s.trim().length > 10);

  if (numberedSections.length > 1 && (blMatches && blMatches.length > 1)) {
    // Extract base common fields (delivery address, date, driver)
    const baseInfo = parseIndonesianPromptLocally(prompt);
    
    return numberedSections.map((sec) => {
      const itemInfo = parseIndonesianPromptLocally(sec);
      return {
        ...baseInfo,
        ...itemInfo,
        deliveryAddress: itemInfo.deliveryAddress || baseInfo.deliveryAddress,
        deliveryDate: itemInfo.deliveryDate || baseInfo.deliveryDate,
        shipperName: itemInfo.shipperName || baseInfo.shipperName,
        explanation: 'Ekstraksi multi-surat jalan otomatis.',
      };
    });
  }

  return [parseIndonesianPromptLocally(prompt)];
};

/**
 * Robust Multi-Tier AI Fallback Chain supporting single & multi-batch Surat Jalan
 */
export const extractMultipleSuratJalanWithAI = async (
  prompt: string,
  imageBase64?: string
): Promise<AIExtractionResult[]> => {
  const apiKey = SECURE_AI_KEY;

  const systemInstruction = `Anda adalah asisten AI khusus logistik untuk PT NIAGA LOGISTICS SEJAHTERA (NLS Logistik).
Tugas Anda adalah membaca instruksi, pesan teks, chat WhatsApp, atau rincian kargo dalam Bahasa Indonesia, kemudian mengekstrak data menjadi JSON murni untuk membuat Surat Jalan Trucking resmi.

PENTING: Pengguna dapat meminta pembuatan 1 surat jalan ATAU LEBIH DARI 1 SURAT JALAN SEKALIGUS (misalnya membuat 2, 3, 4 surat jalan sekaligus, dengan alamat tujuan sama atau berbeda, nomor BL berbeda, nomor PO berbeda, barang berbeda, berat berbeda, dan remarks berbeda).

Keluarkan HANYA format JSON valid tanpa teks lain dengan struktur:
{
  "documents": [
    {
      "deliveryAddress": "Nama terminal / alamat tujuan",
      "blNumber": "Nomor BL",
      "poNumber": "Nomor PO",
      "description": "Nama barang kargo",
      "weightKg": "Berat dengan satuan contoh: 22000 KGS atau 8732,5 KGS",
      "remarks": "Contoh: 1 X 40 HR atau 1 X 40 HC",
      "deliveryDate": "Contoh: 18 Maret 2026 atau 14 Sep 2026",
      "containerSeal": "Nomor container/seal jika ADA di prompt. Jika TIDAK DISEBUTKAN, WAJIB kosongkan string \"\"",
      "packageQty": "Jumlah kemasan jika ada",
      "unitType": "Trailer 40ft / Trailer 20ft / Tronton",
      "driverName": "Nama supir jika ada",
      "phoneNo": "No telepon supir jika ada",
      "licensePlate": "No polisi plat jika ada",
      "shipperName": "Nama pengirim jika ada",
      "shipperAddress": "Alamat pengirim jika ada",
      "explanation": "Ringkasan ekstraksi singkat"
    }
  ]
}

Aturan Penanganan:
- Bidang "containerSeal" (Nomor Kontainer / Seal) seringkali kosong. Jika pengguna tidak menyebutkannya di prompt, WAJIB kosongkan string: "". JANGAN pernah mengisi nilai default atau mengarang nomor kontainer.
- Jika pengguna meminta beberapa surat jalan (misal: "buatkan 4 surat jalan", atau ada beberapa nomor BL/PO/rincian bernomor 1-4):
  Buatkan objek terpisah dalam array "documents" untuk SETIAP surat jalan.
- Jika alamat tujuan atau tanggal hanya disebutkan satu kali secara umum untuk semua pengiriman, wariskan alamat dan tanggal tersebut ke SEMUA objek dalam array "documents".
- Jika hanya ada 1 pengiriman, array "documents" cukup berisi 1 objek.`;

  const requestBody: any = {
    contents: [
      {
        role: 'user',
        parts: [
          { text: systemInstruction },
          { text: `Ekstrak data Surat Jalan berikut ke JSON:\n"${prompt}"` }
        ]
      }
    ]
  };

  if (imageBase64) {
    requestBody.contents[0].parts.push({
      inlineData: {
        mimeType: 'image/jpeg',
        data: imageBase64.replace(/^data:image\/[a-z]+;base64,/, '')
      }
    });
  }

  for (const model of fallbackModels) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        console.warn(`Model ${model} returned status ${response.status}. Shifting to next model in fallback chain...`);
        continue;
      }

      const resData = await response.json();
      const rawText = resData?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (rawText) {
        const cleanJsonStr = rawText.replace(/```(?:json)?/gi, '').trim();
        const parsed = JSON.parse(cleanJsonStr);

        let rawDocs: any[] = [];
        if (Array.isArray(parsed)) {
          rawDocs = parsed;
        } else if (Array.isArray(parsed.documents)) {
          rawDocs = parsed.documents;
        } else if (Array.isArray(parsed.surat_jalan)) {
          rawDocs = parsed.surat_jalan;
        } else if (Array.isArray(parsed.data)) {
          rawDocs = parsed.data;
        } else {
          rawDocs = [parsed.surat_jalan || parsed.data || parsed];
        }

        // Global common fields
        const globalAddr = parsed.deliveryAddress || parsed.delivery_address || parsed.alamat_pengiriman || parsed.tujuan;
        const globalDate = parsed.deliveryDate || parsed.delivery_date || parsed.tanggal;
        const globalDriver = parsed.driverName || parsed.driver_name;
        const globalPlate = parsed.licensePlate || parsed.license_plate;
        const globalShipper = parsed.shipperName || parsed.shipper_name;
        const globalShipperAddr = parsed.shipperAddress || parsed.shipper_address;

        const results: AIExtractionResult[] = rawDocs.map((root: any, index: number) => {
          const firstItem = (root.detail_barang && root.detail_barang[0]) || (root.items && root.items[0]) || root;
          return {
            deliveryAddress: root.deliveryAddress || root.delivery_address || root.alamat_pengiriman || root.tujuan || globalAddr,
            blNumber: root.blNumber || root.bl_number || root.nomor_bl || `BL-AUTO-00${index + 1}`,
            poNumber: root.poNumber || root.po_number || root.nomor_po || `PO-2026/0${index + 1}`,
            description: firstItem.description || firstItem.deskripsi || firstItem.item || firstItem.nama_barang || 'GENERAL CARGO',
            weightKg: firstItem.weightKg || firstItem.weight || firstItem.berat || '20000 KGS',
            remarks: firstItem.remarks || firstItem.keterangan || '1 X 40 HR',
            deliveryDate: root.deliveryDate || root.delivery_date || root.tanggal || root.tanggal_kirim || globalDate,
            containerSeal: (firstItem.containerSeal || firstItem.container_seal || firstItem.container || root.containerSeal || '').trim(),
            packageQty: firstItem.packageQty || firstItem.package_qty || root.packageQty,
            unitType: root.unitType || root.unit_type || root.tipe_unit || 'Trailer 40ft',
            driverName: root.driverName || root.driver_name || root.nama_supir || globalDriver,
            phoneNo: root.phoneNo || root.phone_no || root.telepon,
            licensePlate: root.licensePlate || root.license_plate || root.plat || root.no_polisi || globalPlate,
            shipperName: root.shipperName || root.shipper_name || root.nama_pengirim || globalShipper,
            shipperAddress: root.shipperAddress || root.shipper_address || root.alamat_pengirim || globalShipperAddr,
            explanation: 'Berhasil diproses secara otomatis oleh Asisten AI.'
          };
        });

        if (results.length > 0) {
          return results;
        }
      }
    } catch (err) {
      console.warn(`Connection error on model ${model}, trying next model in chain...`, err);
    }
  }

  return parseMultipleIndonesianPromptsLocally(prompt);
};

/**
 * Single extraction compatibility wrapper
 */
export const extractSuratJalanWithAI = async (
  prompt: string,
  imageBase64?: string
): Promise<AIExtractionResult> => {
  const list = await extractMultipleSuratJalanWithAI(prompt, imageBase64);
  return list[0] || parseIndonesianPromptLocally(prompt);
};

/**
 * Apply AI extraction result into active Surat Jalan document
 */
export const applyAIExtractionToDocument = (
  currentDoc: SuratJalanData,
  aiData: AIExtractionResult
): SuratJalanData => {
  const updated = { ...currentDoc };

  if (aiData.deliveryAddress) updated.deliveryAddress = aiData.deliveryAddress;
  if (aiData.blNumber) updated.blNumber = aiData.blNumber;
  if (aiData.poNumber) updated.poNumber = aiData.poNumber;
  if (aiData.deliveryDate) updated.deliveryDate = aiData.deliveryDate;
  if (aiData.unitType) updated.unitType = aiData.unitType;
  if (aiData.driverName) updated.driverName = aiData.driverName;
  if (aiData.phoneNo) updated.phoneNo = aiData.phoneNo;
  if (aiData.licensePlate) updated.licensePlate = aiData.licensePlate;
  if (aiData.shipperName) updated.shipperName = aiData.shipperName;
  if (aiData.shipperAddress) updated.shipperAddress = aiData.shipperAddress;

  if (updated.items.length > 0) {
    const item0 = { ...updated.items[0] };
    if (aiData.description) item0.description = aiData.description;
    if (aiData.weightKg) item0.weightKg = aiData.weightKg;
    if (aiData.remarks) item0.remarks = aiData.remarks;
    // CONTAINER/SEAL defaults to empty unless explicitly provided
    item0.containerSeal = aiData.containerSeal ? aiData.containerSeal.trim() : '';
    if (aiData.packageQty) item0.packageQty = aiData.packageQty;
    updated.items[0] = item0;
  }

  updated.updatedAt = new Date().toISOString();
  return updated;
};
