import React, { useState } from 'react';
import { SuratJalanData, SuratJalanItem } from '../types/suratJalan';
import { defaultDeliveryAddresses, defaultShippers } from '../utils/defaultData';
import { Plus, Trash2, MapPin, Package, Truck, User, Calendar, Hash, Tag } from 'lucide-react';

interface FormEditorProps {
  data: SuratJalanData;
  onChange: (updated: SuratJalanData) => void;
  onOpenPresets: () => void;
  onOpenBatchModal: () => void;
}

export const FormEditor: React.FC<FormEditorProps> = ({
  data,
  onChange,
}) => {
  const [selectedAddressPreset, setSelectedAddressPreset] = useState<string>(
    defaultDeliveryAddresses.includes(data.deliveryAddress) ? data.deliveryAddress : 'custom'
  );

  const [selectedShipperPreset, setSelectedShipperPreset] = useState<string>(
    defaultShippers.find(s => s.name === data.shipperName)?.id || 'custom'
  );

  // Month mapping for Indonesian & English dates
  const monthMap: Record<string, string> = {
    jan: '01', januari: '01', january: '01',
    feb: '02', februari: '02', february: '02',
    mar: '03', maret: '03', march: '03',
    apr: '04', april: '04',
    mei: '05', may: '05',
    jun: '06', juni: '06', june: '06',
    jul: '07', juli: '07', july: '07',
    agu: '08', agt: '08', agustus: '08', aug: '08', august: '08',
    sep: '09', september: '09',
    okt: '10', oktober: '10', october: '10',
    nov: '11', november: '11',
    des: '12', desember: '12', dec: '12', december: '12'
  };

  const toISODate = (str?: string): string => {
    if (!str) return '';
    const trimmed = str.trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;

    const match = trimmed.match(/^(\d{1,2})\s+([a-zA-Z]+)\s+(\d{4})/);
    if (match) {
      const day = match[1].padStart(2, '0');
      const monthStr = match[2].toLowerCase();
      const month = monthMap[monthStr] || '01';
      const year = match[3];
      return `${year}-${month}-${day}`;
    }

    const d = new Date(trimmed);
    if (!isNaN(d.getTime())) {
      return d.toISOString().slice(0, 10);
    }
    return '';
  };

  const formatToDisplayDate = (isoStr?: string): string => {
    if (!isoStr) return '';
    const parts = isoStr.split('-');
    if (parts.length !== 3) return isoStr;
    const year = parts[0];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    const monthIdx = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    return `${day} ${monthNames[monthIdx] || parts[1]} ${year}`;
  };

  const handleDateChange = (field: 'deliveryDate' | 'arrivedDate' | 'dischargeDate', isoValue: string) => {
    const formatted = formatToDisplayDate(isoValue);
    handleTextChange(field, formatted);
  };

  const handleTextChange = (field: keyof SuratJalanData, value: any) => {
    onChange({
      ...data,
      [field]: value,
      updatedAt: new Date().toISOString(),
    });
  };

  const handleDeliveryAddressDropdown = (val: string) => {
    setSelectedAddressPreset(val);
    if (val !== 'custom') {
      handleTextChange('deliveryAddress', val);
    }
  };

  const handleShipperDropdown = (id: string) => {
    setSelectedShipperPreset(id);
    if (id !== 'custom') {
      const found = defaultShippers.find(s => s.id === id);
      if (found) {
        onChange({
          ...data,
          shipperName: found.name,
          shipperAddress: found.address,
          updatedAt: new Date().toISOString(),
        });
      }
    }
  };

  const handleItemChange = (index: number, field: keyof SuratJalanItem, value: string) => {
    const updatedItems = [...data.items];
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: value,
    };
    onChange({
      ...data,
      items: updatedItems,
      updatedAt: new Date().toISOString(),
    });
  };

  const addItemRow = () => {
    const newItem: SuratJalanItem = {
      id: 'item-' + Date.now(),
      no: data.items.length + 1,
      containerSeal: '',
      description: '',
      packageQty: '',
      weightKg: '',
      remarks: '',
    };
    onChange({
      ...data,
      items: [...data.items, newItem],
    });
  };

  const removeItemRow = (index: number) => {
    if (data.items.length <= 1) return;
    const updatedItems = data.items.filter((_, idx) => idx !== index);
    onChange({
      ...data,
      items: updatedItems.map((item, idx) => ({ ...item, no: idx + 1 })),
    });
  };

  return (
    <div className="flex flex-col gap-3.5">
      {/* SECTION 1: PENGIRIMAN & DOKUMEN UTAMA */}
      <div className="liquid-card rounded-2xl p-4 md:p-5 shadow-sm border border-[#faedd9]/15 bg-[#251736]/70">
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#faedd9]/10">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-[#faedd9]/15 flex items-center justify-center text-[#faedd9]">
              <MapPin className="w-3.5 h-3.5" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-[#fffdfa]">Pengiriman & Dokumen</h3>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded-full text-[9.5px] font-bold bg-[#faedd9]/15 text-[#faedd9] border border-[#faedd9]/20">
            UTAMA
          </span>
        </div>

        {/* Delivery Address Dropdown & Textarea */}
        <div className="mb-3">
          <label className="block text-[10.5px] font-semibold tracking-wider text-[#faedd9]/80 uppercase mb-1 flex items-center justify-between">
            <span>DELIVERY ADDRESS (Alamat Tujuan)</span>
          </label>
          
          <select
            className="w-full liquid-input px-3 py-2 rounded-xl text-xs font-medium mb-1.5 cursor-pointer bg-[#181022] text-[#fffdfa]"
            value={selectedAddressPreset}
            onChange={(e) => handleDeliveryAddressDropdown(e.target.value)}
          >
            {defaultDeliveryAddresses.map((addr, idx) => (
              <option key={idx} value={addr} className="bg-[#181022] text-[#fffdfa]">
                📍 {addr}
              </option>
            ))}
            <option value="custom" className="bg-[#181022] text-[#d8b4fe]">
              ✏️ Ketik Manual / Alamat Lainnya...
            </option>
          </select>

          <textarea
            rows={2}
            className="w-full liquid-input px-3 py-2 rounded-xl text-xs resize-none"
            value={data.deliveryAddress}
            onChange={(e) => {
              setSelectedAddressPreset('custom');
              handleTextChange('deliveryAddress', e.target.value);
            }}
            placeholder="Tulis alamat tujuan pengiriman di sini..."
          />
        </div>

        {/* BL Number & PO Number */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-3">
          <div>
            <label className="block text-[10.5px] font-semibold tracking-wider text-[#faedd9]/80 uppercase mb-1 flex items-center gap-1">
              <Hash className="w-3 h-3 text-[#d8b4fe]" />
              <span>BL NUMBER</span>
            </label>
            <input
              type="text"
              className="w-full liquid-input px-3 py-1.5 rounded-xl text-xs font-mono font-semibold text-[#faedd9]"
              value={data.blNumber}
              onChange={(e) => handleTextChange('blNumber', e.target.value)}
              placeholder="e.g. JKTG58923800"
            />
          </div>

          <div>
            <label className="block text-[10.5px] font-semibold tracking-wider text-[#faedd9]/80 uppercase mb-1 flex items-center gap-1">
              <Tag className="w-3 h-3 text-[#c4b5fd]/60" />
              <span>PO NUMBER</span>
            </label>
            <input
              type="text"
              className="w-full liquid-input px-3 py-1.5 rounded-xl text-xs font-mono text-[#fffdfa]"
              value={data.poNumber}
              onChange={(e) => handleTextChange('poNumber', e.target.value)}
              placeholder="e.g. MDL-2643957 (Opsional)"
            />
          </div>
        </div>

        {/* Delivery Date / Tanggal Kirim using Date Picker */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-[10.5px] font-semibold tracking-wider text-[#faedd9]/80 uppercase flex items-center gap-1">
              <Calendar className="w-3 h-3 text-[#d8b4fe]" />
              <span>Delivery Date / Tanggal Kirim</span>
            </label>
            <button
              type="button"
              onClick={() => {
                const today = new Date().toISOString().slice(0, 10);
                handleDateChange('deliveryDate', today);
              }}
              className="text-[10px] text-[#d8b4fe] hover:text-[#faedd9] hover:underline cursor-pointer transition-colors"
              title="Set tanggal hari ini"
            >
              Set Hari Ini
            </button>
          </div>
          <div className="relative flex items-center gap-2">
            <input
              type="date"
              className="w-full liquid-input px-3 py-2 rounded-xl text-xs font-semibold text-[#fffdfa] cursor-pointer [color-scheme:dark]"
              value={toISODate(data.deliveryDate)}
              onChange={(e) => handleDateChange('deliveryDate', e.target.value)}
            />
            {data.deliveryDate && (
              <span className="shrink-0 text-[11px] font-mono px-2.5 py-1.5 rounded-xl bg-[#faedd9]/10 text-[#faedd9] border border-[#faedd9]/15 shadow-sm">
                {data.deliveryDate}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* SECTION 2: DETAIL BARANG & KONTAINER */}
      <div className="liquid-card rounded-2xl p-4 md:p-5 shadow-sm border border-[#faedd9]/12 bg-[#251736]/70">
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#faedd9]/10">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-[#faedd9]/15 flex items-center justify-center text-[#faedd9]">
              <Package className="w-3.5 h-3.5" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-[#fffdfa]">Detail Barang & Kargo</h3>
            </div>
          </div>
          <button
            type="button"
            onClick={addItemRow}
            className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold text-[#faedd9] bg-[#faedd9]/12 hover:bg-[#faedd9]/20 border border-[#faedd9]/20 transition-all cursor-pointer"
          >
            <Plus className="w-3 h-3" />
            <span>Tambah Baris</span>
          </button>
        </div>

        <div className="space-y-2.5">
          {data.items.map((item, index) => (
            <div
              key={item.id}
              className="p-3 rounded-xl bg-[#faedd9]/4 border border-[#faedd9]/8 hover:border-[#faedd9]/20 transition-all"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-[#faedd9] flex items-center gap-1">
                  Baris #{index + 1}
                </span>
                {data.items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeItemRow(index)}
                    className="p-1 rounded-md text-[#c4b5fd]/60 hover:text-[#f472b6] transition-colors"
                    title="Hapus baris ini"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* Container Seal & Description */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[10px] font-semibold text-[#faedd9]/70">
                      Container / Seal (Opsional)
                    </label>
                    {item.containerSeal && (
                      <button
                        type="button"
                        onClick={() => handleItemChange(index, 'containerSeal', '')}
                        className="text-[9.5px] text-[#f472b6] hover:text-[#fb7185] hover:underline cursor-pointer"
                        title="Kosongkan Container / Seal"
                      >
                        ✕ Kosongkan
                      </button>
                    )}
                  </div>
                  <input
                    type="text"
                    className="w-full liquid-input px-2.5 py-1.5 rounded-lg text-xs font-mono"
                    value={item.containerSeal}
                    onChange={(e) => handleItemChange(index, 'containerSeal', e.target.value)}
                    placeholder="Biarkan kosong jika belum ada container"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-[#faedd9] mb-1">
                    Description of Goods (Nama Barang)
                  </label>
                  <input
                    type="text"
                    className="w-full liquid-input px-2.5 py-1.5 rounded-lg text-xs font-semibold text-[#fffdfa]"
                    value={item.description}
                    onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                    placeholder="e.g. PLASTIC KITCHEN WARE"
                  />
                </div>
              </div>

              {/* Package Qty, Weight, Remarks */}
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[10px] font-semibold text-[#faedd9]/70 mb-1">
                    Package (QTY)
                  </label>
                  <input
                    type="text"
                    className="w-full liquid-input px-2 py-1.5 rounded-lg text-xs"
                    value={item.packageQty}
                    onChange={(e) => handleItemChange(index, 'packageQty', e.target.value)}
                    placeholder="e.g. 100 CTN"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-[#faedd9] mb-1">
                    Weight (KG)
                  </label>
                  <input
                    type="text"
                    className="w-full liquid-input px-2 py-1.5 rounded-lg text-xs font-semibold text-[#faedd9]"
                    value={item.weightKg}
                    onChange={(e) => handleItemChange(index, 'weightKg', e.target.value)}
                    placeholder="e.g. 8732,5"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-[#faedd9] mb-1">
                    Remarks (Ket.)
                  </label>
                  <input
                    type="text"
                    className="w-full liquid-input px-2 py-1.5 rounded-lg text-xs text-[#fffdfa]"
                    value={item.remarks}
                    onChange={(e) => handleItemChange(index, 'remarks', e.target.value)}
                    placeholder="e.g. 1 X 40 HC"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 3: SHIPPER */}
      <div className="liquid-card rounded-2xl p-4 md:p-5 shadow-sm border border-[#faedd9]/12 bg-[#251736]/70">
        <div className="flex items-center gap-2 mb-3 pb-2 border-b border-[#faedd9]/10">
          <div className="w-6 h-6 rounded-lg bg-[#faedd9]/15 flex items-center justify-center text-[#faedd9]">
            <User className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-[#fffdfa]">Shipper / Pengirim</h3>
          </div>
        </div>

        <div className="mb-2.5">
          <label className="block text-[10px] font-semibold text-[#faedd9]/70 mb-1">
            Pilih Preset Shipper
          </label>
          <select
            className="w-full liquid-input px-3 py-1.5 rounded-xl text-xs font-medium cursor-pointer bg-[#181022] text-[#fffdfa]"
            value={selectedShipperPreset}
            onChange={(e) => handleShipperDropdown(e.target.value)}
          >
            {defaultShippers.map((shipper) => (
              <option key={shipper.id} value={shipper.id} className="bg-[#181022] text-[#fffdfa]">
                🏢 {shipper.name}
              </option>
            ))}
            <option value="custom" className="bg-[#181022] text-[#d8b4fe]">
              ✏️ Ketik Manual / Shipper Lainnya...
            </option>
          </select>
        </div>

        <div className="mb-2.5">
          <label className="block text-[10px] font-semibold text-[#faedd9]/80 mb-1">
            SHIPPER NAME
          </label>
          <input
            type="text"
            className="w-full liquid-input px-3 py-1.5 rounded-xl text-xs font-semibold text-[#fffdfa]"
            value={data.shipperName}
            onChange={(e) => {
              setSelectedShipperPreset('custom');
              handleTextChange('shipperName', e.target.value);
            }}
            placeholder="Nama Perusahaan Shipper"
          />
        </div>

        <div>
          <label className="block text-[10px] font-semibold text-[#faedd9]/80 mb-1">
            SHIPPER ADDRESS
          </label>
          <textarea
            rows={2}
            className="w-full liquid-input px-3 py-1.5 rounded-xl text-xs resize-none text-[#fffdfa]"
            value={data.shipperAddress}
            onChange={(e) => {
              setSelectedShipperPreset('custom');
              handleTextChange('shipperAddress', e.target.value);
            }}
            placeholder="Alamat Lengkap Shipper"
          />
        </div>
      </div>

      {/* SECTION 4: DRIVER & TRUCKING */}
      <div className="liquid-card rounded-2xl p-4 md:p-5 shadow-sm border border-[#faedd9]/12 bg-[#251736]/70">
        <div className="flex items-center gap-2 mb-3 pb-2 border-b border-[#faedd9]/10">
          <div className="w-6 h-6 rounded-lg bg-[#faedd9]/15 flex items-center justify-center text-[#faedd9]">
            <Truck className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-[#fffdfa]">Pengemudi & Armadah</h3>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-2.5">
          <div>
            <label className="block text-[10px] font-semibold text-[#faedd9]/70 mb-1">
              UNIT TYPE (Truck/Car)
            </label>
            <input
              type="text"
              className="w-full liquid-input px-3 py-1.5 rounded-xl text-xs text-[#fffdfa]"
              value={data.unitType}
              onChange={(e) => handleTextChange('unitType', e.target.value)}
              placeholder="e.g. Trailer 40ft"
            />
          </div>
          <div>
            <label className="block text-[10px] font-semibold text-[#faedd9]/70 mb-1">
              DRIVER NAME (Nama Supir)
            </label>
            <input
              type="text"
              className="w-full liquid-input px-3 py-1.5 rounded-xl text-xs text-[#fffdfa]"
              value={data.driverName}
              onChange={(e) => handleTextChange('driverName', e.target.value)}
              placeholder="Nama pengemudi"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-2.5">
          <div>
            <label className="block text-[10px] font-semibold text-[#faedd9]/70 mb-1">
              PHONE NO.
            </label>
            <input
              type="text"
              className="w-full liquid-input px-3 py-1.5 rounded-xl text-xs text-[#fffdfa] font-mono"
              value={data.phoneNo}
              onChange={(e) => handleTextChange('phoneNo', e.target.value)}
              placeholder="e.g. 0812-xxxx-xxxx"
            />
          </div>
          <div>
            <label className="block text-[10px] font-semibold text-[#faedd9]/70 mb-1">
              LICENSE / No. Polisi
            </label>
            <input
              type="text"
              className="w-full liquid-input px-3 py-1.5 rounded-xl text-xs font-mono uppercase text-[#faedd9] font-bold"
              value={data.licensePlate}
              onChange={(e) => handleTextChange('licensePlate', e.target.value)}
              placeholder="e.g. B 9123 NLS"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[10px] font-semibold text-[#faedd9]/70 flex items-center gap-1">
                <Calendar className="w-2.5 h-2.5 text-[#d8b4fe]" />
                <span>Arrived Date / Tanggal Tiba</span>
              </label>
              {data.arrivedDate && (
                <button
                  type="button"
                  onClick={() => handleTextChange('arrivedDate', '')}
                  className="text-[9.5px] text-[#f472b6] hover:underline cursor-pointer"
                  title="Hapus tanggal tiba"
                >
                  Hapus
                </button>
              )}
            </div>
            <input
              type="date"
              className="w-full liquid-input px-3 py-1.5 rounded-xl text-xs text-[#fffdfa] cursor-pointer [color-scheme:dark]"
              value={toISODate(data.arrivedDate)}
              onChange={(e) => handleDateChange('arrivedDate', e.target.value)}
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[10px] font-semibold text-[#faedd9]/70 flex items-center gap-1">
                <Calendar className="w-2.5 h-2.5 text-[#d8b4fe]" />
                <span>Discharge / Tanggal Bongkar</span>
              </label>
              {data.dischargeDate && (
                <button
                  type="button"
                  onClick={() => handleTextChange('dischargeDate', '')}
                  className="text-[9.5px] text-[#f472b6] hover:underline cursor-pointer"
                  title="Hapus tanggal bongkar"
                >
                  Hapus
                </button>
              )}
            </div>
            <input
              type="date"
              className="w-full liquid-input px-3 py-1.5 rounded-xl text-xs text-[#fffdfa] cursor-pointer [color-scheme:dark]"
              value={toISODate(data.dischargeDate)}
              onChange={(e) => handleDateChange('dischargeDate', e.target.value)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
