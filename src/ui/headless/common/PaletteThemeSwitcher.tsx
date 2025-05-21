import { usePalette, PaletteKey } from '@/components/ui/PaletteProvider';
import { useTheme } from '@/components/ui/theme-provider';

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
