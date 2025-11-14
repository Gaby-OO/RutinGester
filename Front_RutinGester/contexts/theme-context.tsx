import * as SecureStore from 'expo-secure-store';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Appearance } from 'react-native';

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextValue {
  mode: ThemeMode;
  effectiveScheme: 'light' | 'dark';
  setMode: (m: ThemeMode) => void;
}

const KEY = 'theme_pref_v1';
const ThemeModeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeModeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>('system');
  const [hydrated, setHydrated] = useState(false);
  const system = Appearance.getColorScheme() || 'light';

  useEffect(() => {
    let mounted = true;
    SecureStore.getItemAsync(KEY)
      .then((saved) => {
        if (!mounted) return;
        if (saved === 'light' || saved === 'dark' || saved === 'system') {
          setMode(saved);
        }
      })
      .finally(() => setHydrated(true));
    return () => {
      mounted = false;
    };
  }, []);

  // Re-render when system theme changes AND mode is 'system'
  useEffect(() => {
    const sub = Appearance.addChangeListener(() => {
      if (mode === 'system') {
        // trigger re-render by updating state to same value
        setMode((m) => m);
      }
    });
    return () => sub.remove();
  }, [mode]);

  const effectiveScheme: 'light' | 'dark' = mode === 'system' ? (system === 'dark' ? 'dark' : 'light') : mode;

  const value = useMemo(
    () => ({
      mode,
      effectiveScheme,
      setMode: (m: ThemeMode) => {
        setMode(m);
        SecureStore.setItemAsync(KEY, m).catch(() => {});
      },
    }),
    [mode, effectiveScheme]
  );

  return <ThemeModeContext.Provider value={value}>{children}</ThemeModeContext.Provider>;
}

export function useThemeMode() {
  const ctx = useContext(ThemeModeContext);
  if (!ctx) throw new Error('useThemeMode must be used inside ThemeModeProvider');
  return ctx;
}
