/**
 * Headless Settings Panel
 *
 * Provides settings data and update handlers via render props.
 */
import { useEffect } from 'react';
import { useSettingsStore } from '@/lib/stores/settings.store';

export interface SettingsPanelProps {
  render: (props: {
    settings: any;
    isLoading: boolean;
    error: string | null;
    updateSettings: (s: any) => Promise<void>;
  }) => React.ReactNode;
}

export function SettingsPanel({ render }: SettingsPanelProps) {
  const { settings, isLoading, error, fetchSettings, updateSettings } = useSettingsStore();

  useEffect(() => { fetchSettings(); }, [fetchSettings]);

  return <>{render({ settings, isLoading, error, updateSettings })}</>;
}
