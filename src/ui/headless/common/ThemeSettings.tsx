import { useEffect, useState } from 'react';
import { usePreferencesStore } from '@/lib/stores/preferences.store';
import { useTheme } from '@/components/ui/theme-provider';
import { usePalette, PaletteKey } from '@/components/ui/PaletteProvider';

/**
 * Headless Theme Settings
 */
export default function ThemeSettings({
  render
}: {
  render: (props: {
    pendingTheme: 'light' | 'dark' | 'system';
    setPendingTheme: (t: 'light' | 'dark' | 'system') => void;
    pendingPalette: PaletteKey;
    setPendingPalette: (p: PaletteKey) => void;
    saving: boolean;
    success: string;
    error: string | null;
    handleSave: () => Promise<void>;
    handleCancel: () => void;
  }) => React.ReactNode;
}) {
  const { preferences, fetchPreferences, updatePreferences, isLoading, error } = usePreferencesStore();
  const { theme, setTheme } = useTheme();
  const { paletteKey, setPaletteByKey } = usePalette();

  const [pendingTheme, setPendingTheme] = useState<'light' | 'dark' | 'system'>(theme as any);
  const [pendingPalette, setPendingPalette] = useState<PaletteKey>(paletteKey as PaletteKey);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [previewMode, setPreviewMode] = useState(false);

  useEffect(() => {
    if (!preferences && !isLoading && !error) fetchPreferences();
  }, [preferences, isLoading, error, fetchPreferences]);

  useEffect(() => {
    if (preferences) {
      if (preferences.theme) setPendingTheme(preferences.theme as any);
      if (preferences.color_scheme) setPendingPalette(preferences.color_scheme as PaletteKey);
    }
  }, [preferences]);

  useEffect(() => {
    setTheme(pendingTheme);
    setPaletteByKey(pendingPalette);
    setPreviewMode(true);
  }, [pendingTheme, pendingPalette, setTheme, setPaletteByKey]);

  const handleSave = async () => {
    setSaving(true);
    setSuccess('');
    const ok = await updatePreferences({ theme: pendingTheme, color_scheme: pendingPalette });
    setSaving(false);
    if (ok) {
      setSuccess('saved');
      setPreviewMode(false);
    }
  };

  const handleCancel = () => {
    if (preferences) {
      setPendingTheme(preferences.theme as any);
      if (preferences.color_scheme) setPendingPalette(preferences.color_scheme as PaletteKey);
    }
    setPreviewMode(false);
  };

  return (
    <>{render({ pendingTheme, setPendingTheme, pendingPalette, setPendingPalette, saving, success, error, handleSave, handleCancel })}</>
  );
}
