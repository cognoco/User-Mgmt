/**
 * Headless Language Selector Component
 *
 * Manages language state without rendering UI.
 */
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

export interface LanguageSelectorProps {
  render: (props: { language: string; setLanguage: (lang: string) => void }) => React.ReactNode;
}

export function LanguageSelector({ render }: LanguageSelectorProps) {
  const { i18n } = useTranslation();
  const [language, setLanguageState] = useState(i18n.language);

  const setLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
    setLanguageState(lang);
  };

  return <>{render({ language, setLanguage })}</>;
}
