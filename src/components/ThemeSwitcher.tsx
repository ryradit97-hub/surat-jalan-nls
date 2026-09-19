import React, { useState, useRef, useEffect } from 'react';
import { Palette, Check, ChevronDown } from 'lucide-react';
import { AppTheme, THEMES } from '../types/theme';

interface ThemeSwitcherProps {
  currentTheme: AppTheme;
  onSelectTheme: (theme: AppTheme) => void;
}

export const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({ currentTheme, onSelectTheme }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const activeTheme = THEMES.find((t) => t.id === currentTheme) || THEMES[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Switcher Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold theme-btn-trigger transition-all cursor-pointer active:scale-95 border shadow-sm"
        title="Ganti Tema Aplikasi (The Yoga Purple, Earth Cream, Sea NLS)"
      >
        {/* Two-tone theme preview dot */}
        <span className="relative flex w-3.5 h-3.5 rounded-full overflow-hidden shrink-0 ring-1 ring-white/20 shadow-inner">
          <span
            className="w-1/2 h-full"
            style={{ backgroundColor: activeTheme.primaryColor }}
          />
          <span
            className="w-1/2 h-full"
            style={{ backgroundColor: activeTheme.secondaryColor }}
          />
        </span>

        <span className="hidden sm:inline theme-trigger-label">{activeTheme.badge}</span>
        <ChevronDown
          className={`w-3 h-3 opacity-70 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown Card */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-72 theme-dropdown-menu rounded-2xl p-2 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150 border">
          <div className="px-3 py-1.5 text-[10px] uppercase font-bold tracking-wider opacity-60 border-b border-white/10 mb-1 flex items-center justify-between">
            <span>Pilih Tema Tampilan</span>
            <Palette className="w-3 h-3 opacity-80" />
          </div>

          <div className="space-y-1">
            {THEMES.map((theme) => {
              const isSelected = theme.id === currentTheme;
              return (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() => {
                    onSelectTheme(theme.id);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left flex items-center gap-3 p-2.5 rounded-xl transition-all cursor-pointer group ${
                    isSelected ? 'theme-menu-item-active' : 'theme-menu-item'
                  }`}
                >
                  {/* Swatch circle preview */}
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-md ring-1 ring-black/10 overflow-hidden relative"
                    style={{
                      background: `linear-gradient(135deg, ${theme.primaryColor} 0%, ${theme.secondaryColor} 100%)`,
                    }}
                  >
                    <span className="text-xs drop-shadow-sm select-none">
                      {theme.id === 'yoga-purple' ? '🧘' : theme.id === 'earth-cream' ? '🌾' : '🌊'}
                    </span>
                  </div>

                  {/* Theme Info */}
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold flex items-center justify-between">
                      <span className="truncate">{theme.name}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 ml-1" />}
                    </div>
                    <p className="text-[11px] opacity-60 truncate mt-0.5">{theme.subtitle}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
