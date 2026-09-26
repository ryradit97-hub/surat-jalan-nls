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
const SECURE_AI_KEY = import.meta.env?.VITE_GEMINI_API_KEY || '';

const fallbackModels = [
  'gemini-3.6-flash',
  'gemini-flash-latest',
  'gemini-3.5-flash',
  'gemini-3.1-flash-lite',
  'gemini-flash-lite-latest'
];

export const normalizeDeliveryAddress = (addr?: string): string => {
  if (!addr) return '';
  const trimmed = addr.trim();
  const lower = trimmed.toLowerCase();

  const terminalMap: [string[], string][] = [
    [['npct1', 'npct', 'priok 1', 'new priok'], 'New Priok Container Terminal One (NPCT1)'],
    [['koja', 'utc3', 'peti kemas koja'], 'Terminal Peti Kemas Koja (UTC3)'],
    [['jict', 'jakarta international container terminal'], 'JAKARTA INTERNATIONAL CONTAINER TERMINAL'],
    [['bitung', 'tpk bitung'], 'Terminal Petikemas Bitung (TPK Bitung)'],
    [['mustika alam', 'tmal'], 'PT Terminal Mustika Alam Lestari']
  ];

  for (const [aliases, official] of terminalMap) {
    if (lower === official.toLowerCase() || aliases.some(a => {
      const reg = new RegExp(`\\b${a}\\b`, 'i');
      return reg.test(trimmed) || lower === a;
    })) {
      return official;
    }
  }

  return trimmed;
};

/**
 * Intelligent Paraphrasing Engine for Logistics Prompts
 * Cleans up messy instructions, typos, and organizes details into formal Bahasa Indonesia.
 * Normalizes terminal shorthand (NPCT -> New Priok Container Terminal One (NPCT1), Koja -> Terminal Peti Kemas Koja (UTC3), JICT, etc.)
 */
export const paraphraseLogisticsPrompt = async (rawPrompt: string): Promise<string> => {
  if (!rawPrompt.trim()) return rawPrompt;

  const systemInstruction = `Anda adalah editor logistik profesional untuk PT NIAGA LOGISTICS SEJAHTERA (NLS Logistik).
Tugas Anda adalah merapikan kalimat instruksi, pesan WhatsApp tidak beraturan, atau template ringkas/shorthand/malas dari pengguna menjadi instruksi pembuatan Surat Jalan yang formal, lengkap, dan rapi dalam Bahasa Indonesia.

ATURAN NORMALISASI & PARAFRASE KHUSUS:
1. Normalisasi Nama Terminal / Delivery Address (SANGAT PENTING):
   - "NPCT" / "Npct" / "npct" / "NPCT1" -> WAJIB ubah menjadi "New Priok Container Terminal One (NPCT1)" (JANGAN biarkan hanya tertulis NPCT).
   - "Koja" / "koja" / "UTC3" -> WAJIB ubah menjadi "Terminal Peti Kemas Koja (UTC3)" (JANGAN biarkan hanya tertulis Koja).
   - "JICT" / "jict" -> WAJIB ubah menjadi "JAKARTA INTERNATIONAL CONTAINER TERMINAL".
   - "Bitung" / "TPK Bitung" -> WAJIB ubah menjadi "Terminal Petikemas Bitung (TPK Bitung)".
   - "TMAL" / "Mustika Alam" -> WAJIB ubah menjadi "PT Terminal Mustika Alam Lestari".
2. Normalisasi Dokumen DO / BL:
   - Jika tertulis "DO <nomor>", ubah menjadi "BL <nomor>" atau "BL/DO <nomor>".
3. Standarisasi Berat:
   - "Gross weight: 9695 kg", "19.000 kg", "10,000 kg", "7191 kg" -> ubah menjadi "berat 9695 KGS", "berat 19.000 KGS", dst.
4. Nomor PO:
   - Sertakan nomor PO secara lengkap seperti "PO 337497 ( 436-68286)", "PO 1437021", "PO MDL-2644285", "PO ABI-2603".
5. Tanggal Kirim:
   - Jika tanggal kirim disebutkan (misal: "Tanggal kirim : 28 September 2026"), sertakan informasi tanggal ini dengan jelas untuk seluruh pengiriman.
6. Format Output Multi-Pengiriman:
   - Jika input berupa daftar bernomor (1., 2., 3., dst.), susun kalimat instruksi yang sangat rapi dan bernomor.
   Contoh format hasil parafrase:
   "Tolong buatkan 6 surat jalan untuk tanggal pengiriman 28 September 2026:
   1. BL COSU6464000430, PO 337497 ( 436-68286), delivery address JAKARTA INTERNATIONAL CONTAINER TERMINAL, berat 9695 KGS
   2. BL EGLV080600620033, PO 1437021, delivery address New Priok Container Terminal One (NPCT1), berat 19.000 KGS
   3. BL ONEYJKTG70872500, PO 147530, delivery address Terminal Peti Kemas Koja (UTC3), berat 10.000 KGS
   ..."
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
                { text: `Parafrase teks instruksi Surat Jalan berikut:\n"${rawPrompt}"` }
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

  // Fallback to offline rule-based paraphrase if API is unavailable
  return paraphraseOfflinePrompt(rawPrompt);
};

/**
 * Offline Rule-Based Paraphraser (Deterministic Fallback)
 */
export const paraphraseOfflinePrompt = (rawPrompt: string): string => {
  if (!rawPrompt.trim()) return rawPrompt;

  const numberedSections = rawPrompt.split(/(?:^|\n|\s+)(?:[0-9]{1,2}[\.\)]|\-)\s+/i).filter(s => s.trim().length > 5);

  if (numberedSections.length > 1) {
    const parsedItems = parseMultipleIndonesianPromptsLocally(rawPrompt);
    const dateStr = parsedItems.find(it => it.deliveryDate)?.deliveryDate;
    
    let header = `Tolong buatkan ${parsedItems.length} surat jalan`;
    if (dateStr) {
      header += ` untuk tanggal kirim ${dateStr}`;
    }
    header += ':\n';

    const lines = parsedItems.map((item, idx) => {
      const parts: string[] = [];
      if (item.blNumber) parts.push(`BL ${item.blNumber}`);
      if (item.poNumber) parts.push(`PO ${item.poNumber}`);
      if (item.deliveryAddress) parts.push(`delivery address ${item.deliveryAddress}`);
      if (item.weightKg) parts.push(`berat ${item.weightKg}`);
      if (item.description && item.description !== 'GENERAL CARGO') parts.push(`barang ${item.description}`);
      if (item.remarks) parts.push(`remarks ${item.remarks}`);
      if (item.deliveryDate && !dateStr) parts.push(`tanggal kirim ${item.deliveryDate}`);
      return `${idx + 1}. ${parts.join(', ')}`;
    });

    return header + lines.join('\n');
  }

  const single = parseIndonesianPromptLocally(rawPrompt);
  const parts: string[] = [];
  if (single.deliveryDate) parts.push(`tanggal kirim ${single.deliveryDate}`);
  if (single.deliveryAddress) parts.push(`delivery address ${single.deliveryAddress}`);
  if (single.blNumber) parts.push(`BL ${single.blNumber}`);
  if (single.poNumber) parts.push(`PO ${single.poNumber}`);
  if (single.description && single.description !== 'GENERAL CARGO') parts.push(`barang ${single.description}`);
  if (single.weightKg) parts.push(`berat ${single.weightKg}`);
  if (single.remarks) parts.push(`remarks ${single.remarks}`);

  if (parts.length > 0) {
    return `Buatkan saya surat jalan untuk ${parts.join(', ')}`;
  }

  return rawPrompt;
};

/**
 * Transcribe recorded audio Blob to Indonesian text using Gemini Multimodal Audio API
 */
export const transcribeAudioWithGemini = async (audioBlob: Blob): Promise<string> => {
  const arrayBuffer = await audioBlob.arrayBuffer();
  const bytes = new Uint8Array(arrayBuffer);
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  const base64Audio = btoa(binary);
  const mimeType = audioBlob.type ? audioBlob.type.split(';')[0] : 'audio/webm';

  const systemInstruction = `Anda adalah sistem Speech-to-Text (STT) akurat untuk PT NIAGA LOGISTICS SEJAHTERA (NLS Logistik).
Tugas Anda adalah mentranskripsikan instruksi suara pengguna ke dalam teks Bahasa Indonesia yang rapi dan presisi.
Perhatikan penulisan angka, tanggal, nomor B/L, nomor PO, nama terminal/pelabuhan (seperti NPCT1, Koja UTC3, Teluk Lamong, Bitung), nama barang, berat kargo, dan keterangan kontainer.
HANYA berikan teks hasil transkripsi tanpa tanda kutip, tanpa pengantar, dan tanpa catatan tambahan.`;

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
                {
                  inline_data: {
                    mime_type: mimeType,
                    data: base64Audio
                  }
                },
                { text: systemInstruction }
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
      console.warn(`Audio transcription failed on model ${model}, trying next...`, e);
    }
  }

  throw new Error('Gagal mentranskripsikan rekaman suara dengan AI.');
};

/**
 * Offline Rule-based NLP Parser for Indonesian Prompts (Final Fallback)
 */
export const parseIndonesianPromptLocally = (prompt: string): AIExtractionResult => {
  const p = prompt.toLowerCase();
  const result: AIExtractionResult = {};

  // 1. Tanggal Kirim / Delivery Date
  const dateMatch = prompt.match(/(?:tanggal(?:\s+kirim)?|tgl(?:\s+kirim)?|delivery\s+date|date|untuk tanggal|kirim tanggal)[\s:]*([0-9]{1,2}\s+[A-Za-z]+\s+[0-9]{4}|[0-9]{1,2}[-\/][0-9]{1,2}[-\/][0-9]{2,4})/i);
  if (dateMatch) {
    result.deliveryDate = dateMatch[1].trim();
  }

  // 2. Delivery Address / Tujuan (Includes normalization for NPCT, Koja, JICT, etc.)
  const addrMatch = prompt.match(/(?:delivery addres[s]?|alamat tujuan|tujuan|ke|kirim ke)[\s:]+([^,\n\.]+?(?:(?=,\s*(?:dengan|bl|do|po|weight|berat|barang|remarks))|$))/i);
  if (addrMatch) {
    result.deliveryAddress = normalizeDeliveryAddress(addrMatch[1].replace(/^(kesini|ke)\s+/i, '').trim());
  } else {
    // Check if any alias or address is mentioned directly in prompt (e.g. "npct", "koja", "jict")
    const detectedAddr = normalizeDeliveryAddress(prompt);
    if (detectedAddr && detectedAddr !== prompt.trim()) {
      result.deliveryAddress = detectedAddr;
    }
  }

  // 3. BL / DO Number
  const blMatch = prompt.match(/(?:bl number|bl no|no bl|b\/l|bl|do number|do no|no do|d\/o|do)[\s:]*([A-Za-z0-9\-_]+)/i);
  if (blMatch) {
    result.blNumber = blMatch[1].toUpperCase().trim();
  }

  // 4. PO Number
  const poMatch = prompt.match(/(?:po number|po no|no po|po)[\s:]*([A-Za-z0-9\-\/_]+(?:\s*\([^\)\n]+\))?)/i);
  if (poMatch && !poMatch[1].toLowerCase().startsWith('nomor') && !poMatch[1].toLowerCase().startsWith('number')) {
    result.poNumber = poMatch[1].trim();
  }

  // 5. Weight (KG) - matches "Gross weight: 9695 kg", "19.000 kg", "10,000 kg", "7191 kg"
  const weightMatch = prompt.match(/(?:gross weight|gw|weight|berat|bobot)[\s:]*([0-9\.,]+\s*(?:kgs?|kg|ton)?)/i) ||
                      prompt.match(/(?:^|\n|\s)([0-9]{1,3}(?:[\.,][0-9]{3})*(?:[\.,][0-9]+)?|[0-9]+)\s*(?:kgs?|kg|ton)(?:$|\n|\s)/i);
  if (weightMatch) {
    let w = weightMatch[1].trim();
    if (!w.toLowerCase().includes('kg')) w += ' KGS';
    else w = w.replace(/kg[s]?/i, 'KGS').trim();
    result.weightKg = w.toUpperCase();
  }

  // 6. Remarks / Keterangan
  const remarksMatch = prompt.match(/(?:remarks|keterangan|ket)[\s:]*([0-9]+\s*[xX]\s*[0-9]+(?:\s*[A-Za-z]+)?|[^,\n\.]+)/i);
  if (remarksMatch) {
    result.remarks = remarksMatch[1].trim().toUpperCase();
  }

  // 7. Description of Goods / Barang
  const goodsMatch = prompt.match(/(?:description of goods|nama barang|barang|goods|muatan|kargo)[\s:]+([^,\n\.]+?(?:(?=,\s*(?:weight|berat|po|bl|do|remarks))|$))/i);
  if (goodsMatch) {
    result.description = goodsMatch[1].trim().toUpperCase();
  }

  // 8. Container / Seal (Default empty if not specified in prompt)
  const containerMatch = prompt.match(/(?:container|kontainer|seal)[\s:]*([A-Za-z0-9\/\s\-]+?)(?=(?:,\s*(?:barang|weight|remarks|po|bl|do))|$)/i);
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
  // Check if prompt mentions multiple items or numbered list (e.g., 1. BL ..., 2. DO ... or multiple doc occurrences)
  const docMatches = prompt.match(/(?:BL|DO|B\/L)[\s#:]*([A-Za-z0-9\-\/]+)/gi);
  const numberedSections = prompt.split(/(?:^|\n|\s+)(?:[0-9]{1,2}[\.\)]|\-)\s+/i).filter(s => s.trim().length > 5);

  if (numberedSections.length > 1 || (docMatches && docMatches.length > 1)) {
    // Extract base common fields (delivery address, date, driver) from the whole prompt or the first section
    const baseInfo = parseIndonesianPromptLocally(prompt);
    
    const sectionsToParse = numberedSections.length > 1 
      ? numberedSections 
      : prompt.split(/(?=(?:BL|DO|B\/L)[\s#:]*[A-Za-z0-9])/i).filter(s => s.trim().length > 5);

    // If first item had a deliveryDate, make sure it cascades to all items
    let inheritedDate = baseInfo.deliveryDate;
    if (!inheritedDate && sectionsToParse.length > 0) {
      const firstItem = parseIndonesianPromptLocally(sectionsToParse[0]);
      if (firstItem.deliveryDate) inheritedDate = firstItem.deliveryDate;
    }

    return sectionsToParse.map((sec) => {
      const itemInfo = parseIndonesianPromptLocally(sec);
      return {
        ...baseInfo,
        ...itemInfo,
        deliveryAddress: itemInfo.deliveryAddress || baseInfo.deliveryAddress,
        deliveryDate: itemInfo.deliveryDate || inheritedDate || baseInfo.deliveryDate,
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

PENTING: Pengguna dapat meminta pembuatan 1 surat jalan ATAU LEBIH DARI 1 SURAT JALAN SEKALIGUS (misalnya membuat 2, 3, 4, 6 atau lebih surat jalan sekaligus, dengan alamat tujuan sama atau berbeda, nomor BL berbeda, nomor PO berbeda, barang berbeda, berat berbeda, dan remarks berbeda).

ATURAN NORMALISASI LOGISTIK (SANGAT PENTING):
1. Terminal / Delivery Address Shorthand:
   - Jika pengguna menulis "NPCT", "NPCT1", "Npct", "Priok 1", WAJIB ubah deliveryAddress menjadi: "New Priok Container Terminal One (NPCT1)".
   - Jika pengguna menulis "Koja", "koja", "UTC3", "Peti Kemas Koja", WAJIB ubah deliveryAddress menjadi: "Terminal Peti Kemas Koja (UTC3)".
   - Jika pengguna menulis "JICT", "jict", "Jakarta International Container Terminal", WAJIB ubah deliveryAddress menjadi: "JAKARTA INTERNATIONAL CONTAINER TERMINAL".
   - Jika pengguna menulis "Bitung", "TPK Bitung", WAJIB ubah deliveryAddress menjadi: "Terminal Petikemas Bitung (TPK Bitung)".
   - Jika pengguna menulis "Mustika Alam", "TMAL", WAJIB ubah deliveryAddress menjadi: "PT Terminal Mustika Alam Lestari".
2. DO vs BL:
   - Jika pengguna menulis "DO <nomor>" atau "DO: <nomor>", interpretasikan dan masukkan nomor tersebut ke dalam field "blNumber".
3. PO Number:
   - Ekstrak seluruh nomor PO termasuk variasi seperti "PO : 337497 ( 436-68286)", "PO 1437021", "PO MDL-2644285", "PO ABI-2603".
4. Standarisasi Berat:
   - Jika ada angka berat seperti "9695 kg", "19.000 kg", "10,000 kg", "7191 kg", "Gross weight: 9695 kg", standarkan satuannya menjadi KGS (contoh: "9695 KGS", "19.000 KGS", "10,000 KGS", "7191 KGS").
5. Tanggal Kirim Beruntun:
   - Jika tanggal kirim (misal: "28 September 2026") hanya tertulis di nomor 1 atau secara umum, wariskan tanggal tersebut ke SEMUA dokumen surat jalan dalam daftar.
6. Container Seal:
   - Bidang "containerSeal" seringkali kosong. Jika tidak disebutkan di prompt, WAJIB kosongkan string: "". JANGAN mengarang atau mengisi default.

Keluarkan HANYA format JSON valid tanpa teks lain dengan struktur:
{
  "documents": [
    {
      "deliveryAddress": "Nama terminal resmi lengkap",
      "blNumber": "Nomor BL",
      "poNumber": "Nomor PO",
      "description": "Nama barang kargo",
      "weightKg": "Berat dengan satuan contoh: 22000 KGS atau 8732,5 KGS",
      "remarks": "Contoh: 1 X 40 HR atau 1 X 40 HC",
      "deliveryDate": "Contoh: 28 September 2026 atau 14 Sep 2026",
      "containerSeal": "",
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
}`;

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
          const rawAddress = root.deliveryAddress || root.delivery_address || root.alamat_pengiriman || root.tujuan || globalAddr;
          const rawWeight = firstItem.weightKg || firstItem.weight || firstItem.berat || '20000 KGS';
          const weightNormalized = rawWeight.toString().toUpperCase().includes('KG') ? rawWeight.toString().toUpperCase() : `${rawWeight} KGS`;

          return {
            deliveryAddress: normalizeDeliveryAddress(rawAddress),
            blNumber: root.blNumber || root.bl_number || root.doNumber || root.do_number || root.nomor_bl || root.nomor_do || `BL-AUTO-00${index + 1}`,
            poNumber: root.poNumber || root.po_number || root.nomor_po || `PO-2026/0${index + 1}`,
            description: firstItem.description || firstItem.deskripsi || firstItem.item || firstItem.nama_barang || 'GENERAL CARGO',
            weightKg: weightNormalized,
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
