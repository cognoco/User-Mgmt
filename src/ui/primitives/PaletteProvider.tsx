import React, { createContext, useContext, useEffect, useState } from 'react';
import { palettes, ColorPalette } from '@/lib/constants/themeConstants';

// Keys for localStorage
const PALETTE_KEY = 'user-management-palette';

// Type for palette keys
export type PaletteKey = keyof typeof palettes;

// Context type
interface PaletteContextType {
  palette: ColorPalette;
  paletteKey: PaletteKey | 'custom';
  setPaletteByKey: (key: PaletteKey) => void;
  setCustomPalette: (palette: ColorPalette) => void;
}

const defaultPaletteKey: PaletteKey = 'earthTones';
const defaultPalette = palettes[defaultPaletteKey];

const PaletteContext = createContext<PaletteContextType | undefined>(undefined);

export const PaletteProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [palette, setPalette] = useState<ColorPalette>(defaultPalette);
  const [paletteKey, setPaletteKey] = useState<PaletteKey | 'custom'>(defaultPaletteKey);

  // Load palette from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(PALETTE_KEY);
    if (stored && palettes[stored as PaletteKey]) {
      setPalette(palettes[stored as PaletteKey]);
      setPaletteKey(stored as PaletteKey);
    } else if (stored) {
      // Try to parse custom palette
      try {
        const custom = JSON.parse(stored);
        if (custom && typeof custom === 'object' && custom.primary) {
          setPalette(custom);
          setPaletteKey('custom');
        }
      } catch {
        // Ignore JSON parse errors
      }
    }
  }, []);

  // Persist palette choice
  useEffect(() => {
    if (paletteKey === 'custom') {
      localStorage.setItem(PALETTE_KEY, JSON.stringify(palette));
    } else {
      localStorage.setItem(PALETTE_KEY, paletteKey);
    }
  }, [palette, paletteKey]);

  // Update CSS variables on :root when palette changes
  useEffect(() => {
    const root = document.documentElement;
    Object.entries(palette).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value);
    });
  }, [palette]);

  const setPaletteByKey = (key: PaletteKey) => {
    setPalette(palettes[key]);
    setPaletteKey(key);
  };

  const setCustomPalette = (custom: ColorPalette) => {
    setPalette(custom);
    setPaletteKey('custom');
  };

  return (
    <PaletteContext.Provider value={{ palette, paletteKey, setPaletteByKey, setCustomPalette }}>
      {children}
    </PaletteContext.Provider>
  );
};

export function usePalette() {
  const ctx = useContext(PaletteContext);
  if (!ctx) throw new Error('usePalette must be used within a PaletteProvider');
  return ctx;
} 