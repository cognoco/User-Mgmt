import { usePalette, PaletteKey } from '@/ui/primitives/PaletteProvider';
import { useTheme } from '@/ui/primitives/themeProvider'75;

/**
 * Headless Palette/Theme Switcher
 */
export default function PaletteThemeSwitcher({
  render
}: {
  render: (props: {
    paletteKey: PaletteKey;
    setPaletteByKey: (key: PaletteKey) => void;
    theme: 'light' | 'dark' | 'system';
    setTheme: (theme: 'light' | 'dark' | 'system') => void;
  }) => React.ReactNode;
}) {
  const { paletteKey, setPaletteByKey } = usePalette();
  const { theme, setTheme } = useTheme();

  return <>{render({ paletteKey: paletteKey as PaletteKey, setPaletteByKey, theme: theme as any, setTheme })}</>;
}
