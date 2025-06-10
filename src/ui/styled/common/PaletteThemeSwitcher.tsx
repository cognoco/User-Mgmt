import React from 'react';
import { usePalette, PaletteKey } from '@/components/ui/PaletteProvider';
import { useTheme } from '@/components/ui/themeProvider';
import { palettes } from '@/lib/constants/themeConstants';

export const paletteLabels: Record<PaletteKey, string> = {
  earthTones: 'Earth Tones',
  modernTech: 'Modern Tech',
  oceanBreeze: 'Ocean Breeze',
};

const themeLabels: Record<'light' | 'dark' | 'system', string> = {
  light: 'Light',
  dark: 'Dark',
  system: 'System',
};

export const PaletteThemeSwitcher: React.FC = () => {
  const { paletteKey, setPaletteByKey } = usePalette();
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex flex-col gap-4 p-4 border rounded-md bg-background/80 max-w-xs">
      <div>
        <div className="font-semibold mb-2">Color Palette</div>
        <div className="flex gap-2">
          {Object.keys(palettes).map((key) => (
            <button
              key={key}
              className={`px-3 py-1 rounded border text-sm transition-colors ${paletteKey === key ? 'bg-primary text-white' : 'bg-muted text-foreground'}`}
              onClick={() => setPaletteByKey(key as PaletteKey)}
              aria-pressed={paletteKey === key}
            >
              {paletteLabels[key as PaletteKey]}
            </button>
          ))}
        </div>
      </div>
      <div>
        <div className="font-semibold mb-2">Theme Mode</div>
        <div className="flex gap-2">
          {(['light', 'dark', 'system'] as const).map((mode) => (
            <button
              key={mode}
              className={`px-3 py-1 rounded border text-sm transition-colors ${theme === mode ? 'bg-primary text-white' : 'bg-muted text-foreground'}`}
              onClick={() => setTheme(mode)}
              aria-pressed={theme === mode}
            >
              {themeLabels[mode]}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}; 