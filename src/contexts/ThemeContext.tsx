import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { ThemeMode } from '../types/models';
import { themes, applyTheme } from '../config/theme';

interface Ctx { mode: ThemeMode; toggle: () => void; theme: typeof themes.night }
const C = createContext<Ctx | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>(() => {
    const s = localStorage.getItem('aimh-theme');
    return s === 'day' || s === 'night' ? s : 'night';
  });
  const theme = themes[mode];

  useEffect(() => {
    localStorage.setItem('aimh-theme', mode);
    applyTheme(theme);
  }, [mode, theme]);

  return <C.Provider value={{ mode, toggle: () => setMode(m => m === 'day' ? 'night' : 'day'), theme }}>{children}</C.Provider>;
}

export function useTheme(): Ctx {
  const ctx = useContext(C);
  if (!ctx) throw new Error('useTheme needs ThemeProvider');
  return ctx;
}
