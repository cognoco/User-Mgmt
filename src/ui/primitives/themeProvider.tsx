// src/components/theme/theme-provider.tsx
'use client'; // Theme provider needs client context and localStorage

import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'dark' | 'light' | 'system';

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
}

interface ThemeProviderState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const initialState: ThemeProviderState = {
  theme: 'system',
  setTheme: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey = 'vite-ui-theme',
  ...props
}: ThemeProviderProps) {
  // Initialize state with default theme only, avoid localStorage here
  const [theme, setTheme] = useState<Theme>(defaultTheme); 

  // Effect to read from localStorage on mount (client-side only)
  useEffect(() => {
    const storedTheme = localStorage.getItem(storageKey) as Theme | null;
    if (storedTheme && storedTheme !== theme) {
      setTheme(storedTheme);
    }
    // Only run on mount to read initial value
    // eslint-disable-next-line react-hooks/exhaustive-deps 
  }, []);

  // Effect to apply theme class to root element and sync system theme
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');

    let effectiveTheme = theme;
    if (theme === 'system') {
      effectiveTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
    }

    root.classList.add(effectiveTheme);

    // Optional: Persist the resolved system theme if needed?
    // localStorage.setItem(storageKey, effectiveTheme);

  }, [theme]); // Re-run when theme changes

  const value = {
    theme,
    setTheme: (newTheme: Theme) => {
      localStorage.setItem(storageKey, newTheme);
      setTheme(newTheme);
    },
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined)
    throw new Error('useTheme must be used within a ThemeProvider');

  return context;
};
