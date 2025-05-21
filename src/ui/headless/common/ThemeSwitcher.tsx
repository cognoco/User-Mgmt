import { useTheme } from 'next-themes';

/**
 * Headless Theme Switcher
 */
export default function ThemeSwitcher({
  render
}: { render: (props: { theme: string; toggle: () => void }) => React.ReactNode }) {
  const { theme, setTheme } = useTheme();
  const toggle = () => setTheme(theme === 'light' ? 'dark' : 'light');
  return <>{render({ theme: theme as string, toggle })}</>;
}
