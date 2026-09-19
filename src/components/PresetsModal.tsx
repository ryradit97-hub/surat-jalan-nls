import React from 'react';
import { ShipperPreset, DriverPreset } from '../types/suratJalan';
import { defaultShippers, defaultDrivers } from '../utils/defaultData';
import { Bookmark, User, Truck, X, ArrowRight } from 'lucide-react';

interface PresetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectShipper: (shipper: ShipperPreset) => void;
  onSelectDriver: (driver: DriverPreset) => void;
}

export const PresetsModal: React.FC<PresetsModalProps> = ({
  isOpen,
  onClose,
  onSelectShipper,
  onSelectDriver,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#140d1c]/80 backdrop-blur-md">
      <div className="liquid-glass rounded-3xl w-full max-w-md p-6 shadow-2xl border border-[#faedd9]/20 bg-[#251736] max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#faedd9]/10">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-[#faedd9]/15 flex items-center justify-center text-[#faedd9]">
              <Bookmark className="w-3.5 h-3.5" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-[#fffdfa]">Preset & Templat Cepat</h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-6 h-6 rounded-full flex items-center justify-center text-[#c4b5fd]/70 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* List of Presets */}
        <div className="space-y-3.5 py-3 overflow-y-auto flex-1 scrollbar-none">
          {/* Shippers */}
          <div>
            <h4 className="text-[10.5px] font-bold uppercase tracking-wider text-[#faedd9] flex items-center gap-1.5 mb-2">
              <User className="w-3 h-3 text-[#d8b4fe]" />
              <span>Shipper / Pengirim</span>
            </h4>
            <div className="space-y-1.5">
              {defaultShippers.map((shipper) => (
                <div
                  key={shipper.id}
                  onClick={() => {
                    onSelectShipper(shipper);
                    onClose();
                  }}
                  className="p-2.5 rounded-xl bg-[#faedd9]/5 hover:bg-[#faedd9]/12 border border-[#faedd9]/8 hover:border-[#faedd9]/25 transition-all cursor-pointer group flex items-center justify-between"
                >
                  <div>
                    <h5 className="text-xs font-bold text-[#fffdfa] group-hover:text-[#faedd9] transition-colors">
                      {shipper.name}
                    </h5>
                    <p className="text-[10px] text-[#c4b5fd]/70 line-clamp-1 mt-0.5">
                      {shipper.address}
                    </p>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-[#faedd9]/60 group-hover:text-[#faedd9] transition-all shrink-0 ml-2" />
                </div>
              ))}
            </div>
          </div>

          {/* Drivers */}
          <div>
            <h4 className="text-[10.5px] font-bold uppercase tracking-wider text-[#faedd9] flex items-center gap-1.5 mb-2">
              <Truck className="w-3 h-3 text-[#d8b4fe]" />
              <span>Driver & Armadah</span>
            </h4>
            <div className="space-y-1.5">
              {defaultDrivers.map((driver) => (
                <div
                  key={driver.id}
                  onClick={() => {
                    onSelectDriver(driver);
                    onClose();
                  }}
                  className="p-2.5 rounded-xl bg-[#faedd9]/5 hover:bg-[#faedd9]/12 border border-[#faedd9]/8 hover:border-[#faedd9]/25 transition-all cursor-pointer group flex items-center justify-between"
                >
                  <div>
                    <h5 className="text-xs font-bold text-[#fffdfa] group-hover:text-[#faedd9] transition-colors">
                      {driver.name} ({driver.phone})
                    </h5>
                    <p className="text-[10px] text-[#c4b5fd]/70 mt-0.5">
                      {driver.unitType} • <span className="font-mono text-[#faedd9]">{driver.licensePlate}</span>
                    </p>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-[#faedd9]/60 group-hover:text-[#faedd9] transition-all shrink-0 ml-2" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
